/**
 * AI USAGE DISCLOSURE
 * Task   : Tasks 4 & 5 – User endpoints and filter/search
 * Used for: Generating the middleware factory pattern (intParam returns
 *           a middleware function) and the userFilters sanitisation logic.
 * Adapted : Added the String(parsed) !== raw check in intParam so that
 *           values like "1.5" or "1e2" are rejected even though parseInt
 *           would accept them. This was not in the original AI output.
 *           MAX_LEN cap on filter values (100 chars) was also added manually.

 */

/**
 * middleware/validate.js
 * ─────────────────────────────────────────────────────────────────
 * Request validation middleware factory.
 *
 * Usage:
 *   router.get("/users/:id", validate.intParam("id"), controller.getUserById);
 *   router.get("/users",     validate.userFilters,    controller.getUsers);
 * ─────────────────────────────────────────────────────────────────
 */

/**
 * validate.intParam(paramName)
 *
 * Returns middleware that ensures req.params[paramName] is a
 * positive integer. Responds 400 if not.
 *
 * @param {string} paramName - name of the route param, e.g. "id"
 * @returns {Function} Express middleware
 */
function intParam(paramName) {
  return function (req, res, next) {
    const raw = req.params[paramName];
    const parsed = parseInt(raw, 10);

    if (isNaN(parsed) || parsed <= 0 || String(parsed) !== raw) {
      return res.status(400).json({
        status: "error",
        code: "INVALID_PARAM",
        message: `Parameter '${paramName}' must be a positive integer. Got: '${raw}'.`,
      });
    }

    // Store the parsed integer so controllers don't need to re-parse
    req.params[paramName] = parsed;
    next();
  };
}

/**
 * validate.userFilters
 *
 * Sanitises the optional query-string filters for GET /users.
 * - Strips leading/trailing whitespace
 * - Rejects filter values that are suspiciously long (> 100 chars)
 * - Removes filter keys that are empty strings after trimming
 */
function userFilters(req, res, next) {
  const ALLOWED = ["name", "city", "company"];
  const MAX_LEN = 100;

  for (const key of ALLOWED) {
    if (req.query[key] !== undefined) {
      const value = String(req.query[key]).trim();

      if (value.length > MAX_LEN) {
        return res.status(400).json({
          status: "error",
          code: "INVALID_QUERY",
          message: `Filter '${key}' exceeds maximum length of ${MAX_LEN} characters.`,
        });
      }

      // Normalise: delete the key if it is empty after trimming
      if (value === "") {
        delete req.query[key];
      } else {
        req.query[key] = value;
      }
    }
  }

  next();
}

module.exports = { intParam, userFilters };
