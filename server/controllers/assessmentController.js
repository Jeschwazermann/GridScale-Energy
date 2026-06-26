import { calculateEnergy } from "../services/energyService.js";
import { gridCost } from "../services/gridService.js";
import { generatorCost } from "../services/generatorService.js";
import { solarCost } from "../services/solarService.js";
import { compareCosts } from "../services/comparisonService.js";
import { supabaseForUser } from "../lib/supabase.js";
import { AppError } from "../utils/AppError.js";

/* POST /api/installer/assessments */
export const createAssessment = async (req, res, next) => {
  try {
    const data = req.body;

    /* ── Validate customer belongs to this installer ── */
    const db = supabaseForUser(req.token);
    const { data: customer, error: customerError } = await db
      .from("customers")
      .select("id")
      .eq("id", data.customerId)
      .eq("installer_id", req.user.id)
      .single();

    if (customerError || !customer) {
      const err = new AppError("Customer not found.", 404);
      return next(err);
    }

    /* ── Validate required inputs ── */
    if (!data.appliances || data.appliances.length === 0) {
      const err = new AppError("At least one appliance is required.", 400);
      return next(err);
    }

    const hasGrid = data.gridTariff != null && !isNaN(data.gridTariff);
    const hasGenerator =
      data.fuelPrice != null &&
      !isNaN(data.fuelPrice) &&
      data.efficiency != null &&
      !isNaN(data.efficiency);

    if (!hasGrid && !hasGenerator) {
      const err = new AppError("Include at least one comparison source.", 400);
      return next(err);
    }

    if (data.gridHours == null || isNaN(data.gridHours)) {
      const err = new AppError("Grid hours per day is required.", 400);
      return next(err);
    }

    /* ── Run calculation ── */
    const energy = calculateEnergy(data.appliances, parseFloat(data.gridHours));
    const grid = hasGrid ? gridCost(energy, data.gridTariff) : null;
    const generator = hasGenerator
      ? generatorCost(energy, data.fuelPrice, data.efficiency)
      : null;
    const solar = solarCost(energy, data.capex, data.lifespan);
    const comparison = compareCosts(
      grid,
      generator,
      solar,
      parseFloat(data.capex),
      parseFloat(data.lifespan),
      energy,
    );

    const result = { energy, grid, generator, solar, comparison };

    /* ── Save to database ── */
    const { data: assessment, error: saveError } = await db
      .from("assessments")
      .insert({
        customer_id: data.customerId,
        installer_id: req.user.id,
        appliances: data.appliances,
        settings: {
          gridTariff: data.gridTariff ?? null,
          fuelPrice: data.fuelPrice ?? null,
          efficiency: data.efficiency ?? null,
          capex: data.capex,
          lifespan: data.lifespan,
          gridHours: data.gridHours,
        },
        results: result,
      })
      .select()
      .single();

    if (saveError) throw saveError;

    res.status(201).json(assessment);
  } catch (err) {
    next(err);
  }
};

/* GET /api/installer/assessments/:id */
export const getAssessment = async (req, res, next) => {
  try {
    const db = supabaseForUser(req.token);
    const { data, error } = await db
      .from("assessments")
      .select("*")
      .eq("id", req.params.id)
      .eq("installer_id", req.user.id)
      .single();

    if (error || !data) {
      const err = new AppError("Assessment not found.", 404);
      return next(err);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};
