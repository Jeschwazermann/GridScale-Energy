/* ─── Configurable constants ────────────────────────────────── */
// DIVERSITY_FACTOR: 25% buffer for secondary/unreported appliances
const DIVERSITY_FACTOR = 1.25;

// SYSTEM_EFFICIENCY: 80% — accounts for inverter, battery & wiring losses
const SYSTEM_EFFICIENCY = 0.8;

/**
 * Calculate energy consumption and split between grid and generator.
 *
 * item.days is days/year (0–365), confirmed from the CalculatorPage.jsx
 * appliance form ("Days/Year" column, max="365"). The accumulator therefore
 * produces annualKWh directly — no ×365 multiplier is needed.
 *
 * Daily figures are derived from annual (÷365). Solar sizing uses
 * effectiveDailyKWh — the worst daily cycle the system must satisfy.
 *
 * @param {Array}   appliances      - [{ power, hours, days, units }]
 *                                    days = days/year (0–365)
 * @param {number}  gridHoursPerDay - Hours of grid supply per day (0–24)
 * @param {number}  genHoursPerDay  - Hours of generator supply per day (0–24)
 * @param {boolean} includeDiversity - Apply 25% diversity factor for sizing (default: false)
 * @returns {Object} Energy calculation results
 */
export const calculateEnergy = (
  appliances,
  gridHoursPerDay = 24,
  genHoursPerDay = 0,
  includeDiversity = false,
) => {
  /* 1. Annual consumption
   *
   * power(W) × hours/day × days/year × units ÷ 1000 = kWh/year
   * Accumulates to annualKWh directly — item.days already encodes the yearly fraction.
   */
  let annualKWh = 0;
  appliances.forEach((item) => {
    annualKWh += (item.power * item.hours * item.days * item.units) / 1000;
  });

  /* 2. Daily figure derived from annual */
  const dailyKWh = annualKWh / 365;

  /* 3. Grid / generator split */
  const clampedGridHrs = Math.min(Math.max(gridHoursPerDay, 0), 24);
  const gridFraction = clampedGridHrs / 24;

  let genFraction = 0;
  let actualGenHours = 0;
  if (genHoursPerDay != null && genHoursPerDay > 0) {
    const clampedGenHrs = Math.min(
      Math.max(genHoursPerDay, 0),
      24 - clampedGridHrs,
    );
    actualGenHours = clampedGenHrs;
    genFraction = clampedGenHrs / 24;
  }

  const unpoweredHours = 24 - clampedGridHrs - actualGenHours;

  /* 4. Effective load — for solar sizing ONLY
   *
   * Sizing targets the worst daily cycle:
   *   "panels must harvest this much tomorrow; battery must hold this much tonight."
   *
   * Diversity factor (optional): +25% for unreported / secondary appliances.
   * System efficiency (80%): accounts for inverter, battery and wiring losses.
   */
  const diversityMultiplier = includeDiversity ? DIVERSITY_FACTOR : 1.0;
  const afterDiversity = dailyKWh * diversityMultiplier;
  const effectiveDailyKWh = afterDiversity / SYSTEM_EFFICIENCY;
  const effectiveAnnualKWh = effectiveDailyKWh * 365; // for cost accounting only

  /* 5. Peak simultaneous load — for inverter sizing
   *
   * The inverter must handle the worst-case instantaneous draw: all appliances
   * running at once. item.days doesn't factor in here — on any given day any
   * appliance could be on, so we sum all of them.
   */
  const peakLoadKw = appliances.reduce((sum, item) => {
    return sum + (item.power * item.units) / 1000;
  }, 0);

  return {
    /* ── Raw consumption (what the user actually uses) ── */
    dailyKWh,
    annualKWh,
    monthlyKWh: annualKWh / 12,

    /* ── Grid / generator split (annual kWh by source) ── */
    gridKWh: annualKWh * gridFraction,
    offGridKWh: annualKWh * genFraction,
    gridHoursPerDay: clampedGridHrs,
    genHoursPerDay: actualGenHours,
    unpoweredHours,
    gridFraction,
    genFraction,

    /* ── For solar sizing (daily-cycle basis) ── */
    effectiveDailyKWh,
    effectiveAnnualKWh, // used in solarService for cost-per-kWh; NOT a sizing input

    /* ── For inverter sizing ── */
    peakLoadKw,

    /* ── Breakdown (for transparency / UI display) ── */
    breakdown: {
      dailyKWh,
      annualKWh,
      diversityMultiplier,
      diversityAdditionKWh: dailyKWh * (diversityMultiplier - 1),
      systemEfficiency: SYSTEM_EFFICIENCY,
      systemLossKWh: effectiveDailyKWh - afterDiversity,
      effectiveDailyKWh,
      effectiveAnnualKWh,
    },
  };
};
