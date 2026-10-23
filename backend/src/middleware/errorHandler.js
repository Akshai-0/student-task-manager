// Central error handling: every error in the app ends up here and is turned
// into a consistent JSON response: { "error": "...", "details": {...} }.
const HttpError = require("../utils/httpError");

// Used when no route matched the URL.
function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Express recognises an error handler by its 4 parameters.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // 1. Errors we threw on purpose (validation, bad id, ...)
  if (err instanceof HttpError) {
    const body = { error: err.message };
    if (err.details) body.details = err.details;
    return res.status(err.status).json(body);
  }

  // 2. Malformed JSON sent by the client
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body is not valid JSON" });
  }

  // 3. Prisma: record to update/delete does not exist
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Task not found" });
  }

  // 4. Database unreachable (wrong URL, PostgreSQL stopped, bad password ...)
  //    P1000 = auth failed, P1001/P1002 = cannot reach server, P1003 = DB missing
  const dbDown =
    ["P1000", "P1001", "P1002", "P1003", "P1017"].includes(err.code) ||
    err.name === "PrismaClientInitializationError" ||
    ["ECONNREFUSED", "ENOTFOUND", "28P01", "3D000"].includes(err.code) ||
    ["ECONNREFUSED", "ENOTFOUND", "28P01", "3D000"].includes(err.cause?.code) ||
    ["ECONNREFUSED", "ENOTFOUND"].includes(err.cause?.cause?.code);
  if (dbDown) {
    console.error("Database unavailable:", err.message);
    return res.status(503).json({ error: "Database is unavailable. Please try again later." });
  }

  // 5. Anything else: log the real error, hide details from the client
  console.error("Unexpected error:", err);
  res.status(500).json({ error: "Internal server error" });
}

module.exports = { notFound, errorHandler };
