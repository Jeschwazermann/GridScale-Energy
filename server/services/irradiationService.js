/**
 * irradiationService.js
 *
 * Fetches solar irradiance data for a customer/assessment location and
 * feeds it into the sizing pipeline. Two external calls are involved:
 *   1. Geocoding  (address string -> lat/lng)
 *   2. NASA POWER (lat/lng -> monthly irradiance climatology)
 *
 * Both are cached aggressively — irradiance doesn't change year to year
 * in any way that matters for sizing, and geocoding a fixed address
 * string will always resolve to the same point.
 *
 * ── Location precision tiers ──────────────────────────────────────────
 * 1. Full address  (best)   — geocodes to a specific point
 * 2. LGA + state   (middle) — geocodes to a Local Government Area, a
 *    real Nigerian administrative unit, much tighter than a whole state
 * 3. State only    (worst)  — flat constant from STATE_FALLBACK table,
 *    no geocoding attempted
 *
 * ── Adjust to match your project ─────────────────────────────────────
 * - `supabaseAdmin` below should be swapped for however your other
 *   backend services import the service-role Supabase client
 *   (e.g. `import { supabaseAdmin } from "../lib/supabase"`).

 */

import { supabaseAdmin } from "../lib/supabase.js";

const NASA_POWER_BASE_URL =
  process.env.NASA_POWER_URL ||
  "https://power.larc.nasa.gov/api/temporal/climatology/point";
const NOMINATIM_BASE_URL =
  process.env.NOMINATIM_URL || "https://nominatim.openstreetmap.org/search";

// Round coordinates to ~11km grid cells so nearby customers share a
// cache entry instead of triggering a fresh NASA POWER call each time.
const GRID_PRECISION = 1; // decimal places (0.1° ≈ 11km at the equator)

// Fallback peak-sun-hours by state, used only if geocoding or NASA POWER
// both fail, or no address/LGA is available at all. Rough Southwest
// Nigeria averages — replace with better data as you get it. Keeps the
// sizing flow from blocking on an API outage.
const STATE_FALLBACK_KWH_PER_M2_PER_DAY = {
  Lagos: 4.4,
  Ogun: 4.5,
  Oyo: 4.6,
  Osun: 4.6,
  Ondo: 4.5,
  Ekiti: 4.7,
  default: 4.5,
};

function roundCoord(value) {
  return Number(value.toFixed(GRID_PRECISION));
}

/**
 * Geocode an arbitrary location string to lat/lng, using a Supabase-backed
 * cache keyed on the normalized text. Used for both full addresses and
 * "LGA, state" strings — the cache doesn't care which tier it came from.
 */
