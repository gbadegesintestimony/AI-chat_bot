export interface FaultCodeInfo {
  code: string;
  meaning: string;
  system: string;
  // Curated causes/symptoms only exist for a subset of codes (the ones we've
  // hand-verified). Most of the ~9.4k generic SAE codes only have a verified
  // `meaning` — see buildSystemPrompt in llamaService for how the gap is handled.
  possibleCauses?: string[];
  symptoms?: string[];
  severity?: "low" | "medium" | "high";
}

export type MessageRole = "user" | "assistant";

export interface Message {
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  faultCode: string;
  messages: Message[];
  createdAt: string;
  lastActivityAt: string;
}
