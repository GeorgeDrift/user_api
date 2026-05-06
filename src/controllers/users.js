/**
 * AI USAGE DISCLOSURE
 * Task   : Tasks 3, 4, 5 – Import, user CRUD, filters
 * Used for: Generating the controller structure and the pattern of
 *           delegating all logic to userService then formatting the
 *           HTTP response.
 
 * No-AI   : Decision to keep controllers completely free of SQL and
 *           business logic was a deliberate architectural choice, not
 *           suggested by the AI.
 */

/**
 * controllers/users.js
 * ─────────────────────────────────────────────────────────────────
 * HTTP layer only – no SQL, no business logic here.
 *
 * Each handler:
 *   1. Extracts validated data from req
 *   2. Calls the appropriate service method
 *   3. Formats and sends the HTTP response
 *   4. Forwards unexpected errors to the global error handler via next(err)
 * ─────────────────────────────────────────────────────────────────
 */

const userService = require("../services/userService");

// ── POST /api/import ─────────────────────────────────────────────────────────

/**
 * Triggers a full import of users from the external API into the DB.
 * Safe to call multiple times (upsert semantics).
 */
async function importUsers(req, res, next) {
  try {
    const summary = await userService.importUsers();

    return res.status(200).json({
      status: "ok",
      message: "Import complete.",
      summary: {
        total: summary.total,
        inserted: summary.inserted,
        updated: summary.updated,
        failed: summary.failed,
      },
      // Only include the errors array when there were actual failures
      ...(summary.errors.length > 0 ? { errors: summary.errors } : {}),
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/users ────────────────────────────────────────────────────────────

/**
 * Returns all users, with optional combinable filters:
 *   ?name=   partial match on user name
 *   ?city=   partial match on address city
 *   ?company= partial match on company name
 *
 * Filters have already been sanitised by the validate.userFilters middleware.
 */
async function getUsers(req, res, next) {
  try {
    const { name, city, company } = req.query;
    const users = await userService.findAll({ name, city, company });

    return res.status(200).json({
      status: "ok",
      count: users.length,
      users,
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/users/:id ────────────────────────────────────────────────────────

/**
 * Returns a single user by their numeric ID.
 * ID is already validated and parsed to an integer by validate.intParam.
 */
async function getUserById(req, res, next) {
  try {
    const id = req.params.id;   // already an integer from validate.intParam
    const user = await userService.findById(id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        code: "NOT_FOUND",
        message: `User with id ${id} does not exist.`,
      });
    }

    return res.status(200).json({ status: "ok", user });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/users/:id ─────────────────────────────────────────────────────

/**
 * Permanently deletes a user by their numeric ID.
 * ID is already validated and parsed to an integer by validate.intParam.
 */
async function deleteUser(req, res, next) {
  try {
    const id = req.params.id;
    const deleted = await userService.deleteById(id);

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        code: "NOT_FOUND",
        message: `User with id ${id} does not exist.`,
      });
    }

    return res.status(200).json({
      status: "ok",
      message: `User ${id} deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { importUsers, getUsers, getUserById, deleteUser };
