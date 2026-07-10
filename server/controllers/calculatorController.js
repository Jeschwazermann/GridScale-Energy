import { calculateEnergy } from "../services/energyService.js";
import { gridCost } from "../services/gridService.js";
import { generatorCost } from "../services/generatorService.js";
import { solarCost } from "../services/solarService.js";
import { compareCosts } from "../services/comparisonService.js";
import { AppError } from "../utils/AppError.js";

export const calculate = async (req, res, next) => {
  try {
    const data = req.body;

    /* ── Appliance validation ────────────────────────────────────── */
    if (!data.appliances || data.appliances.length === 0) {
      const err = new AppError("At least one appliance is required.", 400);
      return next(err);
    }

    /* ── Source flags ────────────────────────────────────────────── */
    const hasGrid = data.gridTariff != null && !isNaN(data.gridTariff);
    const hasGenerator =
      data.fuelPrice != null &&
      !isNaN(data.fuelPrice) &&
      data.efficiency != null &&
      !isNaN(data.efficiency);

    if (!hasGrid && !hasGenerator) {
      const err = new AppError(
        "Include at least one comparison source — Grid or Generator.",
        400,
      );
      return next(err);
    }

    /* ── Solar inputs validation ─────────────────────────────────── */
    if (!data.capex || isNaN(data.capex)) {
      const err = new AppError("Solar system CAPEX is required.", 400);
      return next(err);
    }

    if (!data.lifespan || isNaN(data.lifespan)) {
      const err = new AppError("Solar system lifespan is required.", 400);
      return next(err);
    }

    /* ── Grid hours validation ───────────────────────────────────────
       Required whenever any source is toggled — not just when both
       are present. gridHours drives the load split in energyService
       regardless of how many sources are active.                    */
    if (data.gridHours == null || isNaN(data.gridHours)) {
      const err = new AppError(
        "Select how many hours of grid supply you get daily — this is needed to calculate your load accurately.",
        400,
      );
      return next(err);
    }

    /* ── Generator hours validation ──────────────────────────────────
       Only required when generator is included. Must not push the
       combined grid + gen hours past 24.                             */
    if (hasGenerator) {
      if (data.genHours == null || isNaN(data.genHours)) {
        const err = new AppError(
          "Select how many hours you run your generator daily.",
          400,
        );
        return next(err);
      }
      const combined = parseFloat(data.gridHours) + parseFloat(data.genHours);
      if (combined > 24) {
        const err = new AppError(
          `Grid hours (${data.gridHours}) + Generator hours (${data.genHours}) = ${combined}hrs, which exceeds 24. Please adjust.`,
          400,
        );
        return next(err);
      }
    }

    /* ── Energy ──────────────────────────────────────────────────── */
    const gridHoursPerDay = parseFloat(data.gridHours);
    const genHoursPerDay = hasGenerator ? parseFloat(data.genHours) : null;
    const energy = calculateEnergy(
      data.appliances,
      gridHoursPerDay,
      genHoursPerDay,
    );

    /* ── Cost engines ────────────────────────────────────────────── */
    const grid = hasGrid ? gridCost(energy, data.gridTariff) : null;
    const generator = hasGenerator
      ? generatorCost(energy, data.fuelPrice, data.efficiency)
      : null;
    const solar = solarCost(energy, data.capex, data.lifespan);

    /* ── Comparison ──────────────────────────────────────────────────
       Now receives lifespan and energy so compareCosts can:
       - Detect payback > lifespan
       - Run the solarStatus diagnostic (low usage, oversized, unviable)
       - Produce a breakEvenCapex suggestion when solar is unviable   */
    const comparison = compareCosts(
      grid,
      generator,
      solar,
      parseFloat(data.capex),
      parseFloat(data.lifespan), // ← new
      energy, // ← new
    );

    res.json({ energy, grid, generator, solar, comparison });
  } catch (err) {
    next(err);
  }
};
