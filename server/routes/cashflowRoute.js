import express from "express";
import {
  createAssessmentProjection,
  getAssessmentProjection,
  getCashflowDefaults,
  getScenarioCrossovers,
  previewLoanSchedule,
} from "../controllers/cashflowController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Public — no auth needed ──
router.get("/defaults", getCashflowDefaults);

router.use(requireAuth);

// ---------------------------------------------------------------------------
// POST /api/cashflow/assessment/:assessmentId
//
// Compute (or recompute) a cashflow projection for an assessment.
// Persists the result to assessments.cashflow_result if it changed.
//
// Body (all optional):
// {
//   financing: {
//     annualRate:  0.22,
//     termMonths:  60,
//     downPayment: 500000
//   },
//   overrides: {
//     defaultDieselPriceNairaPerLitre: 1400,
//     dieselEscalationRate:            0.18
//   },
//   persist: true   // default true — set false for "preview" calls
// }
// ---------------------------------------------------------------------------
router.post("/assessment/:assessmentId", createAssessmentProjection);

// ---------------------------------------------------------------------------
// GET /api/cashflow/assessment/:assessmentId
// Returns the frozen cashflow_result if it exists.
// If not, returns 404 so the UI knows to trigger a compute.
router.get("/assessment/:assessmentId", getAssessmentProjection);

// ---------------------------------------------------------------------------
// POST /api/cashflow/loan-preview
//
// Compute monthly repayment for a given loan structure.
// Lightweight — no assessment needed, no DB write.
// Called by the financing slider in the quotation builder.
//
// Body: { capexNaira, annualRate, termMonths, downPayment }
// ---------------------------------------------------------------------------
router.post("/loan-preview", previewLoanSchedule);

// POST /api/cashflow/scenarios/:assessmentId
// Return crossover years for 3 diesel price scenarios (conservative,
// current, optimistic) based on the same assessment.
// Used by the "What if diesel hits ₦X?" panel in the chart.
router.post("/scenarios/:assessmentId", getScenarioCrossovers);

// GET /api/cashflow/defaults
// Returns current NIGERIA_DEFAULTS so the frontend can show them
// in the "assumptions" panel on the chart without hardcoding them.
// ---------------------------------------------------------------------------
router.get("/defaults", getCashflowDefaults);

export default router;
