import { supabaseForUser } from "../lib/supabase.js";
import {AppError} from "../utils/AppError.js";

/* GET /api/installer/customers */
export const getCustomers = async (req, res, next) => {
  try {
    const db = supabaseForUser(req.token);
    const { data, error } = await db
      .from("customers")
      .select("*, assessments(id, created_at)")
      .eq("installer_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

/* POST /api/installer/customers */
export const createCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, state, lga, notes } = req.body;

    if (!name || !phone) {
      const err = new AppError("Customer name and phone are required.", 400);
      return next(err);
    }

    const db = supabaseForUser(req.token);
    const { data, error } = await db
      .from("customers")
      .insert({
        installer_id: req.user.id,
        name,
        phone,
        email: email || null,
        state: state || null,
        lga: lga || null,
        notes: notes || null,
        status: "new",
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

/* GET /api/installer/customers/:id */
export const getCustomer = async (req, res, next) => {
  try {
    const db = supabaseForUser(req.token);
    const { data, error } = await db
      .from("customers")
      .select("*, assessments(*), quotations(*)")
      .eq("id", req.params.id)
      .eq("installer_id", req.user.id)
      .single();

    if (error || !data) {
      const err = new AppError("Customer not found.", 404);
      err.status = 404;
      return next(err);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

/* PUT /api/installer/customers/:id */
export const updateCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, state, lga, status, notes } = req.body;

    const db = supabaseForUser(req.token);
    const { data, error } = await db
      .from("customers")
      .update({
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(state !== undefined && { state }),
        ...(lga !== undefined && { lga }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .eq("installer_id", req.user.id)
      .select()
      .single();

    if (error || !data) {
      const err = new AppError("Customer not found or update failed.", 404);
      return next(err);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

/* DELETE /api/installer/customers/:id */
export const deleteCustomer = async (req, res, next) => {
  try {
    const db = supabaseForUser(req.token);
    const { error } = await db
      .from("customers")
      .delete()
      .eq("id", req.params.id)
      .eq("installer_id", req.user.id);

    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
