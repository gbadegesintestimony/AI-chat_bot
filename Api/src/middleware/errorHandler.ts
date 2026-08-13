import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { isProduction } from "../config/env";
import { LlamaServiceError } from "../services/llama/llamaService";

export class ApiError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: "Not found" });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Invalid request", details: err.issues.map((issue) => issue.message) });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof LlamaServiceError) {
    // Upstream AI provider failure — not the client's fault, but don't leak provider internals.
    console.error("Llama provider error:", err.message, err.cause ?? "");
    res.status(502).json({ error: "The AI assistant is temporarily unavailable. Please try again shortly." });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    ...(isProduction ? {} : { detail: err instanceof Error ? err.message : String(err) }),
  });
}

export function asyncHandler<T extends (req: Request, res: Response, next: NextFunction) => Promise<void>>(fn: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
