import { env, isWebSearchEnabled } from "../../config/env";

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_CONTENT_LENGTH = 600;

// Curated allowlist of reputable automotive reference/repair sites. Restricting search
// to these does double duty: it cuts down the surface for indirect prompt injection
// (random SEO/spam pages never enter the model's context at all) and improves answer
// quality (these are the sites that actually publish reliable DTC information).
const TRUSTED_DOMAINS = [
  "obd-codes.com",
  "troublecodes.net",
  "repairpal.com",
  "autozone.com",
  "oreillyauto.com",
  "yourmechanic.com",
  "cartreatments.com",
  "fixd.com",
  "carparts.com",
  "engine-codes.com",
];

// Crude heuristic defense-in-depth: if a result's content contains a phrase commonly
// used in prompt-injection attempts, drop that result rather than feed it to the model.
// Not foolproof on its own — paired with the trusted-domain restriction and the explicit
// "treat this as untrusted data" framing applied where results are consumed.
const INJECTION_MARKERS = [
  "ignore previous instructions",
  "ignore all previous instructions",
  "disregard your instructions",
  "disregard previous instructions",
  "new instructions:",
  "system prompt",
  "you are now",
  "act as if",
];

export interface WebSearchResult {
  title: string;
  url: string;
  content: string;
}

export class WebSearchError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "WebSearchError";
  }
}

function looksLikeInjectionAttempt(content: string): boolean {
  const lower = content.toLowerCase();
  return INJECTION_MARKERS.some((marker) => lower.includes(marker));
}

export async function searchWeb(query: string): Promise<WebSearchResult[]> {
  if (!isWebSearchEnabled) {
    throw new WebSearchError("Web search is not configured (SEARCH_API_KEY unset)");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${env.SEARCH_API_BASE_URL}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.SEARCH_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        max_results: env.SEARCH_MAX_RESULTS,
        search_depth: "basic",
        include_domains: TRUSTED_DOMAINS,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new WebSearchError(`Search provider responded with status ${response.status}`);
    }

    const data = (await response.json()) as {
      results?: { title: string; url: string; content: string }[];
    };

    return (data.results ?? [])
      .filter((result) => !looksLikeInjectionAttempt(result.content))
      .map((result) => ({
        title: result.title,
        url: result.url,
        content: result.content.length > MAX_CONTENT_LENGTH ? `${result.content.slice(0, MAX_CONTENT_LENGTH)}...` : result.content,
      }));
  } catch (error) {
    if (error instanceof WebSearchError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new WebSearchError("Search provider request timed out", error);
    }
    throw new WebSearchError("Failed to reach the search provider", error);
  } finally {
    clearTimeout(timeout);
  }
}
