/* ─── Standard Nigerian inverter sizes (kVA) ───────────────── */
const INVERTER_SIZES = [1, 1.5, 2, 3, 3.5, 5, 6, 7.5, 8, 10, 12, 15, 20];

/* ─── Panel configuration ───────────────────────────────────── */
const PANEL_WP = 400;

/* ─── Battery: LiFePO4 100Ah @ 48V = 4.8kWh per unit ───────── */
const BATTERY_KWH_PER_UNIT = 4.8;
const BATTERY_DOD = 0.8;

/* ─── Default PSH (used when no location data available) ───── */
const DEFAULT_PEAK_SUN_HOURS = 4.5;

/* ─── Panel loss factors ─────────────────────────────────────── */
// Applied to panel array sizing only — accounts for heat, wiring, mismatch
const TEMPERATURE_LOSS = 1.08; // 8%  Nigeria's hot climate
const WIRING_MISMATCH_LOSS = 1.05; // 5%  wiring + mismatch
const PANEL_LOSS_MULTIPLIER = TEMPERATURE_LOSS * WIRING_MISMATCH_LOSS; // ~1.134

/* ─── Inverter sizing factors ────────────────────────────────── */
// The inverter must handle the instantaneous peak draw of all appliances,
// NOT energy spread over PSH hours (that is a panel calculation).
const SURGE_FACTOR = 1.5; // 50% — motor/compressor startup inrush
const SAFETY_FACTOR = 1.25; // 25% — headroom above continuous peak

/**
 * Size solar system components based on effective daily load.
 *
 * @param {number} effectiveDailyKWh  - Effective daily load from calculateEnergy()
 * @param {Object} options
 * @param {number} options.peakSunHours    - Worst-month irradiance (kWh/m²/day)
 * @param {string} options.irradianceSource - "address" | "lga" | "fallback" | null
 * @param {number} options.peakLoadKw      - Simultaneous peak draw from appliance list (kW)
 *                                           Pass this from the controller for accurate inverter sizing.
 *                                           Falls back to an estimate from effectiveDailyKWh if omitted.
 * @param {number} options.autonomyDays    - Days of battery autonomy (default: 1)
 * @param {number} options.maxInverterKva  - Cap on inverter size returned (default: 20)
 * @returns {Object} System sizing results
 */
