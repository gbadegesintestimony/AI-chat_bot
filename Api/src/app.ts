import express, { type Express } from "express";
import { applySecurityMiddleware } from "./middleware/security";
import { generalLimiter } from "./middleware/rateLimiter";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import apiRouter from "./routes";

export function createApp(): Express {
  const app = express();

  // Render (and Vercel-fronted setups generally) sit one hop in front of the app and set
  // X-Forwarded-For. Trusting exactly one hop makes req.ip resolve to the real client IP
  // instead of the proxy's, which the rate limiter depends on for per-client limits —
  // without this, everyone behind the proxy would share a single rate-limit bucket.
  app.set("trust proxy", 1);

  applySecurityMiddleware(app);
  app.use(express.json({ limit: "10kb" }));
  app.use("/api", generalLimiter, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
