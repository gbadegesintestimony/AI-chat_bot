import { Router } from "express";
import {
  getConversationHistory,
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
router.get("/:conversationId", getConversationHistory);
router.post("/:conversationId/messages", aiLimiter, validateBody(sendMessageSchema), asyncHandler(sendMessage));

export default router;