export const sizeSystem = (
  effectiveDailyKWh,
  {
    peakSunHours,
    irradianceSource = null,
    peakLoadKw = null,
    autonomyDays = 1,
    maxInverterKva = 20,
  } = {},
) => {
  if (!effectiveDailyKWh || effectiveDailyKWh <= 0) {
    throw new Error("Valid effectiveDailyKWh is required for system sizing.");
  }

  const resolvedPSH = peakSunHours ?? DEFAULT_PEAK_SUN_HOURS;

  /* ── Inverter ──────────────────────────────────────────────────────────────
   *
   * Inverter capacity must cover the peak simultaneous load, not average load.
   *
   * Preferred path: caller passes peakLoadKw = sum(power × units) / 1000
   *   for all appliances the solar system will back up.
   *
   * Fallback (no appliance list available): estimate peak load by assuming
   *   active appliances draw their full load over a conservative 8-hour window.
   *   This is a rough approximation — pass peakLoadKw whenever possible.
   */
  const ACTIVE_HOURS_ESTIMATE = 8; // hours of active use per day (fallback only)

  const continuousPeakKw =
    peakLoadKw != null
      ? peakLoadKw // actual peak from appliance list
      : effectiveDailyKWh / ACTIVE_HOURS_ESTIMATE; // estimated fallback

  // Add safety headroom, then surge margin for motor startup
  const inverterRequiredKw = continuousPeakKw * SAFETY_FACTOR * SURGE_FACTOR;

  // Select the smallest standard size that covers the requirement
  let inverterKva = INVERTER_SIZES.find((s) => s >= inverterRequiredKw);
  if (!inverterKva) {
    inverterKva = Math.min(
      maxInverterKva,
      INVERTER_SIZES[INVERTER_SIZES.length - 1],
    );
  }

  /* ── Solar panels ──────────────────────────────────────────────────────────
   *
   * Panel array must harvest effectiveDailyKWh within the available PSH window,
   * compensating for temperature, wiring and mismatch losses.
   * This IS the correct place to divide by PSH.
   */
  const panelKwpNeeded =
    (effectiveDailyKWh / resolvedPSH) * PANEL_LOSS_MULTIPLIER;
  const panelCount = Math.ceil((panelKwpNeeded * 1000) / PANEL_WP);
  const totalKwp = (panelCount * PANEL_WP) / 1000;

  /* ── Battery bank ──────────────────────────────────────────────────────────
   *
   * Battery must store enough usable energy to cover autonomyDays of load.
   * Usable capacity = total capacity × DoD.
   */
  const batteryKwhNeeded = (effectiveDailyKWh * autonomyDays) / BATTERY_DOD;
  const batteryUnits = Math.ceil(batteryKwhNeeded / BATTERY_KWH_PER_UNIT);
  const totalBatteryKwh = batteryUnits * BATTERY_KWH_PER_UNIT;

  /* ── Estimated CAPEX ──────────────────────────────────────────────────────── */
  const estimatedCapex = calculateEstimatedCapex({
    totalKwp,
    batteryUnits,
    inverterKva,
  });

  return {
    effectiveDailyKWh,
    irradiance: {
      peakSunHours: resolvedPSH,
      source: irradianceSource,
    },
    inverter: {
      sizeKva: inverterKva,
      ratingKw: parseFloat((inverterKva * 0.8).toFixed(1)),
      continuousPeakKw: parseFloat(continuousPeakKw.toFixed(2)),
      peakLoadSource: peakLoadKw != null ? "appliance_list" : "estimated",
      label: `${inverterKva}kVA inverter (${(inverterKva * 0.8).toFixed(1)}kW)`,
    },
    panels: {
      count: panelCount,
      unitWp: PANEL_WP,
      totalKwp: parseFloat(totalKwp.toFixed(2)),
      label: `${panelCount} × ${PANEL_WP}Wp panels (${totalKwp.toFixed(1)}kWp total)`,
    },
    battery: {
      units: batteryUnits,
      kwhPerUnit: BATTERY_KWH_PER_UNIT,
      totalKwh: parseFloat(totalBatteryKwh.toFixed(1)),
      autonomyDays,
      label: `${batteryUnits} × LiFePO4 100Ah/48V (${totalBatteryKwh.toFixed(1)}kWh total)`,
    },
    estimatedCapex,
  };
};

// ─── CAPEX estimate ───────────────────────────────────────────────────────────

/**
 * Rough CAPEX indication based on system components.
 * Nigerian benchmark prices (2024–2025).
 */
function calculateEstimatedCapex({ totalKwp, batteryUnits, inverterKva }) {
  const BENCHMARKS = {
    panelPerWp: 650, // ₦650/Wp  → ₦650,000/kWp
    batteryPerUnit: 600_000, // ₦600,000 per 4.8kWh LiFePO4 unit
    inverterPerKva: 400_000, // ₦400,000/kVA
    bosPercent: 0.12, // 12% Balance of System (cabling, mounting, protection)
    installationPercent: 0.08, // 8%  labour and commissioning
  };

  const panelCost = totalKwp * 1000 * BENCHMARKS.panelPerWp;
  const batteryCost = batteryUnits * BENCHMARKS.batteryPerUnit;
  const inverterCost = inverterKva * BENCHMARKS.inverterPerKva;
  const subTotal = panelCost + batteryCost + inverterCost;
  const bosCost = subTotal * BENCHMARKS.bosPercent;
  const installationCost =
    (subTotal + bosCost) * BENCHMARKS.installationPercent;
  const total = subTotal + bosCost + installationCost;

  return {
    total,
    panelCost,
    batteryCost,
    inverterCost,
    bosCost,
    installationCost,
    benchmarks: BENCHMARKS,
  };
}
