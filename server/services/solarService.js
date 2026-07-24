/**
 * Calculate solar costs using annualised CAPEX.
 *
 * Cost per kWh uses ACTUAL consumption (energy.annualKWh) — what the user
 * pays for — not the effective load that includes diversity and system losses.
 * This gives the honest cost of useful delivered energy.
 *
 * effectiveAnnualKWh is kept for internal reference and transparency only.
 *
 * @param {Object} energy                  - Energy object from calculateEnergy()
 * @param {number} capex                   - Total capital expenditure in ₦
 * @param {number} lifespan                - System lifespan in years (default: 25)
 * @param {number} oAndMPercent            - Annual O&M as decimal (default: 0.015 = 1.5%)
 * @param {number} batteryReplacementYears - Battery replacement interval in years (default: 8)
 * @param {number} batteryCapex            - Battery portion of CAPEX in ₦ (for replacement)
 * @returns {Object} Solar cost breakdown
 */
export const solarCost = (
  energy,
  capex,
  lifespan = 25,
  oAndMPercent = 0.015,
  batteryReplacementYears = 8,
  batteryCapex = 0,
) => {
  /* ── Annualised CAPEX (straight-line) ── */
  const annualizedCapex = capex / lifespan;

  /* ── Annual O&M ── */
  const annualOandM = capex * oAndMPercent;

  /* ── Battery replacement cost ── */
  let annualBatteryReplacement = 0;
  if (batteryCapex > 0 && batteryReplacementYears > 0) {
    const numReplacements = Math.floor(lifespan / batteryReplacementYears);
    annualBatteryReplacement = (batteryCapex * numReplacements) / lifespan;
  }

  const annualCost = annualizedCapex + annualOandM + annualBatteryReplacement;
  const monthlyCost = annualCost / 12;
  const dailyCost = annualCost / 365;

  /* ── Cost per kWh ──────────────────────────────────────────────────────────
   *
   * costPerKWh          → divide by actual consumption (what the user pays for).
   *                        This is the number to show the user and compare
   *                        against grid tariff and generator cost/kWh.
   *
   * costPerEffectiveKWh → divide by effective load (includes diversity + losses).
   *                        Used internally to flag oversized systems in
   *                        comparisonService.
   *
   * Both fields are now drawn from the top-level energy object.
   */
  const costPerKWh = annualCost / energy.annualKWh;
  const costPerEffectiveKWh = annualCost / energy.effectiveAnnualKWh;

  return {
    annualCost,
    monthlyCost,
    dailyCost,
    costPerKWh, // FOR DISPLAY — compare against grid/generator rate
    costPerEffectiveKWh, // INTERNAL — used by comparisonService oversized check
    breakdown: {
      capex,
      lifespan,
      annualizedCapex,
      annualOandM,
      annualBatteryReplacement,
      oAndMPercent,
      batteryReplacementYears,
      effectiveLoadKWh: energy.effectiveAnnualKWh,
      actualLoadKWh: energy.annualKWh,
    },
  };
};
