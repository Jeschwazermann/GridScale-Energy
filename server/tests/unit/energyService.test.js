import { describe, expect, it } from "vitest";
import { calculateEnergy } from "../../services/energyService.js";

describe("calculateEnergy", () => {
  const appliances = [
    { power: 100, hours: 5, days: 365, units: 2 },
    { power: 50, hours: 4, days: 365, units: 1 },
  ];

  it("calculates annual consumption, source split, and peak load", () => {
    const energy = calculateEnergy(appliances, 12, 12);

    expect(energy.annualKWh).toBe(438);
    expect(energy.dailyKWh).toBeCloseTo(1.2);
    expect(energy.gridKWh).toBe(219);
    expect(energy.offGridKWh).toBe(219);
    expect(energy.unpoweredHours).toBe(0);
    expect(energy.peakLoadKw).toBeCloseTo(0.25);
  });

  it("clamps supply hours so their combined value cannot exceed a day", () => {
    const energy = calculateEnergy(appliances, 20, 12);

    expect(energy.gridHoursPerDay).toBe(20);
    expect(energy.genHoursPerDay).toBe(4);
    expect(energy.unpoweredHours).toBe(0);
    expect(energy.gridFraction + energy.genFraction).toBe(1);
  });

  it("applies diversity only when requested", () => {
    const standard = calculateEnergy(appliances);
    const diversified = calculateEnergy(appliances, 24, 0, true);

    expect(diversified.effectiveDailyKWh).toBeCloseTo(
      standard.effectiveDailyKWh * 1.25,
    );
    expect(diversified.breakdown.diversityMultiplier).toBe(1.25);
  });
});
