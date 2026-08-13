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

export interface StartConversationResponse {
  conversationId: string;
  faultCode: string;
  known: boolean;
  messages: ChatMessage[];
}

export interface SendMessageResponse {
  conversationId: string;
  faultCode: string;
  reply: string;
}

export interface ApiErrorBody {
  error: string;
  details?: string[];
}
