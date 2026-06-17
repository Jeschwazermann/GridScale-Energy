import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";

import {
  getCustomers,
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";
import {
  createAssessment,
  getAssessment,
} from "../controllers/assessmentController.js";
import { getSizing } from "../controllers/sizingController.js";
import {
  createQuotation,
  getQuotation,
  updateQuotation,
} from "../controllers/quotationController.js";
import {
  getLeads,
  claimLead,
  convertLead,
} from "../controllers/leadController.js";
import {
  getProfile,
  updateProfile,
  uploadLogo,
} from "../controllers/profileController.js";

const router = Router();

/* All installer routes require authentication */
router.use(requireAuth);

/* ── Customers ── */
router.get("/customers", getCustomers);
router.post("/customers", createCustomer);
router.get("/customers/:id", getCustomer);
router.put("/customers/:id", updateCustomer);
router.delete("/customers/:id", deleteCustomer);

/* ── Assessments ── */
router.post("/assessments", createAssessment);
router.get("/assessments/:id", getAssessment);

/* ── Sizing ── */
router.post("/sizing", getSizing);

/* ── Quotations ── */
router.post("/quotations", createQuotation);
router.get("/quotations/:id", getQuotation);
router.put("/quotations/:id", updateQuotation);

/* ── Leads ── */
router.get("/leads", getLeads);
router.put("/leads/:id/claim", claimLead);
router.put("/leads/:id/convert", convertLead);

/* ── Profile ── */
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/profile/logo", uploadLogo);

export default router;
