// app.js

import express from "express";
import cors from "cors";
import calculatorRoutes from "./routes/calculatorRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api", calculatorRoutes);

export default app;
