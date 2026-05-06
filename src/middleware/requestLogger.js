/**
 * AI USAGE DISCLOSURE
 * Task   : Supporting infrastructure (not a graded task)
 * Used for: Generating the res.on("finish") hook pattern so response
 *           time and status code are logged after the response is sent.
 * Adapted : Added level-based routing (error/warn/info) based on HTTP
 *           status range, which was not in the original AI output.

 */

/**
 * middleware/requestLogger.js
 * ─────────────────────────────────────────────────────────────────
 * HTTP request/response logger.
 *
 * Logs: method, path, status code, response time, and caller IP.
 * Runs on every request regardless of auth status.
 * ─────────────────────────────────────────────────────────────────
 */

const logger = require("../utils/logger");

/**
 * requestLogger(req, res, next)
 *
 * Hooks into `res.on("finish")` so we can log the final status code
 * and elapsed time after the response has been sent.
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  const method = req.method;
  const url = req.originalUrl;

  res.on("finish", () => {
    const ms = Date.now() - start;
    const status = res.statusCode;

    // Color-code by status range for easy reading in terminals
    const level = status >= 500 ? "error"
      : status >= 400 ? "warn"
        : "info";

    logger[level](`${method} ${url} → ${status} (${ms}ms) ip=${ip}`);
  });

  next();
}

module.exports = requestLogger;
