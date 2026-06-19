import express from "express";
import cors from "cors";
import morgan from "morgan";
import calculatorRoutes from "./routes/calculatorRoute.js";
import installerRoutes from "./routes/installerRoute.js";
import leadRoutes from "./routes/leadRoute.js";
import logger from "./utils/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import notFoundHandler from "./middleware/notFoundHandler.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: "5mb" })); // 5mb for base64 logo uploads

app.use(
  morgan("short", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

app.use("/api", calculatorRoutes); // POST /api/calculate
app.use("/api/installer", installerRoutes); // all /api/installer/* routes
app.use("/api/leads", leadRoutes); // POST /api/leads (public)

app.use(errorHandler);

app.use(notFoundHandler);

export default app;
