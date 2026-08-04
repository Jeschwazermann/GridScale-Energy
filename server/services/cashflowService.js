/**
 * Computes a multi-year cashflow projection comparing:
 *   - Diesel-only running costs
 *   - Grid-only running costs (where applicable)
 *   - Diesel + grid hybrid (current reality for most Nigerian customers)
 *   - Solar system: CAPEX + maintenance + battery replacement
 *   - Solar + loan: same but with monthly repayments instead of upfront CAPEX
 *
 * Nigerian market assumptions are isolated in NIGERIA_DEFAULTS so they
 * can be overridden per-assessment without changing the engine logic.
 *
 * Output shape is designed to be frozen into assessments.cashflow_result
 * (JSONB) and consumed directly by the CashflowChart React component.
 */

import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

// ---------------------------------------------------------------------------
// Nigerian market defaults
// All rates are annual. Change here and every projection updates.
// ---------------------------------------------------------------------------

export const NIGERIA_DEFAULTS = {
  // Fuel escalation — NNPC pump price history suggests ~15%/yr average
  // over the last decade (pre- and post-subsidy removal cycles)
  dieselEscalationRate: 0.15,

  // NERC tariff escalation — average across bands, tends to track inflation
  gridTariffEscalationRate: 0.12,

  // Solar system degradation — standard monocrystalline panel spec
  panelDegradationRate: 0.005, // 0.5%/yr

  // Annual maintenance as fraction of CAPEX (cleaning, inspection, minor parts)
  maintenanceRate: 0.01, // 1% of CAPEX/yr

  // Battery replacement — lithium at year 10, lead-acid at year 5 and 12
  // This service uses lithium as the default (lifespan 10yr)
  batteryReplacementYear: 10,
  batteryReplacementCostFraction: 0.25, // battery ~25% of initial CAPEX

  // Projection horizon
  defaultLifespanYears: 25,

  // Current NERC Band A tariff (₦/kWh) as of mid-2025
  // Installers can override with customer's actual tariff from their bill
  defaultGridTariffNairaPerKwh: 209,

  // Current diesel pump price (₦/litre) — updated periodically
  // The diesel price tracker feature (Phase 5) will auto-update this
  defaultDieselPriceNairaPerLitre: 1300,

  // Diesel generator efficiency: litres per kWh generated
  // Typical 5–10kVA gen: ~0.3–0.35 L/kWh at 75% load
  dieselLitresPerKwh: 0.33,

  // Discount rate for NPV calculation (opportunity cost of capital in Nigeria)
  discountRate: 0.18,
};

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * computeCashflowProjection
 *
 * @param {object} params
 * @param {number} params.capexNaira              — total system cost (₦)
 * @param {number} params.dailyKwhDemand          — net daily energy need (kWh/day)
 * @param {number} params.gridHoursPerDay         — average grid availability
 * @param {number} params.generatorHoursPerDay    — hours generator currently runs
 * @param {object} [params.overrides]             — override any NIGERIA_DEFAULTS key
 * @param {object} [params.financing]             — optional loan structure
 * @param {number} [params.financing.loanAmount]  — ₦ borrowed (defaults to full CAPEX)
 * @param {number} [params.financing.annualRate]  — decimal e.g. 0.22 for 22%
 * @param {number} [params.financing.termMonths]  — e.g. 60 for 5 years
 * @param {number} [params.financing.downPayment] — ₦ paid upfront
 * @param {number} [params.lifespan]              — projection years (default 25)
 *
 * @returns {CashflowResult}
 */
