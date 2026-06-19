/**
 * AppError — for expected, user-facing errors.
 *
 * Examples: "Customer not found", "Invalid input", "Unauthorized"
 *
 * These are errors we anticipated and want to show directly to the client.
 * They are NOT bugs — isOperational marks them as safe to expose.
 *
 * Usage:
 *   throw new AppError("Customer not found.", 404);
 *   throw new AppError("Email already in use.", 409);
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguishes from unexpected bugs
    Error.captureStackTrace(this, this.constructor);
  }
}
