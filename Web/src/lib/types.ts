export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface FaultCodeInfo {
  code: string;
  meaning: string;
  system: string;
  possibleCauses?: string[];
  symptoms?: string[];
  severity?: "low" | "medium" | "high";
}

export interface ValidateFaultCodeResponse {
  code: string;
  validFormat: boolean;
  known: boolean;
  info: FaultCodeInfo | null;
}

export interface FaultCodeSummary {
  code: string;
  known: boolean;
}

export interface StartConversationResponse {
  conversationId: string;
  codes: FaultCodeSummary[];
  messages: ChatMessage[];
}

export interface SendMessageResponse {
  conversationId: string;
  codes: FaultCodeSummary[];
  reply: string;
}

export interface RestoreConversationResponse {
  conversationId: string;
  codes: FaultCodeSummary[];
}

export interface ApiErrorBody {
  error: string;
  details?: string[];
}
