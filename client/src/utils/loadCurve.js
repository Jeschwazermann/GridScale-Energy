/**
 * loadCurveUtils.js
 * GridScale Africa — frontend utility
 *
 * Pure functions for working with 24h load curves on the client side.
 * No Supabase, no AppError, no logger — safe to import in any React component.
 *
 * The DB trigger (compute_load_curve in 002_load_curve_function.sql) is the
 * authoritative computation that runs on save. This mirrors that logic so
 * Step 2 and Step 4 can show a live preview without a round trip.
 */

/**
 * Build a 24-element kWh load curve from an appliance list.
 *
 * @param {Array} appliances - Array of appliance objects with:
 *   quantity       {number}
 *   watts          {number}
 *   hours_weekday  {number}
 *   load_factor    {number}  defaults to 1.0 if omitted
 *   active_hours   {number[] | null}  clock hours (0–23) when active
 *
 * @returns {number[]} 24-element array — index = clock hour (0 = midnight)
 */
export function buildLoadCurveClient(appliances = []) {
  const curve = new Array(24).fill(0);

  for (const app of appliances) {
    const qty = Number(app.quantity) || 0;
    const watts = Number(app.watts) || 0;
    const loadFactor = Number(app.load_factor) || 1.0;
    const hoursWkday = Number(app.hours_weekday) || 0;

    if (qty === 0 || watts === 0) continue;

    // Effective watts per hour when running
    const whPerHour = qty * watts * loadFactor;

    const activeHours = app.active_hours;

    if (Array.isArray(activeHours) && activeHours.length > 0) {
      // Distribute load only across the specified clock hours
      for (const h of activeHours) {
        const hour = Number(h);
        if (hour >= 0 && hour <= 23) {
          curve[hour] += whPerHour / 1000; // convert Wh → kWh
        }
      }
    } else if (hoursWkday > 0) {
      // No active_hours supplied — spread flat starting from hour 0
      // (fallback; same behaviour as the DB function)
      const numHours = Math.min(Math.round(hoursWkday), 24);
      for (let h = 0; h < numHours; h++) {
        curve[h] += whPerHour / 1000;
      }
    }
  }

  // Round to 3dp to match DB output and avoid float noise in display
  return curve.map((v) => Math.round(v * 1000) / 1000);
}

/**
 * Derive summary stats from a load curve and appliance list.
 * Used by StepReview to avoid re-computing what ProfileBuilder already has.
 *
 * @param {Array}    appliances
 * @param {number[]} curve       output of buildLoadCurveClient
 * @returns {object}
 */
export function summariseProfile(appliances = [], curve = []) {
  const totalWeekday = appliances.reduce(
    (acc, a) =>
      acc +
      (Number(a.quantity) *
        Number(a.watts) *
        (Number(a.load_factor) || 1) *
        Number(a.hours_weekday)) /
        1000,
    0,
  );

  const totalWeekend = appliances.reduce(
    (acc, a) =>
      acc +
      (Number(a.quantity) *
        Number(a.watts) *
        (Number(a.load_factor) || 1) *
        Number(a.hours_weekend)) /
        1000,
    0,
  );

  const peakW = appliances.reduce(
    (acc, a) => acc + Number(a.quantity) * Number(a.watts),
    0,
  );

  const criticalW = appliances
    .filter((a) => a.is_critical)
    .reduce(
      (acc, a) =>
        acc +
        Number(a.quantity) * Number(a.watts) * (Number(a.load_factor) || 1),
      0,
    );

  const criticalItems = appliances
    .filter((a) => a.is_critical)
    .map((a) => a.appliance_name);

  const maxKwh = Math.max(...curve, 0);
  const peakHour = curve.indexOf(maxKwh);

  return {
    totalWeekday: Number(totalWeekday.toFixed(2)),
    totalWeekend: Number(totalWeekend.toFixed(2)),
    peakW: Math.round(peakW),
    criticalW: Math.round(criticalW),
    criticalItems,
    peakHour,
    peakKwh: maxKwh,
  };
}
