import rateLimit from "express-rate-limit";
import { env } from "../config/env";

// General limiter for all API routes.
export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
});

// Tighter limiter for endpoints that call the paid Llama API, so a single
// client can't drive up AI provider costs or exhaust the rate limit for others.
export const aiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: Math.max(5, Math.floor(env.RATE_LIMIT_MAX_REQUESTS / 2)),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI requests. Please slow down and try again shortly." },
});
