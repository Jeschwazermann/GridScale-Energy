import { AppError } from "../utils/AppError.js";

const notFoundHandler = (req, res, next) => {
  const err = new AppError(
    `Route not found: ${req.method} ${req.originalUrl} not found`,
    404,
  );
  next(err);
};

export default notFoundHandler;
