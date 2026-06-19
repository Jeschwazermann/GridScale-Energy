import { supabaseAdmin, supabaseForUser } from "../lib/supabase.js";
import { AppError } from "../utils/AppError.js";

/* POST /api/leads  — PUBLIC, no auth required
   Consumer submits "Get Solar Quote" from the results page. */
export const submitLead = async (req, res, next) => {
  try {
    const { name, phone, email, state, lga, calculatorResult } = req.body;

    if (!name || !phone) {
      const err = new AppError("Name and phone number are required.", 400);
      return next(err);
    }

    const { data, error } = await supabaseAdmin
      .from("leads")
      .insert({
        name,
        phone,
        email: email || null,
        state: state || null,
        lga: lga || null,
        calculator_result: calculatorResult || null,
        status: "new",
      })
      .select()
      .single();

    if (error) throw error;
    res
      .status(201)
      .json({ message: "Lead submitted successfully.", id: data.id });
  } catch (err) {
    next(err);
  }
};

/* GET /api/installer/leads — get all unclaimed leads + leads claimed by this installer */
export const getLeads = async (req, res, next) => {
  try {
    const db = supabaseForUser(req.token);
    const { data, error } = await db
      .from("leads")
      .select("*")
      .or(`claimed_by.is.null,claimed_by.eq.${req.user.id}`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

/* PUT /api/installer/leads/:id/claim — installer claims a lead */
export const claimLead = async (req, res, next) => {
  try {
    const db = supabaseForUser(req.token);

    /* Only claim if unclaimed */
    const { data, error } = await db
      .from("leads")
      .update({
        claimed_by: req.user.id,
        status: "claimed",
      })
      .eq("id", req.params.id)
      .is("claimed_by", null) // prevent double-claiming
      .select()
      .single();

    if (error || !data) {
      const err = new AppError("Lead not found or already claimed.", 409);
      return next(err);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

/* PUT /api/installer/leads/:id/convert — mark lead as converted */
export const convertLead = async (req, res, next) => {
  try {
    const db = supabaseForUser(req.token);
    const { data, error } = await db
      .from("leads")
      .update({ status: "converted" })
      .eq("id", req.params.id)
      .eq("claimed_by", req.user.id)
      .select()
      .single();

    if (error || !data) {
      const err = new AppError("Lead not found.", 404);
      return next(err);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};
