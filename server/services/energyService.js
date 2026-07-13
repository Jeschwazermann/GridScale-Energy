/* ─── Configurable constants 
   Change these when better local data becomes available. */
const DIVERSITY_FACTOR = 1.25; // 25% buffer for secondary/unreported appliances
const SYSTEM_EFFICIENCY = 0.8; // 80% — accounts for inverter, battery & wiring losses

export const calculateEnergy = (
  appliances,
  gridHoursPerDay = 24,
  genHoursPerDay = null,
) => {
  /* 1. Raw consumption from user inputs */
  let annualKWh = 0;
  appliances.forEach((item) => {
    const kWh = (item.power * item.hours * item.days * item.units) / 1000;
    annualKWh += kWh;
  });

  /* 2. Grid / generator split — each source has its own independent fraction.
        Grid and generator hours are specified separately by the user.
        They can add up to less than 24hrs (unpowered downtime is valid).
        The only constraint enforced upstream is that combined hrs ≤ 24.

        If genHoursPerDay is not provided (legacy callers or grid-only mode),
        it falls back to the old derived behaviour: offGrid = 24 - gridHours. */
  const clampedGridHrs = Math.min(Math.max(gridHoursPerDay, 0), 24);
  const gridFraction = clampedGridHrs / 24;

  let genFraction;
  if (genHoursPerDay != null) {
    const clampedGenHrs = Math.min(
      Math.max(genHoursPerDay, 0),
      24 - clampedGridHrs, // can't exceed remaining hours
    );
    genFraction = clampedGenHrs / 24;
  } else {
    // Legacy fallback: generator covers whatever grid doesn't
    genFraction = 1 - gridFraction;
  }

  /* 3. Effective load — used for solar system sizing and CAPEX estimation only.
        Step A: apply diversity factor (secondary appliances)
        Step B: divide by efficiency (inverter + battery + wiring losses) */
  const afterDiversity = annualKWh * DIVERSITY_FACTOR;
  const effectiveAnnualKWh = afterDiversity / SYSTEM_EFFICIENCY;

  return {
    /* ── For cost engines (raw) ── */
    annualKWh,
    monthlyKWh: annualKWh / 12,
    gridKWh: annualKWh * gridFraction,
    offGridKWh: annualKWh * genFraction, // generator's share of the load
    gridHoursPerDay,
    genHoursPerDay: genHoursPerDay ?? 24 - clampedGridHrs, // preserve for display

    /* ── For CAPEX estimation (corrected) ── */
    effectiveAnnualKWh,
    effectiveDailyKWh: effectiveAnnualKWh / 365,

    /* ── Breakdown for transparency display ── */
    breakdown: {
      rawAnnualKWh: annualKWh,
      diversityAdditionKWh: annualKWh * (DIVERSITY_FACTOR - 1), // the added 25%
      systemLossKWh: effectiveAnnualKWh - afterDiversity, // the efficiency gap
      effectiveAnnualKWh,
    },
  };
};
