import type {
  ApiErrorBody,
  SendMessageResponse,
  StartConversationResponse,
  ValidateFaultCodeResponse,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new ApiError("Couldn't reach the server. Check your connection and try again.", 0);
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as ApiErrorBody;
      if (body.error) message = body.error;
    } catch {
      // Response wasn't JSON — keep the generic message.
    }
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

export function validateFaultCode(code: string): Promise<ValidateFaultCodeResponse> {
  return request("/fault-codes", { method: "POST", body: JSON.stringify({ code }) });
}

export function startConversation(input: string): Promise<StartConversationResponse> {
  return request("/conversations", { method: "POST", body: JSON.stringify({ input }) });
}

export function sendMessage(conversationId: string, message: string): Promise<SendMessageResponse> {
  return request(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}
