import { supabaseForUser } from "../lib/supabase.js";
import {AppError} from "../utils/AppError.js";

/* GET /api/installer/profile */
export const getProfile = async (req, res, next) => {
  try {
    const db = supabaseForUser(req.token);
    const { data, error } = await db
      .from("installers")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (error || !data) {
      const err = new AppError("Profile not found.", 404);
      return next(err);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

/* PUT /api/installer/profile */
export const updateProfile = async (req, res, next) => {
  try {
    const {
      companyName,
      contactName,
      phone,
      address,
      defaultGridTariff,
      defaultFuelPrice,
    } = req.body;

    const db = supabaseForUser(req.token);
    const { data, error } = await db
      .from("installers")
      .update({
        ...(companyName !== undefined && { company_name: companyName }),
        ...(contactName !== undefined && { contact_name: contactName }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(defaultGridTariff !== undefined && {
          default_grid_tariff: defaultGridTariff,
        }),
        ...(defaultFuelPrice !== undefined && {
          default_fuel_price: defaultFuelPrice,
        }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

/* POST /api/installer/profile/logo
   Receives a base64 image, uploads to Supabase Storage. */
export const uploadLogo = async (req, res, next) => {
  try {
    const { base64, mimeType } = req.body;

    if (!base64 || !mimeType) {
      const err = new AppError("base64 image data and mimeType are required.", 400);
      return next(err);
    }

    const db = supabaseForUser(req.token);
    const buffer = Buffer.from(base64, "base64");
    const ext = mimeType.split("/")[1] ?? "png";
    const fileName = `${req.user.id}/logo.${ext}`;

    const { error: uploadError } = await db.storage
      .from("logos")
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: true, // replace existing logo
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = db.storage.from("logos").getPublicUrl(fileName);

    /* Save public URL to profile */
    const { data, error } = await db
      .from("installers")
      .update({ logo_url: urlData.publicUrl })
      .eq("id", req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ logoUrl: data.logo_url });
  } catch (err) {
    next(err);
  }
};
