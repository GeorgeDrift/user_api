/**
 * server.js
 * ─────────────────────────────────────────────────────────────────
 * Application entry point.
 *
 * Middleware registration order (matters in Express):
 *   1. requestLogger   – log every incoming request
 *   2. express.json()  – parse JSON bodies
 *   3. /api routes     – business endpoints (auth inside router)
 *   4. /health         – unauthenticated health-check
 *   5. notFound        – catch unmatched routes → 404
 *   6. errorHandler    – centralised error formatting
 * ─────────────────────────────────────────────────────────────────
 */

require("dotenv").config();

const express       = require("express");
const pool          = require("./db/pool");
const logger        = require("./utils/logger");
const requestLogger = require("./middleware/requestLogger");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const userRoutes    = require("./routes/users");

const app  = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// ── Global middleware ─────────────────────────────────────────────────────────
app.set("trust proxy", 1);           // trust first proxy (needed for correct req.ip)
app.use(requestLogger);              // log every request
app.use(express.json());             // parse application/json bodies

// ── Unauthenticated health check ──────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "error", db: "disconnected", timestamp: new Date().toISOString() });
  }
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api", userRoutes);

// ── 404 and global error handler (must be last) ───────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  try {
    await pool.query("SELECT 1");
    logger.info("Database connection verified.");

    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info("Endpoints:");
      logger.info("  GET    /health              (no auth)");
      logger.info("  POST   /api/import");
      logger.info("  GET    /api/users");
      logger.info("  GET    /api/users/:id");
      logger.info("  DELETE /api/users/:id");
    });
  } catch (err) {
    logger.error(`Failed to connect to database: ${err.message}`);
    process.exit(1);
  }
}

start();
