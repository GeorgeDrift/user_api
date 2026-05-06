/**
 * AI USAGE DISCLOSURE
 * Task   : Supporting infrastructure (applies to all graded tasks)
 * Used for: Generating the notFound + errorHandler middleware pair and
 *           the pattern of attaching .status and .code to thrown Error
 *           objects so the handler can format them consistently.
 * Adapted : Added NODE_ENV check to hide stack traces in production —
 *           the original AI output always included them.

 */

/**
 * middleware/errorHandler.js
 * ─────────────────────────────────────────────────────────────────
 * Centralised error-handling middleware.
 *
 * Must be registered LAST in the Express app (after all routes).
 * Catches any error passed via next(err) from any route/middleware.
 *
 * In production the internal `detail` field is hidden to avoid
 * leaking stack traces. In development it is shown for debugging.
 * ─────────────────────────────────────────────────────────────────
 */

const logger = require("../utils/logger");

const IS_DEV = (process.env.NODE_ENV || "development") === "development";

/**
 * notFound(req, res, next)
 *
 * Catch-all for routes that do not match any registered handler.
 * Creates a 404 error and forwards it to the main errorHandler.
 */
function notFound(req, res, next) {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.status = 404;
  err.code = "NOT_FOUND";
  next(err);
}

/**
 * errorHandler(err, req, res, next)
 *
 * Final error handler. Normalises all errors into a consistent JSON shape:
 *
 *   { status, code, message [, detail] }
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "An unexpected error occurred.";

  // Always log server-side errors with full stack
  if (status >= 500) {
    logger.error(`${code}: ${message}\n${err.stack}`);
  }

  const body = {
    status: "error",
    code,
    message,
  };

  // Expose stack trace only in development
  if (IS_DEV && status >= 500) {
    body.detail = err.stack;
  }

  res.status(status).json(body);
}

module.exports = { notFound, errorHandler };
