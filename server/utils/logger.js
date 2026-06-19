import winston from "winston";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const consoleFormat = combine(
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) =>
    stack
      ? `${timestamp} ${level}: ${message}\n${stack}`
      : `${timestamp} ${level}: ${message}`,
  ),
);

/* ── File format — structured JSON for log aggregation later ── */
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json(),
);

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format: fileFormat,
    }),
  ],
});

export default logger;
