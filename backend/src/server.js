// Entry point: loads environment variables and starts the HTTP server.
require("dotenv/config");
const app = require("./app");
const prisma = require("./prisma");

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`Student Task Manager API running at http://localhost:${PORT}`);
  console.log(`Health check:           http://localhost:${PORT}/api/health`);
});

// Port already in use etc.
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Change PORT in backend/.env or stop the other program.`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});

// Close the HTTP server and the database connection when you press Ctrl+C.
async function shutdown() {
  console.log("\nShutting down...");
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
