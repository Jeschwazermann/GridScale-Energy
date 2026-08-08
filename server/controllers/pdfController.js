import { buildQuotationPdf } from "../services/quotationPdf.js";
import logger from "../utils/logger.js";
import AppError from "../utils/AppError.js";

export async function generateQuotationPdf(req, res, next) {
  try {
    const { id } = req.params;
    const installerId = req.installer.id;

    logger.info(
      `PDF generation requested — quotation ${id} by installer ${installerId}`,
    );

    const pdfBuffer = await buildQuotationPdf({ quotationId: id, installerId });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="quotation-${id}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    res.end(pdfBuffer);
  } catch (err) {
    next(err);
  }
}
