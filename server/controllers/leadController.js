import { supabaseAdmin, supabaseForUser } from "../lib/supabase.js";
import { AppError } from "../utils/AppError.js";

/* POST /api/leads  — PUBLIC, no auth required
   Consumer submits "Get Solar Quote" from the results page. */
export const submitLead = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      email,
      state,
      lga,
      calculatorResult,
      calculatorInputs,
    } = req.body;

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
        calculator_inputs: calculatorInputs || null,
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

    /* First, read the lead to check its current state */
    const { data: lead, error: leadError } = await db
      .from("leads")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    //console.log("Lead read result:", { lead, leadError, userId: req.user.id });

    if (leadError) throw leadError;
    if (!lead) return next(new AppError("Lead not found.", 404));

    /* Already claimed by this installer — idempotent success */
    if (lead.claimed_by === req.user.id) {
      return res.json(lead);
    }

    /* Already claimed by someone else */
    if (lead.claimed_by !== null) {
      return next(new AppError("Lead not found or already claimed.", 409));
    }

    /* Use admin client for the update — RLS on the leads table would
       otherwise silently block the write and return data: null, which
       looks identical to a 409 conflict from the controller's perspective */
    const { data, error } = await supabaseAdmin
      .from("leads")
      .update({
        claimed_by: req.user.id,
        status: "claimed",
      })
      .eq("id", req.params.id)
      .is("claimed_by", null) // prevent double-claiming in a race
      .select()
      .maybeSingle();

    console.log("Claim update result:", { data, error });
    if (error || !data) {
      return next(new AppError("Lead not found or already claimed.", 409));
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

/* PUT /api/installer/leads/:id/convert — create customer + mark lead converted */
export const convertLead = async (req, res, next) => {
  try {
    console.log(
      "[convertLead] Starting — lead:",
      req.params.id,
      "installer:",
      req.user.id,
    );

    /* Fetch lead — only matches if this installer owns it */
    const { data: lead, error: leadErr } = await supabaseAdmin
      .from("leads")
      .select("*")
      .eq("id", req.params.id)
      .eq("claimed_by", req.user.id)
      .maybeSingle();

    console.log("[convertLead] Lead fetch:", { lead, leadErr });

    if (leadErr) throw leadErr;
    if (!lead) return next(new AppError("Lead not found.", 404));

    /* Create customer from lead */
    const { data: customer, error: custErr } = await supabaseAdmin
      .from("customers")
      .insert({
        installer_id: req.user.id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email ?? null,
        state: lead.state ?? null,
        lga: lead.lga ?? null,
        status: "new",
        notes: "Created from calculator lead",
      })
      .select()
      .single();

    console.log("[convertLead] Customer insert:", { customer, custErr });

    if (custErr) throw custErr;

    /* ── Save consumer's calculator result as an assessment ──────────
       This lets the installer immediately see what the consumer saw
       without needing to re-run the full assessment from scratch.    */
    if (lead.calculator_result) {
      const { error: assessErr } = await supabaseAdmin
        .from("assessments")
        .insert({
          customer_id: customer.id,
          installer_id: req.user.id,
          /* Use stored inputs if available, otherwise empty defaults */
          appliances: lead.calculator_inputs?.appliances ?? [],
          settings: {
            ...(lead.calculator_inputs?.settings ?? {}),
            source: "consumer_calculator", // marks origin for the UI
          },
          results: lead.calculator_result,
        });

      if (assessErr) {
        /* Non-fatal — customer still created successfully */
        console.warn(
          "[convertLead] Assessment save failed:",
          assessErr.message,
        );
      }
    }

    /* Mark lead as converted */
    const { error: updateErr } = await supabaseAdmin
      .from("leads")
      .update({ status: "converted" })
      .eq("id", req.params.id);

    console.log("[convertLead] Lead status update:", { updateErr });
    if (updateErr) throw updateErr;

    console.log("[convertLead] Done — new customer id:", customer.id);

    /* Return both customerId (for navigation) and full customer object */
    res.json({ customerId: customer.id, customer });
  } catch (err) {
    console.error("[convertLead] Unhandled error:", err.message);
    next(err);
  }
};
