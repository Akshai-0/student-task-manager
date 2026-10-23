// Routes map "HTTP method + URL" to a controller function.
// This router is mounted at /api/tasks in app.js.
const express = require("express");
const c = require("../controllers/taskController");

const router = express.Router();

router.get("/", c.listTasks); //                  GET    /api/tasks
router.get("/stats", c.getStats); //              GET    /api/tasks/stats  (must be before "/:id")
router.get("/:id", c.getTask); //                 GET    /api/tasks/5
router.post("/", c.createTask); //                POST   /api/tasks
router.put("/:id", c.updateTask); //              PUT    /api/tasks/5
router.patch("/:id/status", c.updateTaskStatus); // PATCH /api/tasks/5/status
router.delete("/:id", c.deleteTask); //           DELETE /api/tasks/5

module.exports = router;
