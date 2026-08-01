import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  createConsumptionProfile,
  deleteConsumptionProfile,
  getConsumptionProfile,
  getCustomerProfiles,
  getProfileTemplates,
  replaceProfileAppliances,
  updateConsumptionProfile,
} from "../controllers/consumptionProfileController.js";

const router = express.Router();

router.use(requireAuth);

router.get("/templates/:profileType", getProfileTemplates);

// Customer detail page — list all profiles for a customer
router.get("/customer/:customerId", getCustomerProfiles);

// Full profile + appliances (ProfileBuilder edit mode, assessment seed)
router.get("/:profileId", getConsumptionProfile);

// Create profile + appliances in one call (ProfileBuilder Step 4 save)
router.post("/", createConsumptionProfile);

// Update header fields only (notes, grid hours, peak period, etc.)
router.patch("/:profileId", updateConsumptionProfile);

// Replace all appliances for a profile (full list, not partial)
// Triggers load curve recompute automatically via DB trigger
router.put("/:profileId/appliances", replaceProfileAppliances);

// Soft consideration: assessments with this profile_id get profile_id = null
router.delete("/:profileId", deleteConsumptionProfile);

export default router;
