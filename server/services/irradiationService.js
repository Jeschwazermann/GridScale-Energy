import { supabaseAdmin } from "../lib/supabase.js";
import { logger } from "../utils/logger.js";

const NASA_POWER_BASE_URL =
  process.env.NASA_POWER_URL ||
  "https://power.larc.nasa.gov/api/temporal/climatology/point";
const NOMINATIM_BASE_URL =
  process.env.NOMINATIM_URL || "https://nominatim.openstreetmap.org/search";

const GRID_PRECISION = 1;

const STATE_FALLBACK = {
  Lagos: { annual: 4.4, worstMonth: 3.8 },
  Ogun: { annual: 4.5, worstMonth: 3.9 },
  Oyo: { annual: 4.6, worstMonth: 4.0 },
  Osun: { annual: 4.6, worstMonth: 4.0 },
  Ondo: { annual: 4.5, worstMonth: 3.9 },
  Ekiti: { annual: 4.7, worstMonth: 4.1 },
  default: { annual: 4.5, worstMonth: 3.8 },
};

function roundCoord(value) {
  return Number(value.toFixed(GRID_PRECISION));
}

// ─── Retry utility ───────────────────────────────────────────────────────────

const RETRY_DEFAULTS = {
  maxAttempts: 3,
  baseDelayMs: 500, // 500ms → 1000ms → 2000ms
  maxDelayMs: 10_000,
  jitter: true, // avoids thundering-herd on shared upstream
};

async function fetchWithRetry(url, fetchOptions = {}, retryOptions = {}) {
  const { maxAttempts, baseDelayMs, maxDelayMs, jitter } = {
    ...RETRY_DEFAULTS,
    ...retryOptions,
  };

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let response;

    try {
      response = await fetch(url, fetchOptions);
    } catch (networkErr) {
      lastError = networkErr;
      if (attempt === maxAttempts) break;

      const delay = computeDelay(attempt, baseDelayMs, maxDelayMs, jitter);
      logger.warn("fetchWithRetry network error", {
        attempt,
        maxAttempts,
        url: url.toString(),
        error: networkErr.message,
      });
      await sleep(delay);
      continue;
    }

    if (response.ok) return response;

    if (response.status === 429 || response.status >= 500) {
      lastError = new Error(`HTTP ${response.status} from ${url}`);
      if (attempt === maxAttempts) break;

      const retryAfterHeader = response.headers.get("Retry-After");
      const retryAfterMs = retryAfterHeader
        ? parseRetryAfter(retryAfterHeader)
        : null;

      const delay =
        retryAfterMs ?? computeDelay(attempt, baseDelayMs, maxDelayMs, jitter);

      logger.warn(
        `[fetchWithRetry] HTTP ${response.status} on attempt ${attempt}/${maxAttempts}. ` +
          `Retrying in ${delay}ms…`,
      );
      await sleep(delay);
      continue;
    }

    // Non-retryable HTTP error (4xx except 429)
    throw new Error(`HTTP ${response.status} from ${url}`);
  }

  throw (
    lastError ??
    new Error(`fetchWithRetry exhausted after ${maxAttempts} attempts`)
  );
}

function computeDelay(attempt, baseDelayMs, maxDelayMs, jitter) {
  const exponential = baseDelayMs * 2 ** (attempt - 1);
  const capped = Math.min(exponential, maxDelayMs);
  return jitter ? capped * (0.8 + Math.random() * 0.4) : capped;
}

