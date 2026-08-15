import type { Request, Response } from "express";
import { z } from "zod";
import { ApiError } from "../middleware/errorHandler";
import { extractFaultCodes, isValidFaultCodeFormat, lookupFaultCode, normalizeFaultCode } from "../services/fault-code/faultCodeService";
import { appendMessage, createConversation, getConversation } from "../services/conversation/conversationService";
import { generateAssistantReply } from "../services/llama/llamaService";

export const startConversationSchema = z.object({
  // Accepts a bare code ("P0301") or a free-text question mentioning one or more codes
  // ("what could cause P0302 and P0171 on a Toyota Corolla?") — extractFaultCodes pulls
  // out whatever codes are actually present.
  input: z.string().trim().min(1).max(500),
});

export const sendMessageSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(1000, "Message is too long"),
});

export const restoreConversationSchema = z.object({
  codes: z.array(z.string().trim().min(1).max(10)).min(1).max(5),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(1000),
      }),
    )
    .min(1)
    .max(40),
});

function codeSummaries(codes: string[]) {
  return codes.map((code) => ({ code, known: Boolean(lookupFaultCode(code)) }));
}

export async function startConversation(req: Request, res: Response): Promise<void> {
  const { input } = req.body as { input: string };
  const codes = extractFaultCodes(input);

  if (codes.length === 0) {
    throw new ApiError(400, "I couldn't find a recognizable fault code (like P0301) in that — try including at least one.");
  }

  const conversation = createConversation(codes);
  const infos = codes.map((code) => lookupFaultCode(code));

  // The user's actual text becomes the first message — including a bare code like
  // "P0301" reads naturally to the model as an implicit "explain this" request.
  appendMessage(conversation.id, "user", input);
  const reply = await generateAssistantReply(codes, infos, conversation.messages);
  appendMessage(conversation.id, "assistant", reply);

  res.status(201).json({
    conversationId: conversation.id,
    codes: codeSummaries(codes),
    messages: conversation.messages,
  });
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  const { conversationId } = req.params;
  const conversation = conversationId ? getConversation(conversationId) : undefined;

  if (!conversation) {
    throw new ApiError(404, "Conversation not found. It may have expired — start a new one with the fault code.");
  }

  const { message } = req.body as { message: string };
  appendMessage(conversation.id, "user", message);

  const infos = conversation.faultCodes.map((code) => lookupFaultCode(code));
  const reply = await generateAssistantReply(conversation.faultCodes, infos, conversation.messages);
  appendMessage(conversation.id, "assistant", reply);

  res.status(200).json({
    conversationId: conversation.id,
    codes: codeSummaries(conversation.faultCodes),
    reply,
  });
}

// Re-creates a conversation record from a client-held copy of its history — used when the
// backend's in-memory store has forgotten a conversation (a restart or Render free-tier
// cold start wipes it) but the browser still has the full history cached locally. This is
// bookkeeping only, not a real "resume the AI's memory" — no Llama call happens here, it
// just rebuilds the record so the next real message can be sent normally.
export async function restoreConversation(req: Request, res: Response): Promise<void> {
  const { codes: rawCodes, messages: history } = req.body as {
    codes: string[];
    messages: { role: "user" | "assistant"; content: string }[];
  };

  const codes = [...new Set(rawCodes.map(normalizeFaultCode))].filter(isValidFaultCodeFormat);
  if (codes.length === 0) {
    throw new ApiError(400, "No valid fault codes to restore.");
  }

  const conversation = createConversation(codes);
  for (const message of history) {
    appendMessage(conversation.id, message.role, message.content);
  }

  res.status(201).json({
    conversationId: conversation.id,
    codes: codeSummaries(codes),
  });
}

export function getConversationHistory(req: Request, res: Response): void {
  const { conversationId } = req.params;
  const conversation = conversationId ? getConversation(conversationId) : undefined;

  if (!conversation) {
    throw new ApiError(404, "Conversation not found. It may have expired.");
  }

  res.status(200).json(conversation);
}
