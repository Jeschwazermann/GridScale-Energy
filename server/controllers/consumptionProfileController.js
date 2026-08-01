import {
  createProfile,
  getProfileWithAppliances,
  getProfilesByCustomer,
  updateProfile,
  updateProfileAppliances,
  deleteProfile,
  getApplianceTemplates,
} from "../services/consumptionProfile.js";
import { AppError } from "../utils/AppError.js";

export const getProfileTemplates = async (req, res, next) => {
  try {
    const templates = await getApplianceTemplates(req.params.profileType);
    res.json({ templates });
  } catch (err) {
    next(err);
  }
};

export const getCustomerProfiles = async (req, res, next) => {
  try {
    const profiles = await getProfilesByCustomer(req.params.customerId);
    res.json({ profiles });
  } catch (err) {
    next(err);
  }
};

export const getConsumptionProfile = async (req, res, next) => {
  try {
    const data = await getProfileWithAppliances(req.params.profileId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const createConsumptionProfile = async (req, res, next) => {
  try {
    const { profile, appliances } = req.body;

    if (!profile?.customer_id)
      throw new AppError("customer_id is required", 400);
    if (!profile?.profile_type)
      throw new AppError("profile_type is required", 400);

    const installerId = req.user.id;
    const result = await createProfile(profile, appliances ?? [], installerId);

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateConsumptionProfile = async (req, res, next) => {
  try {
    const { id, installer_id, customer_id, load_curve_24h, ...safeUpdates } =
      req.body;
    const updated = await updateProfile(req.params.profileId, safeUpdates);
    res.json({ profile: updated });
  } catch (err) {
    next(err);
  }
};

export const replaceProfileAppliances = async (req, res, next) => {
  try {
    const { appliances } = req.body;
    if (!Array.isArray(appliances)) {
      throw new AppError("appliances must be an array", 400);
    }

    const updated = await updateProfileAppliances(
      req.params.profileId,
      appliances,
    );
    res.json({ appliances: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteConsumptionProfile = async (req, res, next) => {
  try {
    await deleteProfile(req.params.profileId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
