// Run with: npm test   (no database needed; uses Node's built-in test runner)
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://u:p@localhost:5432/x";
const test = require("node:test");
const assert = require("node:assert");
const { validateTaskInput, validateStatus, parseId, parseDueDate } = require("../src/utils/validation");

test("valid task passes and is trimmed", () => {
  const { errors, data } = validateTaskInput({ title: "  Essay ", subject: "English", dueDate: "2026-11-05" });
  assert.deepStrictEqual(errors, {});
  assert.strictEqual(data.title, "Essay");
  assert.strictEqual(data.description, "");
});

test("missing and empty fields are rejected", () => {
  const { errors } = validateTaskInput({ title: "   ", dueDate: "" });
  assert.ok(errors.title && errors.subject && errors.dueDate);
});

test("too-long title is rejected", () => {
  const { errors } = validateTaskInput({ title: "x".repeat(121), subject: "S", dueDate: "2026-11-05" });
  assert.ok(errors.title);
});

test("impossible dates are rejected", () => {
  assert.strictEqual(parseDueDate("2026-02-31"), null);
  assert.strictEqual(parseDueDate("05-11-2026"), null);
  assert.ok(parseDueDate("2028-02-29"));
});

test("status must be PENDING or COMPLETED", () => {
  assert.strictEqual(validateStatus({ status: "DONE" }).status, null);
  assert.strictEqual(validateStatus({ status: "COMPLETED" }).status, "COMPLETED");
  assert.strictEqual(validateStatus(undefined).status, null);
});

test("id must be a positive 32-bit integer", () => {
  assert.strictEqual(parseId("5"), 5);
  for (const bad of ["0", "-1", "abc", "1.5", "99999999999", "1; DROP TABLE tasks"])
    assert.strictEqual(parseId(bad), null);
});

test("API rejects invalid input with 400 before touching the database", async () => {
  const app = require("../src/app");
  const server = app.listen(0);
  const base = `http://localhost:${server.address().port}`;
  try {
    let r = await fetch(`${base}/api/tasks`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}),
    });
    assert.strictEqual(r.status, 400);
    assert.ok((await r.json()).details.title);

    r = await fetch(`${base}/api/tasks`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "{bad json",
    });
    assert.strictEqual(r.status, 400);

    r = await fetch(`${base}/api/tasks/abc`);
    assert.strictEqual(r.status, 400);

    r = await fetch(`${base}/api/nothing`);
    assert.strictEqual(r.status, 404);
  } finally {
    server.close();
    await require("../src/prisma").$disconnect();
  }
});
