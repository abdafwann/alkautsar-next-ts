import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // CLI operations require a direct connection
    url: env("DIRECT_URL"),
  },
});