async function geocodeText(locationText) {
  const normalized = locationText.trim().toLowerCase();

  const { data: cached, error: cacheReadError } = await supabaseAdmin
    .from("geocode_cache")
    .select("latitude, longitude")
    .eq("address_key", normalized)
    .maybeSingle();

  if (cacheReadError) {
    console.error("geocode_cache read error:", cacheReadError.message);
  }
  if (cached) {
    return { latitude: cached.latitude, longitude: cached.longitude };
  }

  const url = new URL(NOMINATIM_BASE_URL);
  url.searchParams.set("q", `${locationText}, Nigeria`);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const response = await fetch(url.toString(), {
    headers: {
      // Nominatim usage policy requires a descriptive User-Agent
      "User-Agent": "GridScaleAfrica/1.0 (support@gridscaleafrica.com)",
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding request failed: ${response.status}`);
  }

  const results = await response.json();
  if (!results.length) {
    return null; // caller falls back to the next precision tier
  }

  const latitude = parseFloat(results[0].lat);
  const longitude = parseFloat(results[0].lon);

  const { error: cacheWriteError } = await supabaseAdmin
    .from("geocode_cache")
    .insert({ address_key: normalized, latitude, longitude });

  if (cacheWriteError) {
    console.error("geocode_cache write error:", cacheWriteError.message);
  }

  return { latitude, longitude };
}

/**
 * Fetch monthly + annual solar irradiance for a lat/lng from NASA POWER,
 * using a Supabase-backed cache keyed on rounded coordinates.
 */
async function fetchIrradiance(latitude, longitude) {
  const latKey = roundCoord(latitude);
  const lngKey = roundCoord(longitude);

  const { data: cached, error: cacheReadError } = await supabaseAdmin
    .from("irradiation_cache")
    .select("monthly_data, annual_avg")
    .eq("lat_rounded", latKey)
    .eq("lng_rounded", lngKey)
    .maybeSingle();

  if (cacheReadError) {
    console.error("irradiation_cache read error:", cacheReadError.message);
  }
  if (cached) {
    return { monthlyData: cached.monthly_data, annualAvg: cached.annual_avg };
  }

  const url = new URL(NASA_POWER_BASE_URL);
  url.searchParams.set("parameters", "ALLSKY_SFC_SW_DWN");
  url.searchParams.set("community", "RE");
  url.searchParams.set("longitude", longitude);
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("format", "JSON");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`NASA POWER request failed: ${response.status}`);
  }

  const payload = await response.json();
  const values = payload?.properties?.parameter?.ALLSKY_SFC_SW_DWN;

  if (!values) {
    throw new Error("NASA POWER response missing expected irradiance data");
  }

  // Response keys: JAN..DEC plus ANN (annual average)
  const monthKeys = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const monthlyData = monthKeys.map((key) => values[key]);
  const annualAvg =
    values.ANN ??
    monthlyData.reduce((sum, v) => sum + v, 0) / monthlyData.length;

  const { error: cacheWriteError } = await supabaseAdmin
    .from("irradiation_cache")
    .insert({
      lat_rounded: latKey,
      lng_rounded: lngKey,
      monthly_data: monthlyData,
      annual_avg: annualAvg,
    });

  if (cacheWriteError) {
    console.error("irradiation_cache write error:", cacheWriteError.message);
  }

  return { monthlyData, annualAvg };
}

/**
 * Attempt to geocode + fetch irradiance for a given location string.
 * Returns null (rather than throwing) if geocoding comes back empty,
 * so callers can fall through to the next precision tier. Genuine
 * network/API errors still throw — those are caught one level up in
 * getIrradianceForLocation, which is the only function that decides
 * when to give up and use the flat state constant.
 */
async function resolveIrradianceForText(locationText) {
  const coords = await geocodeText(locationText);
  if (!coords) return null;

  const { monthlyData, annualAvg } = await fetchIrradiance(
    coords.latitude,
    coords.longitude,
  );

  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    monthlyData,
    annualAvg,
    worstMonth: Math.min(...monthlyData),
  };
}

/**
 * Public entry point: given an address, LGA, and state (each optional,
 * in descending order of precision), return irradiance data suitable
 * for solar sizing.
 *
 * Precision tiers attempted in order:
 *   1. address              -> geocode directly
 *   2. lga + state          -> geocode "{lga}, {state}, Nigeria"
 *   3. state alone          -> flat constant, no geocoding
 *
 * Returns:
 *   {
 *     source: "address" | "lga" | "fallback",
 *     latitude, longitude,       // null when source is "fallback"
 *     monthlyData: number[12] | null,
 *     annualAvg: number,
 *     worstMonth: number,        // the value sizing should actually use
 *   }
 */
export async function getIrradianceForLocation({ address, lga, state }) {
  if (address) {
    try {
      const result = await resolveIrradianceForText(address);
      if (result) {
        return { source: "address", ...result };
      }
      // Geocoding returned no match for this address — fall through
      // to the LGA tier rather than giving up immediately.
    } catch (err) {
      console.error(
        "Address-level irradiance lookup failed, trying LGA:",
        err.message,
      );
    }
  }

  if (lga && state) {
    try {
      const result = await resolveIrradianceForText(`${lga}, ${state}`);
      if (result) {
        return { source: "lga", ...result };
      }
    } catch (err) {
      console.error(
        "LGA-level irradiance lookup failed, using state fallback:",
        err.message,
      );
    }
  }

  // Final fallback: no usable address or LGA, or both geocoding
  // attempts failed/returned nothing.
  const fallbackValue =
    STATE_FALLBACK_KWH_PER_M2_PER_DAY[state] ??
    STATE_FALLBACK_KWH_PER_M2_PER_DAY.default;

  return {
    source: "fallback",
    latitude: null,
    longitude: null,
    monthlyData: null,
    annualAvg: fallbackValue,
    worstMonth: fallbackValue,
  };
}
