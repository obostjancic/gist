import { desc } from "drizzle-orm";
import Parser from "rss-parser";
import { initDb } from "./db";
import * as schema from "./schema";
import { Article } from "./types";
import { initSentry } from "./sentry";
import * as Sentry from "@sentry/node";

type KlixFeed = {
  title: string;
  link: string;
  description: string;
  language: string;
  pubDate: string;
  items: Article[];
};

type RawArticle = {
  guid: string;
  title: string;
  link: string;
  pubDate: string;
  content: string;
  categories: { _: string; $: string }[];
};

async function fetchFeed(): Promise<RawArticle[]> {
  try {
    console.log("Fetching feed");
    const parser = new Parser<KlixFeed, RawArticle>();
    const feed = await parser.parseURL("https://www.klix.ba/rss");
    console.log("Fetched");
    return feed.items;
  } catch (error) {
    console.error("Error fetching feed");
    console.log(error);
    console.log(JSON.stringify(error, null, 2));
    return [];
  }
}

function processArticles(articles: RawArticle[]): Article[] {
  return articles
    .filter((article) => article.categories?.[0]._ === "BiH")
    .map((article) => ({
      id: article.guid,
      title: article.title,
      link: article.link,
      date: new Date(article.pubDate).toISOString(),
      content: article.content,
    }));
}

async function saveArticles(articles: Article[]) {
  try {
    const db = await initDb();
    const existingArticles = await db
      .select()
      .from(schema.articles)
      .orderBy(desc(schema.articles.date))
      .limit(10)
      .execute();

    const newArticles = articles.filter(
      (article) =>
        !existingArticles.some(
          (existingArticle) => existingArticle.id === article.id
        )
    );
    if (newArticles.length === 0) {
      console.log("No new articles");
      return;
    }
    await db.insert(schema.articles).values(newArticles).execute();
  } catch (error) {
    console.error(error);
  }
}

async function run() {
  console.log("Checking for new articles");
  const checkInId = Sentry.captureCheckIn({
    monitorSlug: "fetch-feed",
    status: "in_progress",
  });
  try {
    const articles = await fetchFeed();
    const processedArticles = processArticles(articles);
    saveArticles(processedArticles);
    Sentry.captureCheckIn({
      checkInId,
      monitorSlug: "fetch-feed",
      status: "ok",
    });
  } catch (error) {
    Sentry.captureCheckIn({
      checkInId,
      monitorSlug: "fetch-feed",
      status: "error",
    });
    console.error(error);
  }
  setTimeout(run, 1 * 60 * 1000);
}
initSentry();
run();
