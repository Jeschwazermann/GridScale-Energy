import express from "express";
import cors from "cors";
import calculatorRoute from "./routes/calculatorRoute.js";

const app = express();


app.use(cors());
app.use(express.json());

app.use("/api", calculatorRoute);

export default app;
