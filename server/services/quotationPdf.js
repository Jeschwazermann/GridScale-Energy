import puppeteer from "puppeteer";
import { supabaseAdmin } from "../lib/supabase.js";
import { renderQuotationHtml } from "../templates/quotationTemplate.js";
import logger from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";

const VAT_RATE = 0.075; // 7.5% Nigerian VAT

export async function buildQuotationPdf({ quotationId, installerId }) {
  logger.info(`buildQuotationPdf: start — quotation ${quotationId}`);

  const data = await fetchQuotationData({ quotationId, installerId });
  const html = renderQuotationHtml(data);
  const pdfBuffer = await renderPdf(html);

  logger.info(`buildQuotationPdf: done — ${pdfBuffer.length} bytes`);
  return pdfBuffer;
}

// ─── Data Fetching
async function fetchQuotationData({ quotationId, installerId }) {
  // 1. Quotation (ownership check included via installer_id filter)
  const { data: quotation, error: qErr } = await supabaseAdmin
    .from("quotations")
    .select("*")
    .eq("id", quotationId)
    .eq("installer_id", installerId)
    .single();

  if (qErr || !quotation) {
    throw new AppError("Quotation not found or access denied.", 404);
  }

  // 2. Parallel fetch: installer, customer, assessment
  const [installer, customer, assessment] = await Promise.all([
    fetchInstaller(installerId),
    fetchCustomer(quotation.customer_id),
    fetchAssessment(quotation.assessment_id),
  ]);

  // 3. Logo — base64 encode for inline embedding (skipped if no logo_url)
  const logoBase64 = installer.logo_url
    ? await fetchLogoAsBase64(installer.logo_url)
    : null;

  // 4. Line items + totals
  const lineItems = buildLineItems(quotation.line_items ?? []);
  const totals = computeTotals(lineItems);

  // 5. Cashflow — read from stored assessment result
  const cashflow = buildCashflowSummary(assessment.cashflow_result);

  // 6. Consumption profile snapshot from sizing_result
  const consumption = buildConsumptionSnapshot(assessment.sizing_result);

  return {
    quotationId,
    quoteRef: generateRef(quotationId),
    createdAt: quotation.created_at,
    validityDate: quotation.validity_date,
    paymentTerms: quotation.payment_terms,
    notes: quotation.notes,
    status: quotation.status,
    installer: { ...installer, logoBase64 },
    customer,
    lineItems,
    totals,
    cashflow,
    consumption,
  };
}

// ─── Individual Fetchers

async function fetchInstaller(installerId) {
  const { data, error } = await supabaseAdmin
    .from("installers")
    .select("id, company_name, contact_name, email, phone, address, logo_url")
    .eq("id", installerId)
    .single();

  if (error || !data) throw new AppError("Installer profile not found.", 404);
  return data;
}

async function fetchCustomer(customerId) {
  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("id, name, email, phone, address, state, lga")
    .eq("id", customerId)
    .single();

  if (error || !data) throw new AppError("Customer not found.", 404);
  return data;
}

async function fetchAssessment(assessmentId) {
  const { data, error } = await supabaseAdmin
    .from("assessments")
    .select("id, sizing_result, cashflow_result, appliances, settings")
    .eq("id", assessmentId)
    .single();

  if (error || !data) throw new AppError("Assessment not found.", 404);
  return data;
}

async function fetchLogoAsBase64(logoUrl) {
  try {
    const response = await fetch(logoUrl);
    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get("content-type") || "image/png";
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch (err) {
    logger.warn(`fetchLogoAsBase64: failed to fetch logo — ${err.message}`);
    return null; // non-fatal: PDF renders without logo
  }
}

// ─── Data Transformers ────────────────────────────────────────────────────────

function buildLineItems(rawItems) {
  return rawItems.map((item) => {
    const qty = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const total = qty * unitPrice;
    return {
      description: item.description ?? "—",
      quantity: qty,
      unitPrice,
      total,
    };
  });
}

function computeTotals(lineItems) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const vat = subtotal * VAT_RATE;
  const grandTotal = subtotal + vat;
  return { subtotal, vat, grandTotal, vatRate: VAT_RATE };
}

function buildCashflowSummary(cashflowResult) {
  if (!cashflowResult) return null;

  const { summary = {}, yearly = [], meta = {} } = cashflowResult;

  // Take first 10 years for the table
  const tableRows = yearly.slice(0, 10).map((row) => ({
    year: row.year,
    baselineCost: row.annualBaselineCost ?? 0, // diesel + grid cost without solar
    solarOpex: row.annualSolarOpex ?? 0, // solar O&M cost
    annualSavings: row.annualSavings ?? 0,
    cumulative: row.cumulativeSavings ?? 0,
    batteryReplacement: row.batteryReplacement ?? 0,
  }));

  return {
    paybackYears: summary.simplePaybackYears ?? null,
    crossoverYear: summary.crossoverYear ?? null,
    npvNaira: summary.npvNaira ?? null,
    roi: summary.roi ?? null,
    roiPercent: summary.roiPercent ?? null,
    tenYearSavings: summary.tenYearSavingsNaira ?? null,
    lifetimeSavings: summary.lifetimeSavingsNaira ?? null,
    currentAnnualSpend: summary.currentAnnualSpend ?? null,
    monthlyEquivalentSaving: summary.monthlyEquivalentSavingYear1 ?? null,
    lifespan: meta.lifespan ?? 22,
    capexNaira: meta.capexNaira ?? null,
    tableRows,
  };
}

function buildConsumptionSnapshot(sizingResult) {
  if (!sizingResult) return null;

  // Actual shape: { panels: {count, totalKwp, unitWp, label},
  //                 battery: {units, totalKwh, label},
  //                 inverter: {sizeKva, ratingKw, label},
  //                 effectiveDailyKWh, estimatedCapex: {total} }
  return {
    dailyKWh: sizingResult.effectiveDailyKWh ?? 0,
    systemSizeKWp: sizingResult.panels?.totalKwp ?? 0,
    panelCount: sizingResult.panels?.count ?? 0,
    panelWp: sizingResult.panels?.unitWp ?? 0,
    panelLabel: sizingResult.panels?.label ?? "",
    batteryKWh: sizingResult.battery?.totalKwh ?? 0,
    batteryUnits: sizingResult.battery?.units ?? 0,
    batteryLabel: sizingResult.battery?.label ?? "",
    inverterKva: sizingResult.inverter?.sizeKva ?? 0,
    inverterKW: sizingResult.inverter?.ratingKw ?? 0,
    inverterLabel: sizingResult.inverter?.label ?? "",
    peakSunHours: sizingResult.irradiance?.peakSunHours ?? 0,
    estimatedCapex: sizingResult.estimatedCapex?.total ?? 0,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateRef(quotationId) {
  // e.g. GSA-A1B2 from first 8 chars of UUID
  return `GSA-${quotationId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

// ─── Puppeteer ────────────────────────────────────────────────────────────────

async function renderPdf(html) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" },
    });

    return Buffer.from(pdf);
  } finally {
    if (browser) await browser.close();
  }
}
