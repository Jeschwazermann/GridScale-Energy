import { sizeSystem } from "../services/sizingService.js";
import { getIrradianceForLocation } from "../services/irradiationService.js";
import { AppError } from "../utils/AppError.js";

/* POST /api/installer/sizing */
export const getSizing = async (req, res, next) => {
  try {
    const { effectiveDailyKWh, address, lga, state } = req.body;

    if (!effectiveDailyKWh || isNaN(effectiveDailyKWh)) {
      const err = new AppError("effectiveDailyKWh is required.", 400);
      return next(err);
    }

    // Irradiance lookup has its own internal fallback (address -> lga ->
    // state constant), so this call should never throw — but guard it
    // anyway since it's the one network-dependent step in an otherwise
    // pure-calculation route.
    let irradiance;
    try {
      irradiance = await getIrradianceForLocation({ address, lga, state });
    } catch (irradianceErr) {
      console.error(
        "Irradiance lookup failed unexpectedly:",
        irradianceErr.message,
      );
      irradiance = { worstMonth: undefined, source: "fallback" };
    }

    const sizing = sizeSystem(parseFloat(effectiveDailyKWh), {
      peakSunHours: irradiance.worstMonth,
      irradianceSource: irradiance.source,
    });

    res.json(sizing);
  } catch (err) {
    next(err);
  }
};