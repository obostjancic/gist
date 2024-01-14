import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { articles } from "./schema";

const database = new Database("./gist.db");

export const initDb = async () => {
  const db = drizzle(database, { schema: { articles } });
  await migrate(db, { migrationsFolder: "./drizzle" });
  return db;
};
