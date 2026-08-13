import cors from "cors";
import helmet from "helmet";
import type { Express } from "express";
import { env } from "../config/env";

export function applySecurityMiddleware(app: Express): void {
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      methods: ["GET", "POST"],
    }),
  );
}