export function computeCashflowProjection({
  capexNaira,
  dailyKwhDemand,
  gridHoursPerDay = 6,
  generatorHoursPerDay = 8,
  overrides = {},
  financing = null,
  lifespan,
}) {
  // Validate required inputs
  if (!capexNaira || capexNaira <= 0) {
    throw new AppError("capexNaira is required and must be positive", 400);
  }
  if (!dailyKwhDemand || dailyKwhDemand <= 0) {
    throw new AppError("dailyKwhDemand is required and must be positive", 400);
  }

  const cfg = { ...NIGERIA_DEFAULTS, ...overrides };
  const years = lifespan ?? cfg.defaultLifespanYears;

  logger.info("computeCashflowProjection: start", {
    capexNaira,
    dailyKwhDemand,
    gridHoursPerDay,
    generatorHoursPerDay,
    years,
    hasFinancing: !!financing,
  });

  // ── Derive baseline energy split ─────────────────────────────────────────
  // How much of the daily demand is currently met by each source:
  //   - Grid kWh: what the grid actually delivers (capacity-limited by hours)
  //   - Generator kWh: the rest, running on diesel
  //   - Deficit: unserved load during outages (candles, shutdown, etc.) — not
  //     counted in cost because it's currently "free" in the sense that the
  //     customer goes without. Solar converts this to productive use.

  const totalHoursPerDay = 24;
  const offgridHoursPerDay = Math.max(0, totalHoursPerDay - gridHoursPerDay);

  // Fraction of day each source is available
  const gridFraction = Math.min(gridHoursPerDay / totalHoursPerDay, 1);
  const genFraction = Math.min(generatorHoursPerDay / totalHoursPerDay, 1);

  // Demand met per source (simple proportional model)
  // A more sophisticated version would use the load curve from the profile,
  // but this gives a correct baseline for the financial model
  const gridKwhPerDay = dailyKwhDemand * gridFraction;
  const genKwhPerDay = dailyKwhDemand * genFraction;

  // ── Year-zero baselines ───────────────────────────────────────────────────
  // These are the costs the customer is paying TODAY before solar

  const dieselCostPerKwh0 =
    cfg.defaultDieselPriceNairaPerLitre * cfg.dieselLitresPerKwh;

  const annualGridCost0 =
    gridKwhPerDay * 365 * cfg.defaultGridTariffNairaPerKwh;
  const annualDieselCost0 = genKwhPerDay * 365 * dieselCostPerKwh0;
  const annualBaselineCost0 = annualGridCost0 + annualDieselCost0;

  // ── Financing ─────────────────────────────────────────────────────────────
  const loanSchedule = financing
    ? computeLoanSchedule({ capexNaira, ...financing })
    : null;

  // ── Year-by-year projection ───────────────────────────────────────────────
  const years_arr = buildYearlyProjection({
    cfg,
    years,
    capexNaira,
    annualGridCost0,
    annualDieselCost0,
    loanSchedule,
  });

  // ── Summary stats ─────────────────────────────────────────────────────────
  const summary = computeSummary({
    cfg,
    years_arr,
    capexNaira,
    annualBaselineCost0,
    loanSchedule,
  });

  const result = {
    meta: {
      capexNaira,
      dailyKwhDemand,
      gridHoursPerDay,
      generatorHoursPerDay,
      gridKwhPerDay: round2(gridKwhPerDay),
      genKwhPerDay: round2(genKwhPerDay),
      dieselPriceUsed: cfg.defaultDieselPriceNairaPerLitre,
      gridTariffUsed: cfg.defaultGridTariffNairaPerKwh,
      dieselEscalation: cfg.dieselEscalationRate,
      gridEscalation: cfg.gridTariffEscalationRate,
      lifespan: years,
      computedAt: new Date().toISOString(),
    },
    summary,
    financing: loanSchedule
      ? {
          monthlyRepayment: loanSchedule.monthlyRepayment,
          totalRepayable: loanSchedule.totalRepayable,
          totalInterest: loanSchedule.totalInterest,
          termMonths: loanSchedule.termMonths,
          downPayment: loanSchedule.downPayment,
        }
      : null,
    yearly: years_arr,
  };

  logger.info("computeCashflowProjection: complete", {
    crossoverYear: summary.crossoverYear,
    lifetimeSavings: summary.lifetimeSavingsNaira,
    npv: summary.npvNaira,
    paybackYears: summary.simplePaybackYears,
  });

  return result;
}

// ---------------------------------------------------------------------------
// Year-by-year array
// ---------------------------------------------------------------------------

