import { Router } from "express";
import { faultCodeSchema, validateFaultCode } from "../controllers/faultCodeController";
import { validateBody } from "../middleware/validateRequest";

const router = Router();

router.post("/", validateBody(faultCodeSchema), validateFaultCode);

export default router;