function parseRetryAfter(header) {
  const seconds = Number(header);
  if (!Number.isNaN(seconds)) return seconds * 1000;
  const date = Date.parse(header);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Geocoding ───────────────────────────────────────────────────────────────

async function geocodeText(locationText) {
  const normalized = locationText.trim().toLowerCase();

  const { data: cached, error: cacheReadError } = await supabaseAdmin
    .from("geocode_cache")
    .select("latitude, longitude")
    .eq("address_key", normalized)
    .maybeSingle();

  if (cacheReadError) {
    logger.error("geocode_cache read failed", {
      error: cacheReadError.message,
      address: normalized,
    });
  }

  // Cache hit — return immediately
  if (cached) {
    return { latitude: cached.latitude, longitude: cached.longitude };
  }

  // Cache miss — call Nominatim
  const url = new URL(NOMINATIM_BASE_URL);
  url.searchParams.set("q", `${locationText}, Nigeria`);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const response = await fetchWithRetry(
    url.toString(),
    {
      headers: {
        "User-Agent": "GridScaleAfrica/1.0 (support@gridscaleafrica.com)",
      },
    },
    { maxAttempts: 3, baseDelayMs: 1_000 }, // 1s → 2s → 4s
  );

  const results = await response.json();
  if (!results.length) return null;

  const latitude = parseFloat(results[0].lat);
  const longitude = parseFloat(results[0].lon);

  const { error: cacheWriteError } = await supabaseAdmin
    .from("geocode_cache")
    .insert({ address_key: normalized, latitude, longitude });

  if (cacheWriteError) {
    logger.error("geocode_cache write error:", {
      error: cacheWriteError.message,
    });
  }

  return { latitude, longitude };
}

// ─── NASA POWER irradiance ────────────────────────────────────────────────────

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
    // Log the read error but do NOT abort — fall through to NASA fetch
    logger.error("irradiation_cache read failed", {
      error: cacheReadError.message,
      lat: latKey,
      lng: lngKey,
    });
  }

  // Cache hit — return immediately
  if (cached) {
    return {
      monthlyData: cached.monthly_data,
      annualAvg: cached.annual_avg,
    };
  }

  // Cache miss — fetch from NASA POWER
  const url = new URL(NASA_POWER_BASE_URL);
  url.searchParams.set("parameters", "ALLSKY_SFC_SW_DWN");
  url.searchParams.set("community", "RE");
  url.searchParams.set("longitude", longitude);
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("format", "JSON");

  const response = await fetchWithRetry(
    url.toString(),
    {},
    { maxAttempts: 4, baseDelayMs: 500 }, // 500ms → 1s → 2s → 4s
  );

  const payload = await response.json();
  const values = payload?.properties?.parameter?.ALLSKY_SFC_SW_DWN;

  if (!values) {
    throw new Error("NASA POWER response missing expected irradiance data");
  }

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

  // Write to cache (non-fatal if it fails)
  const { error: cacheWriteError } = await supabaseAdmin
    .from("irradiation_cache")
    .insert({
      lat_rounded: latKey,
      lng_rounded: lngKey,
      monthly_data: monthlyData,
      annual_avg: annualAvg,
    });

  if (cacheWriteError) {
    logger.error("irradiation_cache write error:", {
      error: cacheWriteError.message,
    });
  }

  return { monthlyData, annualAvg };
}

// ─── Internal helper ──────────────────────────────────────────────────────────

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

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getIrradianceForLocation({ address, lga, state }) {
  // Tier 1: Address-level geocode
  if (address) {
    try {
      const result = await resolveIrradianceForText(address);
      if (result) return { source: "address", ...result };
    } catch (err) {
      logger.warn(
        "Address-level irradiance lookup failed, falling back to LGA",
        {
          address,
          error: err.message,
        },
      );
    }
  }

  // Tier 2: LGA + State geocode
  if (lga && state) {
    try {
      const result = await resolveIrradianceForText(`${lga}, ${state}`);
      if (result) return { source: "lga", ...result };
    } catch (err) {
      logger.warn("LGA-level irradiance lookup failed, using state fallback", {
        lga,
        state,
        error: err.message,
      });
    }
  }

  // Tier 3: State static fallback
  const fallback = STATE_FALLBACK[state] || STATE_FALLBACK.default;
  return {
    source: "fallback",
    latitude: null,
    longitude: null,
    monthlyData: null,
    annualAvg: fallback.annual,
    worstMonth: fallback.worstMonth,
    stateUsed: state || "default",
  };
}
