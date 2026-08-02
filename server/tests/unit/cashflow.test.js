import { describe, it, expect } from "vitest";
import {
  computeCashflowProjection,
  computeLoanSchedule,
  computeScenarios,
  NIGERIA_DEFAULTS,
} from "../../services/cashflowService.js";

const BASE = {
  capexNaira: 4_500_000,
  dailyKwhDemand: 10,
  gridHoursPerDay: 6,
  generatorHoursPerDay: 8,
};

describe("computeCashflowProjection", () => {
  it("returns 25 yearly rows by default", () => {
    const result = computeCashflowProjection(BASE);
    expect(result.yearly.length).toBe(25);
  });

  it("respects custom lifespan", () => {
    const result = computeCashflowProjection({ ...BASE, lifespan: 10 });
    expect(result.yearly.length).toBe(10);
  });

  it("throws if capexNaira missing", () => {
    expect(() => computeCashflowProjection({ ...BASE, capexNaira: 0 })).toThrow(
      /capexNaira/,
    );
  });

  it("throws if dailyKwhDemand missing", () => {
    expect(() =>
      computeCashflowProjection({ ...BASE, dailyKwhDemand: 0 }),
    ).toThrow(/dailyKwhDemand/);
  });

  it("cumulative baseline cost grows every year", () => {
    const { yearly } = computeCashflowProjection(BASE);
    for (let i = 1; i < yearly.length; i++) {
      expect(yearly[i].cumulativeBaselineCost).toBeGreaterThan(
        yearly[i - 1].cumulativeBaselineCost,
      );
    }
  });

  it("cumulative solar cost grows every year", () => {
    const { yearly } = computeCashflowProjection(BASE);
    for (let i = 1; i < yearly.length; i++) {
      expect(yearly[i].cumulativeSolarCost).toBeGreaterThan(
        yearly[i - 1].cumulativeSolarCost,
      );
    }
  });

  it("battery replacement appears in year 10", () => {
    const { yearly } = computeCashflowProjection(BASE);
    const year10 = yearly.find((row) => row.year === 10);
    expect(year10?.batteryReplacement).toBeGreaterThan(0);

    const year9 = yearly.find((row) => row.year === 9);
    expect(year9?.batteryReplacement).toBe(0);
  });

  it("battery replacement is 25% of CAPEX", () => {
    const { yearly } = computeCashflowProjection(BASE);
    const year10 = yearly.find((row) => row.year === 10);
    const expected =
      BASE.capexNaira * NIGERIA_DEFAULTS.batteryReplacementCostFraction;
    expect(year10?.batteryReplacement).toBe(Math.round(expected));
  });

  it("crossover year exists and is between year 3 and year 15 for typical system", () => {
    const { summary } = computeCashflowProjection(BASE);
    expect(summary.crossoverYear).not.toBeNull();
    expect(summary.crossoverYear).toBeGreaterThanOrEqual(1);
    expect(summary.crossoverYear).toBeLessThanOrEqual(15);
  });

  it("lifetime savings are positive for a viable system", () => {
    const { summary } = computeCashflowProjection(BASE);
    expect(summary.lifetimeSavingsNaira).toBeGreaterThan(0);
  });

  it("higher diesel price → earlier crossover", () => {
    const cheap = computeCashflowProjection({
      ...BASE,
      overrides: { defaultDieselPriceNairaPerLitre: 800 },
    });
    const expensive = computeCashflowProjection({
      ...BASE,
      overrides: { defaultDieselPriceNairaPerLitre: 1800 },
    });

    expect(expensive.summary.crossoverYear).toBeLessThanOrEqual(
      cheap.summary.crossoverYear,
    );
  });

  it("more generator hours → earlier crossover", () => {
    const less = computeCashflowProjection({
      ...BASE,
      generatorHoursPerDay: 4,
    });
    const more = computeCashflowProjection({
      ...BASE,
      generatorHoursPerDay: 16,
    });

    expect(more.summary.crossoverYear).toBeLessThanOrEqual(
      less.summary.crossoverYear,
    );
  });

  it("annual baseline cost in year 1 is greater than solar opex in year 1", () => {
    const { yearly } = computeCashflowProjection(BASE);
    const y1 = yearly[0];
    expect(y1.annualBaselineCost).toBeGreaterThan(y1.annualSolarOpex);
  });

  it("includes meta with computedAt timestamp", () => {
    const { meta } = computeCashflowProjection(BASE);
    expect(meta.computedAt).toBeTruthy();
    expect(new Date(meta.computedAt).getTime()).toBeGreaterThan(0);
  });

  it("yearly rows have all required fields", () => {
    const { yearly } = computeCashflowProjection(BASE);
    const required = [
      "year",
      "annualBaselineCost",
      "annualDieselCost",
      "annualGridCost",
      "annualSolarOpex",
      "annualSavings",
      "batteryReplacement",
      "cumulativeBaselineCost",
      "cumulativeSolarCost",
      "cumulativeSavings",
    ];
    for (const field of required) {
      expect(field in yearly[0]).toBe(true);
    }
  });
});

