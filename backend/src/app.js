// Builds the Express application (middleware + routes) WITHOUT starting it.
// server.js starts it; the tests import it.
const express = require("express");
const cors = require("cors");
const prisma = require("./prisma");
const taskRoutes = require("./routes/taskRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// CORS: lets the React dev server (another origin/port) call this API.
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));

// Parses JSON request bodies into req.body.
app.use(express.json({ limit: "100kb" }));

// Simple request logger (shows the request flow in the backend terminal).
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start} ms)`);
  });
  next();
});

// Health check: also proves the database connection works.
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    console.error("Health check failed:", err.message);
    res.status(503).json({ status: "error", database: "unreachable" });
  }
});

app.use("/api/tasks", taskRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
