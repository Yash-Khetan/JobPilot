// src/index.js — Express app entry point
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet"


import authRoutes from "./routes/auth.js";
import scrapeRoutes from "./routes/scrape.js";
import trackerRoutes from "./routes/tracker.js";
import resumeRoutes from "../job_matching/controller.js";

// app.use(helmet());
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Welcome to JobPilot Backend 🧭" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/scrape", scrapeRoutes);
app.use("/api/tracker", trackerRoutes);
app.use("/api/resume", resumeRoutes);

app.listen(PORT, () => {
  console.log(`🚀 JobPilot server running on http://localhost:${PORT}`);
});
