// Database access layer: creates ONE Prisma Client for the whole application.
// Prisma 7 talks to PostgreSQL through a "driver adapter" (the `pg` library).
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy backend/.env.example to backend/.env and fill it in."
  );
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
// Set LOG_QUERIES=true in .env to print every SQL query Prisma sends to PostgreSQL
// (very useful in a demo to show how Prisma translates code into SQL).
const prisma = new PrismaClient({
  adapter,
  log: process.env.LOG_QUERIES === "true" ? ["query"] : [],
});

module.exports = prisma;
