import "express-async-errors";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import http from "http";

import { connectDB } from "./config/db";
import { env } from "./config/env";
import router from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

const app: Application = express();
const server = http.createServer(app);

// ─── Connect DB ───────────────────────────────────────────────────────────────
// Connect DB in background — Mongoose buffers any incoming requests
connectDB();

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());

// CORS configuration to allow multiple origins
const allowedOrigins = env.CLIENT_ORIGIN.split(",").map(origin => origin.trim().replace(/\/$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { success: false, message: "Too many requests, slow down!" },
  })
);

// ─── General Middleware ────────────────────────────────────────────────────────
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", router);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    service: "KAIROS CRM API",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => res.send("✅ KAIROS CRM API is running"));

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀  KAIROS CRM running on http://localhost:${PORT} [${env.NODE_ENV}]\n`);
});

