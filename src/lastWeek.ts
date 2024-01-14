import { Article } from "./types";
import * as schema from "./schema";
import { asc, gt } from "drizzle-orm";
import { initDb } from "./db";

async function getLastWeekArticles(): Promise<Article[]> {
  const db = await initDb();
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastWeekArticles = await db
    .select()
    .from(schema.articles)
    .where(gt(schema.articles.date, lastWeek.toISOString()))
    .orderBy(asc(schema.articles.date))
    .execute();

  return lastWeekArticles;
}

function printLastWeek(articles: Article[]) {
  // group by day of the week
  const grouped = articles.reduce((acc, article) => {
    const date = new Date(article.date).getTime();
    const day = new Date(date).setHours(0, 0, 0, 0);
    const key = new Date(day).toISOString();

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(article);
    return acc;
  }, {} as Record<string, Article[]>);

  // print
  Object.entries(grouped)
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .forEach(([day, articles]) => {
      const date = new Date(day).toLocaleDateString();
      console.log(date);
      articles.forEach((article) => {
        console.log(article.title);
      });
      console.log();
    });
}

async function run() {
  const articles = await getLastWeekArticles();
  printLastWeek(articles);
}
run();
