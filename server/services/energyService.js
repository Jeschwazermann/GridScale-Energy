/* ─── Configurable constants 
   Change these when better local data becomes available. */
const DIVERSITY_FACTOR = 1.25; // 25% buffer for secondary/unreported appliances
const SYSTEM_EFFICIENCY = 0.8; // 80% — accounts for inverter, battery & wiring losses

export const calculateEnergy = (appliances, gridHoursPerDay = 24) => {
  /* 1. Raw consumption from user inputs */
  let annualKWh = 0;
  appliances.forEach((item) => {
    const kWh = (item.power * item.hours * item.days * item.units) / 1000;
    annualKWh += kWh;
  });

  /* 2. Grid / generator split — based on raw consumption.
        Cost engines (grid, generator) only charge for what the
        user actually consumes, not the system sizing load. */
  const gridFraction = Math.min(Math.max(gridHoursPerDay, 0), 24) / 24;
  const offGridFraction = 1 - gridFraction;

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
    offGridKWh: annualKWh * offGridFraction,
    gridHoursPerDay,

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
