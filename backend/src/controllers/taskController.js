// Controllers contain the logic of each endpoint:
//   read request -> validate -> call Prisma (database) -> send JSON response.
// Every function is `async` and uses `await` for database calls.
// Express 5 automatically forwards a thrown error / rejected promise to the
// central error handler, so no try/catch is needed in each function.
const prisma = require("../prisma");
const HttpError = require("../utils/httpError");
const {
  validateTaskInput,
  validateStatus,
  parseId,
} = require("../utils/validation");

// Convert a database row into the JSON we send. dueDate becomes "YYYY-MM-DD".
function toJson(task) {
  return { ...task, dueDate: task.dueDate.toISOString().slice(0, 10) };
}

function getValidId(req) {
  const id = parseId(req.params.id);
  if (id === null) throw new HttpError(400, "Task id must be a positive whole number");
  return id;
}

// GET /api/tasks?status=PENDING&sort=dueDate&order=asc
async function listTasks(req, res) {
  const { status, sort = "dueDate", order = "asc" } = req.query;

  if (status !== undefined && !["PENDING", "COMPLETED"].includes(status))
    throw new HttpError(400, "status must be PENDING or COMPLETED");
  if (!["dueDate", "createdAt", "title"].includes(sort))
    throw new HttpError(400, "sort must be dueDate, createdAt or title");
  if (!["asc", "desc"].includes(order))
    throw new HttpError(400, "order must be asc or desc");

  const tasks = await prisma.task.findMany({
    where: status ? { status } : {}, // filtering  -> SQL WHERE
    orderBy: [{ [sort]: order }, { id: "asc" }], // sorting -> SQL ORDER BY
  });
  res.json(tasks.map(toJson));
}

// GET /api/tasks/stats  -> { total, pending, completed }
async function getStats(req, res) {
  const [pending, completed] = await Promise.all([
    prisma.task.count({ where: { status: "PENDING" } }),
    prisma.task.count({ where: { status: "COMPLETED" } }),
  ]);
  res.json({ total: pending + completed, pending, completed });
}

// GET /api/tasks/:id
async function getTask(req, res) {
  const id = getValidId(req);
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new HttpError(404, `Task ${id} not found`);
  res.json(toJson(task));
}

// POST /api/tasks
async function createTask(req, res) {
  const { errors, data } = validateTaskInput(req.body);
  if (Object.keys(errors).length > 0)
    throw new HttpError(400, "Validation failed", errors);

  const task = await prisma.task.create({ data });
  res.status(201).json(toJson(task));
}

// PUT /api/tasks/:id  (edit title/description/subject/dueDate)
async function updateTask(req, res) {
  const id = getValidId(req);
  const { errors, data } = validateTaskInput(req.body);
  if (Object.keys(errors).length > 0)
    throw new HttpError(400, "Validation failed", errors);

  // If the id does not exist Prisma throws error code P2025 -> handled as 404.
  const task = await prisma.task.update({ where: { id }, data });
  res.json(toJson(task));
}

// PATCH /api/tasks/:id/status  body: { "status": "COMPLETED" }
async function updateTaskStatus(req, res) {
  const id = getValidId(req);
  const { errors, status } = validateStatus(req.body);
  if (Object.keys(errors).length > 0)
    throw new HttpError(400, "Validation failed", errors);

  const task = await prisma.task.update({ where: { id }, data: { status } });
  res.json(toJson(task));
}

// DELETE /api/tasks/:id
async function deleteTask(req, res) {
  const id = getValidId(req);
  const task = await prisma.task.delete({ where: { id } });
  res.json({ message: `Task ${id} deleted`, task: toJson(task) });
}

module.exports = {
  listTasks,
  getStats,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
