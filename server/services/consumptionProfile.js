import { supabase } from "../lib/supabase.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

/**
 * Create a new consumption profile for a customer.
 * Also bulk-inserts the appliance rows in the same transaction.
 *
 * @param {object} profileData  - Fields from consumption_profiles (minus id, computed cols)
 * @param {Array}  appliances   - Array of profile_appliances rows (minus id, profile_id)
 * @param {string} installerId  - auth.uid() of the calling installer
 * @returns {object}            - { profile, appliances, loadCurve }
 */

export async function createProfile(profileData, appliances, installerId) {
  const { data: profile, error: profileErr } = await supabase
    .from("consumption_profiles")
    .insert({
      ...profileData,
      installer_id: installerId,
    })
    .select()
    .single();

  if (profileErr) {
    logger.error("createProfile: insert failed", {
      error: profileErr,
      installerId,
    });
    throw new AppError(profileErr.message, 500);
  }

  // Bulk-insert appliances
  if (appliances && appliances.length > 0) {
    const rows = appliances.map((a, i) => ({
      ...a,
      profile_id: profile.id,
      sort_order: a.sort_order ?? i,
    }));

    const { error: appErr } = await supabase
      .from("profile_appliances")
      .insert(rows);

    if (appErr) {
      logger.error("createProfile: appliances insert failed", {
        error: appErr,
        profileId: profile.id,
      });
      // Profile exists but appliances failed — still throw so the UI can retry
      throw new AppError(
        `Profile created but appliances failed: ${appErr.message}`,
        500,
      );
    }
  }

  // Fetch the computed load curve (trigger has already run by now)
  const { data: updated, error: fetchErr } = await supabase
    .from("consumption_profiles")
    .select(
      "load_curve_24h, total_daily_kwh_weekday, total_daily_kwh_weekend, peak_demand_watts, critical_load_watts",
    )
    .eq("id", profile.id)
    .single();

  if (fetchErr) {
    logger.warn("createProfile: could not fetch computed curve", {
      profileId: profile.id,
    });
  }

  logger.info("createProfile: success", {
    profileId: profile.id,
    customerId: profileData.customer_id,
    profileType: profileData.profile_type,
    dailyKwh: updated?.total_daily_kwh_weekday,
  });

  return {
    profile: { ...profile, ...updated },
    appliances,
    loadCurve: updated?.load_curve_24h ?? null,
  };
}

/**
 * Fetch a single profile with all its appliances.
 * Uses the get_profile_with_appliances RPC for a single round trip.
 */
export async function getProfileWithAppliances(profileId) {
  const { data, error } = await supabase.rpc("get_profile_with_appliances", {
    p_profile_id: profileId,
  });

  if (error) {
    if (error.code === "P0002") throw new AppError("Profile not found", 404);
    logger.error("getProfileWithAppliances: RPC failed", { error, profileId });
    throw new AppError(error.message, 500);
  }

  return data; // { profile, appliances }
}

/**
 * List all profiles for a customer, newest first.
 * Returns summary fields only (not full appliance list).
 */
export async function getProfilesByCustomer(customerId) {
  const { data, error } = await supabase
    .from("consumption_profiles")
    .select(
      `
      id,
      profile_type,
      total_daily_kwh_weekday,
      total_daily_kwh_weekend,
      peak_demand_watts,
      critical_load_watts,
      grid_hours_weekday,
      grid_hours_weekend,
      peak_period,
      has_critical_loads,
      notes,
      created_at
    `,
    )
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("getProfilesByCustomer: query failed", { error, customerId });
    throw new AppError(error.message, 500);
  }

  return data;
}

/**
 * Update profile header fields (not appliances).
 * Appliance changes go through updateProfileAppliances.
 */
export async function updateProfile(profileId, updates) {
  const { data, error } = await supabase
    .from("consumption_profiles")
    .update(updates)
    .eq("id", profileId)
    .select()
    .single();

  if (error) {
    logger.error("updateProfile: update failed", { error, profileId });
    throw new AppError(error.message, 500);
  }

  return data;
}

/**
 * Replace all appliances for a profile.
 * Delete-then-insert is intentional — the trigger recomputes the curve
 * after the inserts, so we get one final consistent state.
 */
