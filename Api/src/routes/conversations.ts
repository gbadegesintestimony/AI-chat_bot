import { Router } from "express";
import {
  getConversationHistory,
  restoreConversation,
  restoreConversationSchema,
  sendMessage,
  sendMessageSchema,
  startConversation,
  startConversationSchema,
} from "../controllers/conversationController";
import { asyncHandler } from "../middleware/errorHandler";
import { aiLimiter } from "../middleware/rateLimiter";
import { validateBody } from "../middleware/validateRequest";

const router = Router();

router.post("/", aiLimiter, validateBody(startConversationSchema), asyncHandler(startConversation));
// No AI call here (just rebuilds a forgotten conversation's bookkeeping from client-held
// history), so it doesn't need the AI rate limiter — but it must come before the
// `/:conversationId` param route below, or that would swallow "restore" as an id.
router.post("/restore", validateBody(restoreConversationSchema), asyncHandler(restoreConversation));
router.get("/:conversationId", getConversationHistory);
router.post("/:conversationId/messages", aiLimiter, validateBody(sendMessageSchema), asyncHandler(sendMessage));

export default router;
