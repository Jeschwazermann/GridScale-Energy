import { describe, expect, it } from "vitest";
import { compareCosts } from "../../services/comparisonService.js";
import { generatorCost } from "../../services/generatorService.js";
import { gridCost } from "../../services/gridService.js";
import { solarCost } from "../../services/solarService.js";

const energy = {
  annualKWh: 1_200,
  effectiveAnnualKWh: 1_500,
  gridKWh: 900,
  offGridKWh: 300,
};

describe("cost services", () => {
  it("calculates grid, generator, and solar costs", () => {
    const grid = gridCost(energy, 100);
    const generator = generatorCost(energy, 1_000, 2);
    const solar = solarCost(energy, 1_000_000, 20);

    expect(grid.annualCost).toBe(90_000);
    expect(generator.fuelCost).toBe(150_000);
    expect(generator.annualCost).toBe(165_000);
    expect(solar.annualCost).toBe(65_000);
    expect(solar.costPerKWh).toBeCloseTo(65_000 / 1_200);
  });

  it("reports a viable solar option and a payback period", () => {
    const grid = { annualCost: 200_000 };
    const solar = { annualCost: 50_000, costPerKWh: 40 };
    const result = compareCosts(grid, null, solar, 1_000_000, 25, energy);

    expect(result.cheapestSource).toBe("Solar");
    expect(result.comparedAgainst).toBe("Grid");
    expect(result.savingsPerYear).toBe(150_000);
    expect(result.paybackYears).toBeCloseTo(1_000_000 / 150_000);
    expect(result.solarStatus).toBe("viable");
  });

  it("flags solar as unviable when payback exceeds its lifespan", () => {
    const grid = { annualCost: 110_000 };
    const solar = { annualCost: 100_000, costPerKWh: 100 };
    const result = compareCosts(grid, null, solar, 1_000_000, 10, energy);

    expect(result.paybackExceedsLifespan).toBe(true);
    expect(result.solarStatus).toBe("unviable");
    expect(result.solarInsight).toContain("will not break even");
  });
});
