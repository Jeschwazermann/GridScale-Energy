// routes/log.js
import { Router } from "express";
import { logger } from "../utils/logger.js";

const router = Router();

router.post("/client-error", (req, res) => {
  const { message, stack, componentStack, url } = req.body;
  logger.error(`CLIENT ERROR: ${message}`, { stack, componentStack, url });
  res.status(204).end();
});

export default router;
