import { sizeSystem } from "../services/sizingService.js";

/* POST /api/installer/sizing */
export const getSizing = (req, res, next) => {
  try {
    const { effectiveDailyKWh } = req.body;

    if (!effectiveDailyKWh || isNaN(effectiveDailyKWh)) {
      const err = new Error("effectiveDailyKWh is required.");
      err.status = 400;
      return next(err);
    }

    const sizing = sizeSystem(parseFloat(effectiveDailyKWh));
    res.json(sizing);
  } catch (err) {
    next(err);
  }
};
