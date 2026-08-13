import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGINS: z
    .string()
    .min(1, "CORS_ORIGINS must list at least one allowed origin")
    .transform((value) => value.split(",").map((origin) => origin.trim()).filter(Boolean)),
  LLAMA_API_BASE_URL: z.string().url(),
  LLAMA_API_KEY: z.string().min(1, "LLAMA_API_KEY is required"),
  LLAMA_MODEL: z.string().min(1),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(20),
  // Optional: live web search for fault codes we don't have curated causes/symptoms
  // for. Left unset, the assistant just falls back to its own hedged general
  // knowledge (previous behavior) instead of failing to boot.
  SEARCH_API_BASE_URL: z.string().url().default("https://api.tavily.com"),
  SEARCH_API_KEY: z.string().min(1).optional(),
  SEARCH_MAX_RESULTS: z.coerce.number().int().positive().max(10).default(3),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
export const isWebSearchEnabled = Boolean(env.SEARCH_API_KEY);
