import { logger } from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  const isOperational = err.isOperational || statusCode < 500;

  /* ── Logging ── */
  const logPayload = {
    method: req.method,
    path: req.originalUrl,
    status: statusCode,
    message: err.message,
    ...(req.user?.id && { userId: req.user.id }),
  };

  if (isOperational) {
    logger.warn("Operational error", logPayload);
  } else {
    logger.error("Unexpected error", { ...logPayload, stack: err.stack });
  }

  /* ── Response ── */
  const responseMessage = isOperational
    ? err.message
    : "Something went wrong on our end. Please try again.";

  res.status(statusCode).json({
    error: responseMessage,
    ...(process.env.NODE_ENV !== "production" &&
      !isOperational && {
        stack: err.stack, // only in dev, only for unexpected errors
      }),
  });
};

export default errorHandler;