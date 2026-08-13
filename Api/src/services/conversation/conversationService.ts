import { randomUUID } from "node:crypto";
import type { Conversation, Message, MessageRole } from "../../types";

// MVP scope: conversation state lives in memory only (per PRD section 10/17 —
// persistence is optional and deferred). This means state is lost on restart
// and does not scale beyond a single process; swap for a DB-backed store if
// either of those becomes a real constraint.
const conversations = new Map<string, Conversation>();

const MAX_MESSAGES_PER_CONVERSATION = 40;
const CONVERSATION_TTL_MS = 60 * 60 * 1000; // 1 hour of inactivity
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // sweep every 10 minutes

export function createConversation(faultCode: string): Conversation {
  const now = new Date().toISOString();
  const conversation: Conversation = {
    id: randomUUID(),
    faultCode,
    messages: [],
    createdAt: now,
    lastActivityAt: now,
  };
  conversations.set(conversation.id, conversation);
  return conversation;
}

export function getConversation(conversationId: string): Conversation | undefined {
  return conversations.get(conversationId);
}

export function appendMessage(conversationId: string, role: MessageRole, content: string): Message | undefined {
  const conversation = conversations.get(conversationId);
  if (!conversation) {
    return undefined;
  }

  const message: Message = { role, content, createdAt: new Date().toISOString() };
  conversation.messages.push(message);

  // Bound memory/prompt growth rather than letting a single conversation grow unbounded.
  if (conversation.messages.length > MAX_MESSAGES_PER_CONVERSATION) {
    conversation.messages.splice(0, conversation.messages.length - MAX_MESSAGES_PER_CONVERSATION);
  }

  conversation.lastActivityAt = message.createdAt;
  return message;
}

function sweepExpiredConversations(): void {
  const cutoff = Date.now() - CONVERSATION_TTL_MS;
  for (const [id, conversation] of conversations) {
    if (new Date(conversation.lastActivityAt).getTime() < cutoff) {
      conversations.delete(id);
    }
  }
}

export function startConversationCleanup(): NodeJS.Timeout {
  return setInterval(sweepExpiredConversations, CLEANUP_INTERVAL_MS).unref();
}
