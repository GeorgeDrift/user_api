/**
 * middleware/auth.js
 * ─────────────────────────────────────────────────────────────────
 * HTTP Basic Authentication middleware.
 *
 * Security features:
 *  - Credentials sourced from env variables only (never hard-coded)
 *  - Timing-safe string comparison to prevent timing attacks
 *  - Attaches `req.user` for downstream use
 *  - Logs every auth attempt (pass / fail) without leaking passwords
 * ─────────────────────────────────────────────────────────────────
 */

const basicAuth = require("basic-auth");
const crypto    = require("crypto");
const logger    = require("../utils/logger");

/**
 * Timing-safe string comparison.
 * Returns true only when both strings are identical,
 * without leaking information via execution time.
 */
function safeCompare(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));

  if (bufA.length !== bufB.length) {
    // Still run the comparison so timing stays consistent
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * authenticate(req, res, next)
 *
 * Reads the Authorization header, decodes Base64 credentials,
 * and compares against API_USER / API_PASS environment variables.
 *
 * On success  → attaches `req.user = { name }` and calls next()
 * On failure  → 401 with WWW-Authenticate challenge
 */
function authenticate(req, res, next) {
  const credentials = basicAuth(req);
  const ip          = req.ip || req.socket?.remoteAddress || "unknown";

  const validUser = process.env.API_USER || "";
  const validPass = process.env.API_PASS || "";

  if (!validUser || !validPass) {
    logger.warn("AUTH – API_USER or API_PASS environment variable is not set!");
  }

  const userOk = credentials && safeCompare(credentials.name, validUser);
  const passOk = credentials && safeCompare(credentials.pass, validPass);

  if (!credentials || !userOk || !passOk) {
    logger.warn(`AUTH FAILED – ip=${ip} user=${credentials?.name ?? "<none>"} path=${req.path}`);

    res.set("WWW-Authenticate", 'Basic realm="UserAPI", charset="UTF-8"');

    return res.status(401).json({
      status:  "error",
      code:    "UNAUTHORIZED",
      message: "Valid credentials are required. Use HTTP Basic Authentication.",
    });
  }

  logger.info(`AUTH OK – ip=${ip} user=${credentials.name} path=${req.path}`);

  req.user = { name: credentials.name };
  next();
}

module.exports = authenticate;
