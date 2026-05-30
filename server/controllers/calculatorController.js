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

    // Energy
    const energy = calculateEnergy(data.appliances);

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
