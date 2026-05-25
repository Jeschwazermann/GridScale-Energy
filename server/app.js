import express from "express";
import cors from "cors";
import calculatorRoute from "./routes/calculatorRoute.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", calculatorRoute);

app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

export default app;
