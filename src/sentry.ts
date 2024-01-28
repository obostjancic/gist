import * as Sentry from "@sentry/node";
import dotenv from "dotenv";

dotenv.config();

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
  });
}
