import express from "express";
import cors from "cors";
import morgan from "morgan";
import calculatorRoutes from "./routes/calculatorRoute.js";
import installerRoutes from "./routes/installerRoute.js";
import leadRoutes from "./routes/leadRoute.js";
import profileRoutes from "./routes/consumptionProfileRoute.js";
import cashflowRoutes from "./routes/cashflowRoute.js";
import quotationPdfRoutes from "./routes/quotationpdfRoute.js";
import logRoutes from "./routes/log.js";
import logger from "./utils/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import notFoundHandler from "./middleware/notFoundHandler.js";

const app = express();

const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL, // production frontend
  "http://localhost:5173", // local dev (Vite default)
  "http://localhost:4173", // local preview (vite preview)
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server / curl (no origin header)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "5mb" }));
app.use(
  morgan("short", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

app.use("/api", calculatorRoutes);
app.use("/api/installer", installerRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/cashflow", cashflowRoutes);
app.use("/api/quotations", quotationPdfRoutes);
app.use("/api/log", logRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