function buildYearlyProjection({
  cfg,
  years,
  capexNaira,
  annualGridCost0,
  annualDieselCost0,
  loanSchedule,
}) {
  const rows = [];

  // Cumulative trackers
  let cumulativeBaselineCost = 0; // what they'd pay without solar
  let cumulativeSolarCost = 0; // what they pay with solar (CAPEX + opex)
  let cumulativeLoanCost = 0; // solar via loan (down payment + repayments + opex)

  // CAPEX lands in year 0 for the solar path
  // For the loan path, only the down payment lands in year 0
  const downPayment = loanSchedule?.downPayment ?? 0;
  cumulativeSolarCost = capexNaira;
  cumulativeLoanCost = loanSchedule ? downPayment : capexNaira;

  for (let y = 1; y <= years; y++) {
    // ── Baseline (no solar) — escalated year-on-year ──
    const dieselEscFactor = Math.pow(1 + cfg.dieselEscalationRate, y - 1);
    const gridEscFactor = Math.pow(1 + cfg.gridTariffEscalationRate, y - 1);

    const annualDieselCost = annualDieselCost0 * dieselEscFactor;
    const annualGridCost = annualGridCost0 * gridEscFactor;
    const annualBaselineCost = annualDieselCost + annualGridCost;

    cumulativeBaselineCost += annualBaselineCost;

    // ── Solar opex ──
    // Maintenance: 1% of CAPEX per year
    const maintenanceCost = capexNaira * cfg.maintenanceRate;

    // Battery replacement (one-time, hits at replacement year)
    const batteryReplacement =
      y === cfg.batteryReplacementYear
        ? capexNaira * cfg.batteryReplacementCostFraction
        : 0;

    // Residual grid cost: solar covers generator hours fully, but
    // the customer still uses grid when it's available (it's free/cheap
    // relative to diesel so they'd still use it for base load)
    // After solar: no generator needed; grid cost remains but only for
    // grid hours. In a full off-grid system, grid cost goes to 0.
    // Model: if grid hours > 0, customer keeps grid connection for top-up
    const residualGridCost = annualGridCost; // still pay NERC tariff on grid hours

    const annualSolarOpex =
      maintenanceCost + batteryReplacement + residualGridCost;

    cumulativeSolarCost += annualSolarOpex;

    // ── Loan path opex ──
    // Loan repayments cover CAPEX cost; opex (maintenance, battery, grid) still applies
    const annualLoanRepayments =
      loanSchedule && y <= Math.ceil(loanSchedule.termMonths / 12)
        ? loanSchedule.monthlyRepayment *
          Math.min(12, loanSchedule.termMonths - (y - 1) * 12)
        : 0;

    const annualLoanCost =
      annualLoanRepayments +
      maintenanceCost +
      batteryReplacement +
      residualGridCost;

    if (loanSchedule) {
      cumulativeLoanCost += annualLoanCost;
    }

    // ── Savings this year (solar vs baseline) ──
    const annualSavings = annualBaselineCost - annualSolarOpex;

    rows.push({
      year: y,
      annualBaselineCost: round0(annualBaselineCost),
      annualDieselCost: round0(annualDieselCost),
      annualGridCost: round0(annualGridCost),
      annualSolarOpex: round0(annualSolarOpex),
      annualSavings: round0(annualSavings),
      annualLoanCost: loanSchedule ? round0(annualLoanCost) : null,
      batteryReplacement:
        batteryReplacement > 0 ? round0(batteryReplacement) : 0,
      cumulativeBaselineCost: round0(cumulativeBaselineCost),
      cumulativeSolarCost: round0(cumulativeSolarCost),
      cumulativeLoanCost: loanSchedule ? round0(cumulativeLoanCost) : null,
      // Net position: positive = solar is ahead (saving money)
      cumulativeSavings: round0(cumulativeBaselineCost - cumulativeSolarCost),
    });
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Summary stats
// ---------------------------------------------------------------------------

function computeSummary({
  cfg,
  years_arr,
  capexNaira,
  annualBaselineCost0,
  loanSchedule,
}) {
  // Simple payback: years until cumulative savings cover CAPEX
  // (ignoring time value of money — what installers quote)
  let simplePaybackYears = null;
  for (const row of years_arr) {
    if (row.cumulativeSavings >= 0 && simplePaybackYears === null) {
      simplePaybackYears = row.year;
      break;
    }
  }

  // Crossover year: first year where cumulative solar cost < cumulative baseline
  // (same as payback for upfront CAPEX; different for loan path)
  let crossoverYear = simplePaybackYears;
  let loanCrossoverYear = null;

  if (loanSchedule) {
    for (const row of years_arr) {
      if (
        row.cumulativeLoanCost !== null &&
        row.cumulativeLoanCost < row.cumulativeBaselineCost &&
        loanCrossoverYear === null
      ) {
        loanCrossoverYear = row.year;
        break;
      }
    }
  }

  // Lifetime savings (year 25 cumulative savings)
  const lastYear = years_arr[years_arr.length - 1];
  const lifetimeSavingsNaira = lastYear.cumulativeSavings;

  // Year-10 savings (common customer planning horizon)
  const year10 = years_arr.find((r) => r.year === 10);
  const tenYearSavingsNaira = year10?.cumulativeSavings ?? null;

  // NPV of solar investment at Nigerian discount rate
  const npvNaira = computeNPV({
    cfg,
    years_arr,
    capexNaira,
  });

  // ROI (simple, not annualised)
  const roi = lifetimeSavingsNaira / capexNaira;

  // Monthly equivalent saving (year-1 savings ÷ 12) — for customer conversations
  const year1Savings = years_arr[0]?.annualSavings ?? 0;
  const monthlyEquivalentSavingYear1 = Math.round(year1Savings / 12);

  // Annual baseline in year 1 — shows how much they're spending now
  const currentAnnualSpend = years_arr[0]?.annualBaselineCost ?? 0;

  return {
    simplePaybackYears,
    crossoverYear,
    loanCrossoverYear,
    lifetimeSavingsNaira: round0(lifetimeSavingsNaira),
    tenYearSavingsNaira: round0(tenYearSavingsNaira),
    npvNaira: round0(npvNaira),
    roi: round2(roi),
    roiPercent: round1(roi * 100),
    monthlyEquivalentSavingYear1,
    currentAnnualSpend: round0(currentAnnualSpend),
    currentAnnualDieselSpend: round0(years_arr[0]?.annualDieselCost ?? 0),
    currentAnnualGridSpend: round0(years_arr[0]?.annualGridCost ?? 0),
  };
}

// ---------------------------------------------------------------------------
// NPV calculation
// ---------------------------------------------------------------------------

function computeNPV({ cfg, years_arr, capexNaira }) {
  // NPV = -CAPEX + Σ (annual_savings / (1 + r)^t)
  // A positive NPV means the investment makes financial sense even accounting
  // for the time value of money at the Nigerian discount rate
  const r = cfg.discountRate;
  let npv = -capexNaira;

  for (const row of years_arr) {
    npv += row.annualSavings / Math.pow(1 + r, row.year);
  }

  return npv;
}

// ---------------------------------------------------------------------------
// Loan schedule
// ---------------------------------------------------------------------------

/**
 * computeLoanSchedule
 * Standard amortising loan — equal monthly payments, fixed rate.
 *
 * @param {object} params
 * @param {number} params.capexNaira    — total system cost
 * @param {number} params.loanAmount    — amount borrowed (defaults to capexNaira)
 * @param {number} params.annualRate    — e.g. 0.22 for 22% per annum
 * @param {number} params.termMonths    — e.g. 60 for 5 years
 * @param {number} params.downPayment   — upfront payment (reduces loanAmount)
 */
export function computeLoanSchedule({
  capexNaira,
  loanAmount = null,
  annualRate = 0.22,
  termMonths = 60,
  downPayment = 0,
}) {
  const principal = (loanAmount ?? capexNaira) - downPayment;

  if (principal <= 0) {
    throw new AppError(
      "Loan principal must be positive after down payment",
      400,
    );
  }

  const monthlyRate = annualRate / 12;

  // Standard amortisation formula: M = P × [r(1+r)^n] / [(1+r)^n - 1]
  const monthlyRepayment =
    monthlyRate === 0
      ? principal / termMonths
      : (principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
        (Math.pow(1 + monthlyRate, termMonths) - 1);

  const totalRepayable = monthlyRepayment * termMonths + downPayment;
  const totalInterest = totalRepayable - capexNaira;

  return {
    principal: round0(principal),
    downPayment: round0(downPayment),
    monthlyRepayment: round0(monthlyRepayment),
    annualRate,
    termMonths,
    totalRepayable: round0(totalRepayable),
    totalInterest: round0(totalInterest),
  };
}

// ---------------------------------------------------------------------------
// Scenario sensitivity
// Computes how the crossover year shifts under different diesel price assumptions.
// Used by the "What if diesel hits ₦1,500?" feature in the chart.
// ---------------------------------------------------------------------------

/**
 * computeScenarios
 * Returns crossover years for three diesel price scenarios.
 * Cheap to run — reuses computeCashflowProjection with different overrides.
 *
 * @param {object} baseParams — same params as computeCashflowProjection
 * @returns {object[]}        — array of { label, dieselPrice, crossoverYear, lifetimeSavings }
 */
export function computeScenarios(baseParams) {
  const currentPrice =
    baseParams.overrides?.defaultDieselPriceNairaPerLitre ??
    NIGERIA_DEFAULTS.defaultDieselPriceNairaPerLitre;

  const scenarios = [
    { label: "Conservative", dieselPrice: Math.round(currentPrice * 0.8) },
    { label: "Current", dieselPrice: currentPrice },
    { label: "Optimistic", dieselPrice: Math.round(currentPrice * 1.3) },
  ];

  return scenarios.map((s) => {
    const result = computeCashflowProjection({
      ...baseParams,
      overrides: {
        ...baseParams.overrides,
        defaultDieselPriceNairaPerLitre: s.dieselPrice,
      },
    });

    return {
      label: s.label,
      dieselPrice: s.dieselPrice,
      crossoverYear: result.summary.crossoverYear,
      lifetimeSavingsNaira: result.summary.lifetimeSavingsNaira,
      npvNaira: result.summary.npvNaira,
    };
  });
}

// ---------------------------------------------------------------------------
// Route handler helper
// Wraps computeCashflowProjection for use in Express routes.
// Pulls inputs from the assessment's existing results + sizing_result.
// ---------------------------------------------------------------------------

/**
 * computeFromAssessment
 * Convenience wrapper that extracts the right fields from an assessment
 * object and calls computeCashflowProjection.
 *
 * @param {object} assessment   — full assessment row from Supabase
 * @param {object} [financing]  — optional loan params from request body
 */
export function computeFromAssessment(assessment, financing = null) {
  const result = assessment.results ?? assessment.result;
  const settings = assessment.settings ?? {};
  const sizing = assessment.sizing_result;

  if (!result) {
    throw new AppError("Assessment has no results to project from", 400);
  }

  // Pull the effective daily kWh from the energy calculation
  const dailyKwhDemand = result.energy?.effectiveDailyKWh;
  if (!dailyKwhDemand) {
    throw new AppError("Assessment results missing effectiveDailyKWh", 400);
  }

  // CAPEX: use the midpoint of the sizing range if available,
  // fall back to a settings override, then error
  let capexNaira = settings.capex ?? null;

  if (!capexNaira && sizing?.capex) {
    // Use midpoint of estimated CAPEX range from solarService
    capexNaira = sizing.capex.max
      ? Math.round((sizing.capex.min + sizing.capex.max) / 2)
      : sizing.capex.min;
  }

  if (!capexNaira) {
    throw new AppError(
      "Cannot project cashflow without a CAPEX figure. Run system sizing first or provide capex in assessment settings.",
      400,
    );
  }

  // Grid and generator hours from settings (set in the assessment form)
  const gridHoursPerDay = settings.gridHours ?? 6;
  const generatorHoursPerDay = settings.generatorHours ?? 8;

  // Allow the installer to override diesel price and tariff from the profile
  // (if they entered the customer's actual generator fuel spend)
  const overrides = {};
  if (settings.dieselPriceOverride) {
    overrides.defaultDieselPriceNairaPerLitre = settings.dieselPriceOverride;
  }
  if (settings.gridTariffOverride) {
    overrides.defaultGridTariffNairaPerKwh = settings.gridTariffOverride;
  }

  return computeCashflowProjection({
    capexNaira,
    dailyKwhDemand,
    gridHoursPerDay,
    generatorHoursPerDay,
    overrides,
    financing,
    lifespan: settings.lifespan ?? NIGERIA_DEFAULTS.defaultLifespanYears,
  });
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

const round0 = (n) => Math.round(n);
const round1 = (n) => Math.round(n * 10) / 10;
const round2 = (n) => Math.round(n * 100) / 100;
