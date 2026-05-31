import { calculateEnergy } from "../services/energyService.js";
import { gridCost } from "../services/gridService.js";
import { generatorCost } from "../services/generatorService.js";
import { solarCost } from "../services/solarService.js";
import { compareCosts } from "../services/comparisonService.js";

export const calculate = async (req, res, next) => {
  try {
    const data = req.body;

    // Validation
    if (!data.appliances || data.appliances.length === 0) {
      const err = new Error("At least one appliance is required.");
      err.status = 400;
      return next(err);
    }

    const hasGrid = data.gridTariff != null && !isNaN(data.gridTariff);
    const hasGenerator =
      data.fuelPrice != null &&
      !isNaN(data.fuelPrice) &&
      data.efficiency != null &&
      !isNaN(data.efficiency);

    if (!hasGrid && !hasGenerator) {
      const err = new Error(
        "Include at least one comparison source — Grid or Generator.",
      );
      err.status = 400;
      return next(err);
    }

    // gridHours is required when both sources are toggled — that's when the split matters
    if (hasGrid && hasGenerator) {
      if (data.gridHours == null || isNaN(data.gridHours)) {
        const err = new Error(
          "Select how many hours of grid supply you get daily — this is needed to split your load accurately.",
        );
        err.status = 400;
        return next(err);
      }
    }

    // When both sources are present, split the load by grid availability.
    // When only one source is toggled, no split is needed — pass 24 so gridKWh = annualKWh.
    const gridHoursPerDay =
      hasGrid && hasGenerator ? parseFloat(data.gridHours) : 24;

    // Energy — with load split
    const energy = calculateEnergy(data.appliances, gridHoursPerDay);

    // Costs — only calculate what was provided
    const grid = hasGrid ? gridCost(energy, data.gridTariff) : null;
    const generator = hasGenerator
      ? generatorCost(energy, data.fuelPrice, data.efficiency)
      : null;
    const solar = solarCost(energy, data.capex, data.lifespan);

    // Comparison
    const comparison = compareCosts(grid, generator, solar, data.capex);

    res.json({
      energy,
      grid,
      generator,
      solar,
      comparison,
    });
  } catch (err) {
    next(err);
  }
};
