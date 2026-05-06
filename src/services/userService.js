/**
 * services/userService.js
 * ─────────────────────────────────────────────────────────────────
 * Refactored for Normalized 3-Table Design (Users, Addresses, Companies)
 * ─────────────────────────────────────────────────────────────────
 */

const axios  = require("axios");
const pool   = require("../db/pool");
const logger = require("../utils/logger");

const EXTERNAL_URL = "https://jsonplaceholder.typicode.com/users";

// ── SQL Queries ──────────────────────────────────────────────────────────────

const UPSERT_USER = `
  INSERT INTO users (id, name, username, email, phone, website)
  VALUES (?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    name = VALUES(name), username = VALUES(username), email = VALUES(email),
    phone = VALUES(phone), website = VALUES(website)
`;

const UPSERT_ADDRESS = `
  INSERT INTO addresses (user_id, street, suite, city, zipcode, geo_lat, geo_lng)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    street = VALUES(street), suite = VALUES(suite), city = VALUES(city),
    zipcode = VALUES(zipcode), geo_lat = VALUES(geo_lat), geo_lng = VALUES(geo_lng)
`;

const UPSERT_COMPANY = `
  INSERT INTO companies (user_id, name, catch_phrase, bs)
  VALUES (?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    name = VALUES(name), catch_phrase = VALUES(catch_phrase), bs = VALUES(bs)
`;

const SELECT_JOIN_SQL = `
  SELECT 
    u.*,
    a.street, a.suite, a.city, a.zipcode, a.geo_lat, a.geo_lng,
    c.name AS company_name, c.catch_phrase, c.bs
  FROM users u
  LEFT JOIN addresses a ON u.id = a.user_id
  LEFT JOIN companies a_c ON u.id = a_c.user_id
`;

// Note: Re-named alias to avoid conflict with company.name
const SELECT_BASE = `
  SELECT 
    u.id, u.name, u.username, u.email, u.phone, u.website, u.imported_at,
    a.street, a.suite, a.city, a.zipcode, a.geo_lat, a.geo_lng,
    c.name AS company_name, c.catch_phrase, c.bs
  FROM users u
  LEFT JOIN addresses a ON u.id = a.user_id
  LEFT JOIN companies c ON u.id = c.user_id
`;

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapRowToUser(row) {
  return {
    id:       row.id,
    name:     row.name,
    username: row.username,
    email:    row.email,
    phone:    row.phone,
    website:  row.website,
    address: {
      street:  row.street,
      suite:   row.suite,
      city:    row.city,
      zipcode: row.zipcode,
      geo: { lat: row.geo_lat, lng: row.geo_lng },
    },
    company: {
      name:        row.company_name,
      catchPhrase: row.catch_phrase,
      bs:          row.bs,
    },
    importedAt: row.imported_at,
  };
}

// ── Service methods ───────────────────────────────────────────────────────────

async function fetchFromExternal() {
  try {
    const response = await axios.get(EXTERNAL_URL, { timeout: 8000 });
    return response.data;
  } catch (err) {
    const e = new Error("External API unreachable.");
    e.status = 502;
    throw e;
  }
}

async function importUsers() {
  const externalUsers = await fetchFromExternal();
  let inserted = 0; let updated = 0; let failed = 0;
  const errors = [];

  for (const user of externalUsers) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Users table
      const [resU] = await connection.execute(UPSERT_USER, [
        user.id, user.name, user.username, user.email, user.phone, user.website
      ]);
      
      // 2. Addresses table
      await connection.execute(UPSERT_ADDRESS, [
        user.id, user.address?.street, user.address?.suite, user.address?.city, 
        user.address?.zipcode, user.address?.geo?.lat, user.address?.geo?.lng
      ]);

      // 3. Companies table
      await connection.execute(UPSERT_COMPANY, [
        user.id, user.company?.name, user.company?.catchPhrase, user.company?.bs
      ]);

      await connection.commit();
      
      // Check if it was an update or insert (approximate for multi-table)
      resU.affectedRows === 2 ? updated++ : inserted++;
    } catch (err) {
      await connection.rollback();
      failed++;
      errors.push({ id: user.id, error: err.message });
    } finally {
      connection.release();
    }
  }

  return { total: externalUsers.length, inserted, updated, failed, errors };
}

async function findAll(filters = {}) {
  const { name, city, company } = filters;
  const conditions = [];
  const params     = [];

  if (name)    { conditions.push("u.name LIKE ?");         params.push(`%${name}%`); }
  if (city)    { conditions.push("a.city LIKE ?");         params.push(`%${city}%`); }
  if (company) { conditions.push("c.name LIKE ?");         params.push(`%${company}%`); }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql   = `${SELECT_BASE} ${where} ORDER BY u.id ASC`;

  const [rows] = await pool.execute(sql, params);
  return rows.map(mapRowToUser);
}

async function findById(id) {
  const sql = `${SELECT_BASE} WHERE u.id = ?`;
  const [rows] = await pool.execute(sql, [id]);
  if (rows.length === 0) return null;
  return mapRowToUser(rows[0]);
}

async function deleteById(id) {
  // Cascading deletes in SQL handle addresses and companies automatically
  const [result] = await pool.execute("DELETE FROM users WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = { importUsers, findAll, findById, deleteById };
