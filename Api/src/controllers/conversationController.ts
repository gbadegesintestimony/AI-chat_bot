import type { Request, Response } from "express";
import { z } from "zod";
import { ApiError } from "../middleware/errorHandler";
import { isValidFaultCodeFormat, lookupFaultCode, normalizeFaultCode } from "../services/fault-code/faultCodeService";
import { appendMessage, createConversation, getConversation } from "../services/conversation/conversationService";
import { generateAssistantReply } from "../services/llama/llamaService";

export const startConversationSchema = z.object({
  faultCode: z.string().trim().min(1).max(10),
});

export const sendMessageSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(1000, "Message is too long"),
});

const INITIAL_PROMPT = "Explain what this fault code means, in plain language.";

export async function startConversation(req: Request, res: Response): Promise<void> {
  const faultCode = normalizeFaultCode(req.body.faultCode);

  if (!isValidFaultCodeFormat(faultCode)) {
    throw new ApiError(400, `"${faultCode}" is not a recognized fault-code format (expected e.g. P0301).`);
  }

  const conversation = createConversation(faultCode);
  const info = lookupFaultCode(faultCode);

  appendMessage(conversation.id, "user", INITIAL_PROMPT);
  const reply = await generateAssistantReply(faultCode, info, conversation.messages);
  appendMessage(conversation.id, "assistant", reply);

  res.status(201).json({
    conversationId: conversation.id,
    faultCode,
    known: Boolean(info),
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

  const info = lookupFaultCode(conversation.faultCode);
  const reply = await generateAssistantReply(conversation.faultCode, info, conversation.messages);
  appendMessage(conversation.id, "assistant", reply);

  res.status(200).json({
    conversationId: conversation.id,
    faultCode: conversation.faultCode,
    reply,
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
