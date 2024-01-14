import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./db-out",
  driver: "better-sqlite",
  dbCredentials: {
    url: "./gist.db",
  },
} satisfies Config;
