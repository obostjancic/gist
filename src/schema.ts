import Database from "better-sqlite3";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

const database = new Database("./gist.db");

export const articles = sqliteTable("articles", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  link: text("link").notNull(),
  date: text("date").notNull(),
  content: text("content").notNull(),
});
