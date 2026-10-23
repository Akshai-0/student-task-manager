// Validation rules for task data. Pure functions: no database, no Express.
// Keeping them separate makes them easy to test and easy to explain.

const STATUSES = ["PENDING", "COMPLETED"];
const MAX_TITLE = 120;
const MAX_SUBJECT = 60;
const MAX_DESCRIPTION = 1000;

// Accepts only a real calendar date written as YYYY-MM-DD (e.g. 2026-11-05).
function parseDueDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  // Rejects impossible dates such as 2026-02-31 (JS would silently roll them over).
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return null;
  }
  return date;
}

// Validates the body of POST/PUT. Returns { errors, data }.
// `errors` is an object like { title: "Title is required" } (empty = valid).
function validateTaskInput(body) {
  const input = body && typeof body === "object" ? body : {};
  const errors = {};

  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (!title) errors.title = "Title is required";
  else if (title.length > MAX_TITLE)
    errors.title = `Title must be at most ${MAX_TITLE} characters`;

  const subject = typeof input.subject === "string" ? input.subject.trim() : "";
  if (!subject) errors.subject = "Subject is required";
  else if (subject.length > MAX_SUBJECT)
    errors.subject = `Subject must be at most ${MAX_SUBJECT} characters`;

  let description = "";
  if (input.description !== undefined && input.description !== null) {
    if (typeof input.description !== "string") {
      errors.description = "Description must be text";
    } else {
      description = input.description.trim();
      if (description.length > MAX_DESCRIPTION)
        errors.description = `Description must be at most ${MAX_DESCRIPTION} characters`;
    }
  }

  const dueDate = parseDueDate(input.dueDate);
  if (!dueDate) errors.dueDate = "Due date is required and must be a real date (YYYY-MM-DD)";

  return { errors, data: { title, description, subject, dueDate } };
}

// Validates the body of PATCH /status.
function validateStatus(body) {
  const status = body && typeof body === "object" ? body.status : undefined;
  if (!STATUSES.includes(status)) {
    return { errors: { status: `Status must be one of: ${STATUSES.join(", ")}` }, status: null };
  }
  return { errors: {}, status };
}

// Validates the :id URL parameter. Returns an integer or null.
function parseId(value) {
  if (!/^\d+$/.test(String(value))) return null;
  const id = Number(value);
  // PostgreSQL SERIAL is a 32-bit integer.
  return id >= 1 && id <= 2147483647 ? id : null;
}

module.exports = { STATUSES, parseDueDate, validateTaskInput, validateStatus, parseId };