export async function updateProfileAppliances(profileId, appliances) {
  // Delete existing
  const { error: delErr } = await supabase
    .from("profile_appliances")
    .delete()
    .eq("profile_id", profileId);

  if (delErr) {
    logger.error("updateProfileAppliances: delete failed", {
      error: delErr,
      profileId,
    });
    throw new AppError(delErr.message, 500);
  }

  if (!appliances || appliances.length === 0) {
    return [];
  }

  // Re-insert with sort_order
  const rows = appliances.map((a, i) => ({
    ...a,
    profile_id: profileId,
    sort_order: a.sort_order ?? i,
  }));

  const { data, error: insErr } = await supabase
    .from("profile_appliances")
    .insert(rows)
    .select();

  if (insErr) {
    logger.error("updateProfileAppliances: insert failed", {
      error: insErr,
      profileId,
    });
    throw new AppError(insErr.message, 500);
  }

  logger.info("updateProfileAppliances: success", {
    profileId,
    count: data.length,
  });
  return data;
}

/**
 * Delete a profile (cascades to profile_appliances via FK).
 */
export async function deleteProfile(profileId) {
  const { error } = await supabase
    .from("consumption_profiles")
    .delete()
    .eq("id", profileId);

  if (error) {
    logger.error("deleteProfile: delete failed", { error, profileId });
    throw new AppError(error.message, 500);
  }

  logger.info("deleteProfile: success", { profileId });
}

// ---------------------------------------------------------------------------
// Template library
// ---------------------------------------------------------------------------

/**
 * Fetch the appliance template list for a given profile type.
 * Used by the ProfileBuilder Step 1 to pre-populate Step 2.
 */
export async function getApplianceTemplates(profileType) {
  const { data, error } = await supabase.rpc("get_appliance_templates", {
    p_profile_type: profileType,
  });

  if (error) {
    logger.error("getApplianceTemplates: RPC failed", { error, profileType });
    throw new AppError(error.message, 500);
  }

  return data; // Array of template objects
}

// ---------------------------------------------------------------------------
// Sizing engine integration
// ---------------------------------------------------------------------------

/**
 * Fetch the fields the sizing engine needs from a profile.
 * Called by energyService when an assessment has a profile_id.
 *
 * Returns a flat object the engine can consume directly — no need for it
 * to know about the profile table structure.
 */
export async function getProfileForSizing(profileId) {
  const { data, error } = await supabase
    .from("consumption_profiles")
    .select(
      `
      load_curve_24h,
      total_daily_kwh_weekday,
      total_daily_kwh_weekend,
      peak_demand_watts,
      critical_load_watts,
      grid_hours_weekday,
      grid_hours_weekend,
      peak_period,
      generator_hours_day,
      generator_fuel_litres_month,
      generator_fuel_spend_month,
      profile_appliances (
        appliance_name,
        quantity,
        watts,
        hours_weekday,
        is_critical,
        load_factor,
        active_hours
      )
    `,
    )
    .eq("id", profileId)
    .single();

  if (error) {
    if (error.code === "PGRST116") throw new AppError("Profile not found", 404);
    logger.error("getProfileForSizing: query failed", { error, profileId });
    throw new AppError(error.message, 500);
  }

  return {
    loadCurve24h: data.load_curve_24h,
    totalDailyKwhWeekday: data.total_daily_kwh_weekday,
    totalDailyKwhWeekend: data.total_daily_kwh_weekend,
    peakDemandWatts: data.peak_demand_watts,
    criticalLoadWatts: data.critical_load_watts,
    gridHoursWeekday: data.grid_hours_weekday,
    gridHoursWeekend: data.grid_hours_weekend,
    peakPeriod: data.peak_period,
    generatorHoursDay: data.generator_hours_day,
    generatorFuelLitres: data.generator_fuel_litres_month,
    generatorFuelSpend: data.generator_fuel_spend_month,
    appliances: data.profile_appliances,
  };
}

// ---------------------------------------------------------------------------
// Load curve utility (also computed server-side via trigger,
// but useful client-side for the Step 4 preview without a round trip)
// ---------------------------------------------------------------------------

/**
 * Build a 24-element kWh load curve from an appliance list.
 * Mirror of the PostgreSQL compute_load_curve() function — same logic,
 * runs in the browser for instant Step 4 preview before save.
 *
 * @param {Array} appliances - profile_appliances-shaped objects
 * @returns {number[]}       - 24-element array, index = clock hour
 */
export function buildLoadCurveClient(appliances) {
  const curve = new Array(24).fill(0);

  for (const app of appliances) {
    const whPerHour = app.quantity * app.watts * (app.load_factor ?? 1.0);

    if (app.active_hours && app.active_hours.length > 0) {
      for (const h of app.active_hours) {
        if (h >= 0 && h <= 23) {
          curve[h] += whPerHour / 1000;
        }
      }
    } else if (app.hours_weekday > 0) {
      const numHours = Math.min(Math.round(app.hours_weekday), 24);
      for (let h = 0; h < numHours; h++) {
        curve[h] += whPerHour / 1000;
      }
    }
  }

  // Round to 3dp to avoid float noise in display
  return curve.map((v) => Math.round(v * 1000) / 1000);
}
