import puppeteer from "puppeteer";
import logger from "../utils/logger.js";

/**
 * Orchestrates data fetching, HTML rendering, and Puppeteer PDF generation.
 * @param {{ quotationId: string, installerId: string }} params
 * @returns {Promise<Buffer>} Raw PDF buffer
 */
export async function buildQuotationPdf({ quotationId, installerId }) {
  logger.info(`buildQuotationPdf: start — quotation ${quotationId}`);

  // ── Step 1: Data fetching (populated in Phase 4 Step 2) ──────────────────
  const data = {
    quotationId,
    installer: {
      companyName: "GridScale Test Installer",
      address: "Lagos, Nigeria",
    },
    customer: {
      name: "Test Customer",
      address: "Victoria Island, Lagos",
      phone: "0801 234 5678",
    },
    lineItems: [],
    totals: { subtotal: 0, vat: 0, grandTotal: 0 },
    cashflow: null,
    consumptionProfile: null,
  };

  // ── Step 2: Render HTML (populated in Phase 4 Step 3) ────────────────────
  const html = renderSkeletonHtml(data);

  // ── Step 3: Puppeteer → PDF ───────────────────────────────────────────────
  const pdfBuffer = await renderPdf(html);

  logger.info(`buildQuotationPdf: done — ${pdfBuffer.length} bytes`);
  return pdfBuffer;
}

/**
 * Temporary skeleton HTML — confirms Puppeteer pipeline works.
 * Replaced by quotationTemplate.js in Step 3.
 */
function renderSkeletonHtml({ quotationId, installer, customer }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; padding: 40px; color: #1a1a1a; }
    h1 { color: #d97706; }
    .label { color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <h1>Solar Energy Quotation</h1>
  <p class="label">Quotation ID</p>
  <p>${quotationId}</p>
  <p class="label">Installer</p>
  <p>${installer.companyName} — ${installer.address}</p>
  <p class="label">Customer</p>
  <p>${customer.name} — ${customer.address}</p>
  <p style="margin-top:40px; color:#6b7280; font-size:11px;">
    PDF pipeline confirmed ✓ — full template renders in Step 3
  </p>
</body>
</html>`;
}

/**
 * Launches Puppeteer, renders HTML, returns PDF buffer.
 * @param {string} html
 * @returns {Promise<Buffer>}
 */
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
      margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
    });

    return Buffer.from(pdf);
  } finally {
    if (browser) await browser.close();
  }
}
