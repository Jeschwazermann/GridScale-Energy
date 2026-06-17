// import express from "express";
// import cors from "cors";
// import calculatorRoute from "./routes/calculatorRoute.js";

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.use("/api", calculatorRoute);

// app.use((err, req, res, next) => {
//   console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
//   res.status(err.status || 500).json({
//     error: err.message || "Internal server error",
//   });
// });

// export default app;

import express from "express";
import cors from "cors";
import calculatorRoutes from "./routes/calculatorRoutes.js";
import installerRoutes from "./routes/installerRoute.js";
import leadRoutes from "./routes/leadRoute.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: "5mb" })); // 5mb for base64 logo uploads

app.use("/api", calculatorRoutes); // POST /api/calculate
app.use("/api/installer", installerRoutes); // all /api/installer/* routes
app.use("/api/leads", leadRoutes); // POST /api/leads (public)

app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

export default app;
