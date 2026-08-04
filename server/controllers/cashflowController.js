import { supabaseAdmin } from "../lib/supabase.js";
import {
  computeFromAssessment,
  computeLoanSchedule,
  computeScenarios,
  NIGERIA_DEFAULTS,
} from "../services/cashflowService.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

export const createAssessmentProjection = async (req, res, next) => {
  try {
    const { assessmentId } = req.params;
    const { financing = null, overrides = {}, persist = true } = req.body;

    const { data: assessment, error: fetchErr } = await supabaseAdmin
      .from("assessments")
      .select("id, results, settings, sizing_result, customer_id")
      .eq("id", assessmentId)
      .single();

    console.log("[cashflow] assessment fetch:", {
      found: !!assessment,
      error: fetchErr?.message,
      code: fetchErr?.code,
    });

    if (fetchErr || !assessment) {
      throw new AppError("Assessment not found", 404);
    }

    const assessmentWithOverrides = {
      ...assessment,
      settings: {
        ...(assessment.settings ?? {}),
        ...overrides,
      },
    };

    const projection = computeFromAssessment(
      assessmentWithOverrides,
      financing,
    );

    if (persist) {
      const { error: persistErr } = await supabaseAdmin
        .from("assessments")
        .update({ cashflow_result: projection })
        .eq("id", assessmentId);

      if (persistErr) {
        logger.warn("cashflow: failed to persist result", {
          assessmentId,
          error: persistErr.message,
        });
      }
    }

    res.json({ projection });
  } catch (err) {
    next(err);
  }
};

export const getAssessmentProjection = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("assessments")
      .select("cashflow_result")
      .eq("id", req.params.assessmentId)
      .single();

    if (error) throw new AppError("Assessment not found", 404);

    if (!data.cashflow_result) {
      return res.status(404).json({
        error: "No cashflow projection computed yet for this assessment.",
      });
    }

    res.json({ projection: data.cashflow_result });
  } catch (err) {
    next(err);
  }
};

export const previewLoanSchedule = async (req, res, next) => {
  try {
    const { capexNaira, annualRate, termMonths, downPayment = 0 } = req.body;

    if (!capexNaira) throw new AppError("capexNaira is required", 400);

    const schedule = computeLoanSchedule({
      capexNaira,
      annualRate: annualRate ?? NIGERIA_DEFAULTS.discountRate,
      termMonths: termMonths ?? 60,
      downPayment,
    });

    res.json({ schedule });
  } catch (err) {
    next(err);
  }
};

export const getScenarioCrossovers = async (req, res, next) => {
  try {
    const { data: assessment, error } = await supabaseAdmin
      .from("assessments")
      .select("results, settings, sizing_result")
      .eq("id", req.params.assessmentId)
      .single();

    if (error || !assessment) throw new AppError("Assessment not found", 404);

    const result = assessment.results ?? assessment.result;
    const settings = assessment.settings ?? {};
    const sizing = assessment.sizing_result;

    const dailyKwhDemand = result?.energy?.effectiveDailyKWh;
    if (!dailyKwhDemand) {
      throw new AppError("Assessment missing effectiveDailyKWh", 400);
    }

    let capexNaira = settings.capex ?? null;
    if (!capexNaira && sizing?.capex) {
      capexNaira = sizing.capex.max
        ? Math.round((sizing.capex.min + sizing.capex.max) / 2)
        : sizing.capex.min;
    }
    if (!capexNaira) throw new AppError("No CAPEX figure available", 400);

    const scenarios = computeScenarios({
      capexNaira,
      dailyKwhDemand,
      gridHoursPerDay: settings.gridHours ?? 6,
      generatorHoursPerDay: settings.generatorHours ?? 8,
    });

    res.json({ scenarios });
  } catch (err) {
    next(err);
  }
};

export const getCashflowDefaults = (_req, res) => {
  res.json({ defaults: NIGERIA_DEFAULTS });
};
