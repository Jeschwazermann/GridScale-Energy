import { supabaseAdmin, supabaseForUser } from "../lib/supabase.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

/**
 * Create a new consumption profile for a customer.
 * Uses supabaseAdmin — installer_id is stamped server-side and RLS
 * would otherwise block the insert before we can set it.
 */
export async function createProfile(profileData, appliances, installerId) {
  const { data: profile, error: profileErr } = await supabaseAdmin
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

  if (appliances && appliances.length > 0) {
    const rows = appliances.map((a, i) => ({
      ...a,
      profile_id: profile.id,
      sort_order: a.sort_order ?? i,
    }));

    const { error: appErr } = await supabaseAdmin
      .from("profile_appliances")
      .insert(rows);

    if (appErr) {
      logger.error("createProfile: appliances insert failed", {
        error: appErr,
        profileId: profile.id,
      });
      throw new AppError(
        `Profile created but appliances failed: ${appErr.message}`,
        500,
      );
    }
  }

  const { data: updated, error: fetchErr } = await supabaseAdmin
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
 * supabaseForUser — RLS scopes to the calling installer's data.
 */
export async function getProfileWithAppliances(profileId, token) {
  const client = supabaseForUser(token);

  const { data, error } = await client.rpc("get_profile_with_appliances", {
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
 * supabaseForUser — RLS ensures installers only see their own customers.
 */
export async function getProfilesByCustomer(customerId, token) {
  const client = supabaseForUser(token);

  const { data, error } = await client
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
 * supabaseForUser — RLS prevents cross-installer edits.
 */
export async function updateProfile(profileId, updates, token) {
  const client = supabaseForUser(token);

  const { data, error } = await client
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
 * supabaseForUser — RLS prevents cross-installer writes.
 * Delete uses supabaseAdmin to avoid RLS blocking the delete on
 * profile_appliances (child table may not have installer_id directly).
 * Insert uses supabaseAdmin for the same reason — profile ownership
 * is already verified by the parent row's RLS on consumption_profiles.
 */
export async function updateProfileAppliances(profileId, appliances, token) {
  // Ownership check via user-scoped client before we touch anything
  const client = supabaseForUser(token);
  const { error: ownerErr } = await client
    .from("consumption_profiles")
    .select("id")
    .eq("id", profileId)
    .single();

  if (ownerErr) {
    if (ownerErr.code === "PGRST116")
      throw new AppError("Profile not found", 404);
    throw new AppError("Unauthorised", 403);
  }

  // Safe to proceed with admin client for child-table ops
  const { error: delErr } = await supabaseAdmin
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

  if (!appliances || appliances.length === 0) return [];

  const rows = appliances.map((a, i) => ({
    ...a,
    profile_id: profileId,
    sort_order: a.sort_order ?? i,
  }));

  const { data, error: insErr } = await supabaseAdmin
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
 * Ownership check via user-scoped client; delete via admin to
 * avoid FK/cascade RLS complications on the child table.
 */
export async function deleteProfile(profileId, token) {
  const client = supabaseForUser(token);
  const { error: ownerErr } = await client
    .from("consumption_profiles")
    .select("id")
    .eq("id", profileId)
    .single();

  if (ownerErr) {
    if (ownerErr.code === "PGRST116")
      throw new AppError("Profile not found", 404);
    throw new AppError("Unauthorised", 403);
  }

  const { error } = await supabaseAdmin
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
// Template library — global data, no RLS needed
// ---------------------------------------------------------------------------

export async function getApplianceTemplates(profileType) {
  const { data, error } = await supabaseAdmin.rpc("get_appliance_templates", {
    p_profile_type: profileType,
  });

  if (error) {
    logger.error("getApplianceTemplates: RPC failed", { error, profileType });
    throw new AppError(error.message, 500);
  }

  return data;
}

// ---------------------------------------------------------------------------
// Sizing engine integration — internal server-side call, admin is correct
// ---------------------------------------------------------------------------

export async function getProfileForSizing(profileId) {
  const { data, error } = await supabaseAdmin
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
