/**
 * AI USAGE DISCLOSURE
 * Task   : Tasks 3, 4, 5, 6 – All endpoints + auth
 * Used for: Generating the route definitions and the router.use(auth)
 *           pattern that applies authentication to all routes at once.
 *
 * No-AI   : The decision to put auth at the router level (router.use)
 *           rather than per-route was chosen for DRY and to prevent
 *           accidentally forgetting auth on a new route.
 */

/**z
 * routes/users.js
 * ─────────────────────────────────────────────────────────────────
 * All /api routes.
 *
 * Middleware stack per route:
 *   auth          – enforces HTTP Basic Auth on every route
 *   validate.*    – sanitises / coerces request parameters
 *   controller.*  – thin HTTP handler that delegates to the service
 * ─────────────────────────────────────────────────────────────────
 */

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const controller = require("../controllers/users");

// ── Apply auth to ALL routes in this router ───────────────────────────────────
router.use(auth);

// ── POST /api/import ──────────────────────────────────────────────────────────
//   Fetch users from external API and upsert into DB.
//   No request body or query params needed.
router.post(
  "/import",
  controller.importUsers
);

// ── GET /api/users ────────────────────────────────────────────────────────────
//   List all users. Supports optional filters: ?name= ?city= ?company=
//   validate.userFilters sanitises and normalises the query-string.
router.get(
  "/users",
  validate.userFilters,
  controller.getUsers
);

// ── GET /api/users/:id ────────────────────────────────────────────────────────
//   Return a single user.
//   validate.intParam("id") ensures :id is a valid positive integer.
router.get(
  "/users/:id",
  validate.intParam("id"),
  controller.getUserById
);

// ── DELETE /api/users/:id ─────────────────────────────────────────────────────
//   Permanently delete a user.
//   validate.intParam("id") ensures :id is a valid positive integer.
router.delete(
  "/users/:id",
  validate.intParam("id"),
  controller.deleteUser
);

module.exports = router;
