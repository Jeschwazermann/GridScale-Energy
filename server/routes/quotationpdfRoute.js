import express from "express";
import { generateQuotationPdf } from "../controllers/pdfController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/quotations/:id/pdf
router.get("/:id/pdf", requireAuth, generateQuotationPdf);

export default router;
