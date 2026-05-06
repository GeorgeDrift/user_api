/**
 * utils/logger.js
 * Minimal structured logger with levels: error | warn | info | debug
 * Set LOG_LEVEL env var to control verbosity (default: info).
 */

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;

function log(level, message) {
  if (LEVELS[level] > currentLevel) return;
  const ts   = new Date().toISOString();
  const line = `[${ts}] [${level.toUpperCase().padEnd(5)}] ${message}`;
  const out  = level === "error" || level === "warn" ? process.stderr : process.stdout;
  out.write(line + "\n");
}

module.exports = {
  error: (msg) => log("error", msg),
  warn:  (msg) => log("warn",  msg),
  info:  (msg) => log("info",  msg),
  debug: (msg) => log("debug", msg),
};