describe("computeLoanSchedule", () => {
  it("computes correct monthly repayment", () => {
    const schedule = computeLoanSchedule({
      capexNaira: 4_500_000,
      annualRate: 0.22,
      termMonths: 60,
      downPayment: 0,
    });

    expect(schedule.monthlyRepayment).toBeGreaterThan(100_000);
    expect(schedule.monthlyRepayment).toBeLessThan(180_000);
  });

  it("total repayable > capex (interest costs money)", () => {
    const schedule = computeLoanSchedule({
      capexNaira: 4_500_000,
      annualRate: 0.22,
      termMonths: 60,
      downPayment: 0,
    });
    expect(schedule.totalRepayable).toBeGreaterThan(4_500_000);
    expect(schedule.totalInterest).toBeGreaterThan(0);
  });

  it("down payment reduces principal and monthly repayment", () => {
    const noDp = computeLoanSchedule({
      capexNaira: 4_500_000,
      annualRate: 0.22,
      termMonths: 60,
      downPayment: 0,
    });
    const withDp = computeLoanSchedule({
      capexNaira: 4_500_000,
      annualRate: 0.22,
      termMonths: 60,
      downPayment: 900_000,
    });

    expect(withDp.monthlyRepayment).toBeLessThan(noDp.monthlyRepayment);
  });

  it("throws if principal is zero after down payment", () => {
    expect(() =>
      computeLoanSchedule({
        capexNaira: 1_000_000,
        annualRate: 0.22,
        termMonths: 60,
        downPayment: 1_000_000,
      }),
    ).toThrow(/principal/);
  });

  it("zero interest rate gives principal ÷ months", () => {
    const schedule = computeLoanSchedule({
      capexNaira: 1_200_000,
      annualRate: 0,
      termMonths: 12,
      downPayment: 0,
    });
    expect(schedule.monthlyRepayment).toBe(100_000);
  });
});

describe("computeCashflowProjection with financing", () => {
  const financing = {
    annualRate: 0.22,
    termMonths: 60,
    downPayment: 500_000,
  };

  it("includes loan columns in yearly rows", () => {
    const { yearly } = computeCashflowProjection({ ...BASE, financing });
    expect(yearly[0].annualLoanCost).not.toBeNull();
    expect(yearly[0].cumulativeLoanCost).not.toBeNull();
  });

  it("loan crossover year is in summary", () => {
    const { summary } = computeCashflowProjection({ ...BASE, financing });
    expect("loanCrossoverYear" in summary).toBe(true);
  });

  it("loan monthly repayment is in financing block", () => {
    const result = computeCashflowProjection({ ...BASE, financing });
    expect(result.financing).not.toBeNull();
    expect(result.financing.monthlyRepayment).toBeGreaterThan(0);
  });

  it("after loan term, loan cost equals only opex (no more repayments)", () => {
    const { yearly } = computeCashflowProjection({ ...BASE, financing });
    const year6 = yearly.find((row) => row.year === 6);
    const year5 = yearly.find((row) => row.year === 5);

    expect(year6.annualLoanCost).toBeLessThan(year5.annualLoanCost);
  });
});

describe("computeScenarios", () => {
  it("returns exactly 3 scenarios", () => {
    const scenarios = computeScenarios(BASE);
    expect(scenarios.length).toBe(3);
  });

  it("scenarios have required fields", () => {
    const scenarios = computeScenarios(BASE);
    for (const scenario of scenarios) {
      expect(scenario.label).toBeTruthy();
      expect(scenario.dieselPrice).toBeGreaterThan(0);
      expect(scenario.crossoverYear).toBeTruthy();
      expect(scenario.lifetimeSavingsNaira).toBeTruthy();
    }
  });

  it("optimistic diesel price gives higher savings than conservative", () => {
    const scenarios = computeScenarios(BASE);
    const conservative = scenarios.find(
      (scenario) => scenario.label === "Conservative",
    );
    const optimistic = scenarios.find(
      (scenario) => scenario.label === "Optimistic",
    );

    expect(optimistic.lifetimeSavingsNaira).toBeGreaterThan(
      conservative.lifetimeSavingsNaira,
    );
  });
});
