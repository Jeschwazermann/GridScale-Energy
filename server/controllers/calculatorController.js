import { calculateEnergy } from "../services/energyService.js";
import { gridCost } from "../services/gridService.js";
import { generatorCost } from "../services/generatorService.js";
import { solarCost } from "../services/solarService.js";
import { compareCosts } from "../services/comparisonService.js";
import { AppError } from "../utils/AppError.js";

/* ─── Field limits ───────────────────────────────────────────── */
const APPLIANCE_LIMITS = {
  power: { min: 0, max: 100_000 }, // 100kW — catches typos like 10000W for a bulb
  hours: { min: 0, max: 24 }, // hard physical ceiling
  days: { min: 0, max: 365 }, // hard physical ceiling
  units: { min: 1, max: 500 }, // reasonable upper bound
};

/**
 * Validate and sanitize a single appliance object.
 * Returns { appliance, errors } — errors is an empty array when clean.
 */
function sanitizeAppliance(raw, index) {
  const errors = [];
  const out = {};

  for (const [field, { min, max }] of Object.entries(APPLIANCE_LIMITS)) {
    const raw_val = raw[field];
    const num = parseFloat(raw_val);

    if (raw_val == null || raw_val === "" || isNaN(num) || !isFinite(num)) {
      errors.push(
        `Appliance ${index + 1}: "${field}" is required and must be a number.`,
      );
      out[field] = min; // fallback so calculation can still proceed if we ever soft-warn
      continue;
    }

    if (num < min) {
      errors.push(
        `Appliance ${index + 1}: "${field}" cannot be less than ${min} (got ${num}).`,
      );
      out[field] = min;
    } else if (num > max) {
      errors.push(
        `Appliance ${index + 1}: "${field}" cannot exceed ${max} (got ${num}).`,
      );
      out[field] = max;
    } else {
      out[field] = num;
    }
  }

  out.days = 365;

  // Preserve name for debugging/logging; not used in calculation
  out.name = typeof raw.name === "string" ? raw.name.trim().slice(0, 100) : "";

  return { appliance: out, errors };
}

export const calculate = async (req, res, next) => {
  try {
    const data = req.body;

    /* ── Appliance presence check ────────────────────────────────── */
    if (!Array.isArray(data.appliances) || data.appliances.length === 0) {
      return next(new AppError("At least one appliance is required.", 400));
    }

    if (data.appliances.length > 50) {
      return next(new AppError("Maximum 50 appliances per calculation.", 400));
    }

    /* ── Sanitize each appliance — collect all errors before rejecting */
    const sanitizedAppliances = [];
    const applianceErrors = [];

    for (let i = 0; i < data.appliances.length; i++) {
      const { appliance, errors } = sanitizeAppliance(data.appliances[i], i);
      sanitizedAppliances.push(appliance);
      applianceErrors.push(...errors);
    }

    if (applianceErrors.length > 0) {
      return next(new AppError(applianceErrors.join(" "), 400));
    }

    /* ── Source flags ────────────────────────────────────────────── */
    const hasGrid =
      data.gridTariff != null &&
      !isNaN(data.gridTariff) &&
      parseFloat(data.gridTariff) >= 0;
    const hasGenerator =
      data.fuelPrice != null &&
      !isNaN(data.fuelPrice) &&
      parseFloat(data.fuelPrice) > 0 &&
      data.efficiency != null &&
      !isNaN(data.efficiency) &&
      parseFloat(data.efficiency) > 0;

    if (!hasGrid && !hasGenerator) {
      return next(
        new AppError(
          "Include at least one comparison source — Grid or Generator.",
          400,
        ),
      );
    }

    /* ── Solar inputs ────────────────────────────────────────────── */
    if (!data.capex || isNaN(data.capex) || parseFloat(data.capex) <= 0) {
      return next(
        new AppError(
          "Solar system CAPEX is required and must be a positive number.",
          400,
        ),
      );
    }

    if (
      !data.lifespan ||
      isNaN(data.lifespan) ||
      parseFloat(data.lifespan) < 1 ||
      parseFloat(data.lifespan) > 50
    ) {
      return next(
        new AppError(
          "Solar system lifespan must be between 1 and 50 years.",
          400,
        ),
      );
    }

    /* ── Grid hours ──────────────────────────────────────────────── */
    if (data.gridHours == null || isNaN(data.gridHours)) {
      return next(
        new AppError(
          "Select how many hours of grid supply you get daily — this is needed to split your load accurately.",
          400,
        ),
      );
    }

    const gridHoursPerDay = parseFloat(data.gridHours);
    if (gridHoursPerDay < 0 || gridHoursPerDay > 24) {
      return next(new AppError("Grid hours must be between 0 and 24.", 400));
    }

    /* ── Generator hours ─────────────────────────────────────────── */
    let genHoursPerDay = null;
    if (hasGenerator) {
      if (data.genHours == null || isNaN(data.genHours)) {
        return next(
          new AppError(
            "Select how many hours you run your generator daily.",
            400,
          ),
        );
      }

      genHoursPerDay = parseFloat(data.genHours);

      if (genHoursPerDay < 0 || genHoursPerDay > 24) {
        return next(
          new AppError("Generator hours must be between 0 and 24.", 400),
        );
      }

      const combined = gridHoursPerDay + genHoursPerDay;
      if (combined > 24) {
        return next(
          new AppError(
            `Grid hours (${gridHoursPerDay}) + Generator hours (${genHoursPerDay}) = ${combined}hrs, which exceeds 24. Please adjust.`,
            400,
          ),
        );
      }
    }

    /* ── Energy ──────────────────────────────────────────────────── */
    const energy = calculateEnergy(
      sanitizedAppliances, // use sanitized, not raw data.appliances
      gridHoursPerDay,
      genHoursPerDay,
    );

    /* ── Cost engines ────────────────────────────────────────────── */
    const grid = hasGrid ? gridCost(energy, parseFloat(data.gridTariff)) : null;
    const generator = hasGenerator
      ? generatorCost(
          energy,
          parseFloat(data.fuelPrice),
          parseFloat(data.efficiency),
        )
      : null;
    const solar = solarCost(
      energy,
      parseFloat(data.capex),
      parseFloat(data.lifespan),
    );

    /* ── Comparison ──────────────────────────────────────────────── */
    const comparison = compareCosts(
      grid,
      generator,
      solar,
      parseFloat(data.capex),
      parseFloat(data.lifespan),
      energy,
    );

    res.json({ energy, grid, generator, solar, comparison });
  } catch (err) {
    next(err);
  }
};
