import { Router } from "express";
import { submitLead } from "../controllers/leadController.js";

const router = Router();

/* Public — no auth. Consumer submits from the results page. */
router.post("/", submitLead);

export default router;
