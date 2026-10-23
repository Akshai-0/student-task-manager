// Prisma 7 configuration: tells the Prisma CLI where the schema, migrations
// and database URL are. Values come from backend/.env
require("dotenv/config");
const { defineConfig } = require("prisma/config");

module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env.DATABASE_URL },
});
