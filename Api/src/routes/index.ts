import { Router } from "express";
import faultCodesRouter from "./faultCodes";
import conversationsRouter from "./conversations";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use("/fault-codes", faultCodesRouter);
router.use("/conversations", conversationsRouter);

export default router;
