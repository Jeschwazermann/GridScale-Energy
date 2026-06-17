import { supabaseForUser } from "../lib/supabase.js";

/* POST /api/installer/quotations */
export const createQuotation = async (req, res, next) => {
  try {
    const { assessmentId, lineItems, validityDate, paymentTerms, notes } =
      req.body;

    if (!assessmentId || !lineItems || lineItems.length === 0) {
      const err = new Error(
        "assessmentId and at least one line item are required.",
      );
      err.status = 400;
      return next(err);
    }

    const db = supabaseForUser(req.token);

    /* Verify assessment belongs to this installer and fetch customer */
    const { data: assessment, error: aErr } = await db
      .from("assessments")
      .select("id, customer_id")
      .eq("id", assessmentId)
      .eq("installer_id", req.user.id)
      .single();

    if (aErr || !assessment) {
      const err = new Error("Assessment not found.");
      err.status = 404;
      return next(err);
    }

    const totalCost = lineItems.reduce(
      (sum, item) =>
        sum + parseFloat(item.quantity) * parseFloat(item.unitPrice),
      0,
    );

    const { data, error } = await db
      .from("quotations")
      .insert({
        assessment_id: assessmentId,
        customer_id: assessment.customer_id,
        installer_id: req.user.id,
        line_items: lineItems,
        total_cost: totalCost,
        validity_date: validityDate || null,
        payment_terms: paymentTerms || null,
        notes: notes || null,
        status: "draft",
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

/* GET /api/installer/quotations/:id */
export const getQuotation = async (req, res, next) => {
  try {
    const db = supabaseForUser(req.token);
    const { data, error } = await db
      .from("quotations")
      .select("*, assessments(*), customers(*)")
      .eq("id", req.params.id)
      .eq("installer_id", req.user.id)
      .single();

    if (error || !data) {
      const err = new Error("Quotation not found.");
      err.status = 404;
      return next(err);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};

/* PUT /api/installer/quotations/:id */
export const updateQuotation = async (req, res, next) => {
  try {
    const { lineItems, validityDate, paymentTerms, notes, status } = req.body;

    const totalCost = lineItems
      ? lineItems.reduce(
          (sum, item) =>
            sum + parseFloat(item.quantity) * parseFloat(item.unitPrice),
          0,
        )
      : undefined;

    const db = supabaseForUser(req.token);
    const { data, error } = await db
      .from("quotations")
      .update({
        ...(lineItems !== undefined && { line_items: lineItems }),
        ...(totalCost !== undefined && { total_cost: totalCost }),
        ...(validityDate !== undefined && { validity_date: validityDate }),
        ...(paymentTerms !== undefined && { payment_terms: paymentTerms }),
        ...(notes !== undefined && { notes }),
        ...(status !== undefined && { status }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .eq("installer_id", req.user.id)
      .select()
      .single();

    if (error || !data) {
      const err = new Error("Quotation not found.");
      err.status = 404;
      return next(err);
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
};
