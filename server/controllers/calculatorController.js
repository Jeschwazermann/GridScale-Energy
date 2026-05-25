import { gridCost } from "../services/gridService.js";
import { generatorCost } from "../services/generatorService.js";
import { solarCost } from "../services/solarService.js";
import { compareCosts } from "../services/comparisonService.js";
import { calculateEnergy } from "../services/energyService.js";

export const calculate = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.appliances || data.appliances.length === 0) {
      const err = new Error("At least one appliance is required.");
      err.status = 400;
      return next(err);
    }

    // 1. Energy
    const energy = calculateEnergy(data.appliances);

    // 2. Costs
    const grid = gridCost(energy, data.gridTariff);
    const generator = generatorCost(energy, data.fuelPrice, data.efficiency);
    const solar = solarCost(energy, data.capex, data.lifespan);

    // 3. Comparison
    const comparison = compareCosts(grid, generator, solar);

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
