import type { Request, Response } from "express";
import { z } from "zod";
import { isKnownFaultCode, isValidFaultCodeFormat, lookupFaultCode, normalizeFaultCode } from "../services/fault-code/faultCodeService";

export const faultCodeSchema = z.object({
  code: z.string().trim().min(1).max(10),
});

export function validateFaultCode(req: Request, res: Response): void {
  const code = normalizeFaultCode(req.body.code);
  const validFormat = isValidFaultCodeFormat(code);

  if (!validFormat) {
    res.status(200).json({
      code,
      validFormat: false,
      known: false,
      info: null,
    });
    return;
  }

  const known = isKnownFaultCode(code);
  res.status(200).json({
    code,
    validFormat: true,
    known,
    info: known ? lookupFaultCode(code) : null,
  });
}
