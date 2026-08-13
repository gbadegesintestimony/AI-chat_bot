import faultCodeData from "../../data/fault-codes.json";
import type { FaultCodeInfo } from "../../types";

const KNOWLEDGE_BASE = faultCodeData as Record<string, FaultCodeInfo>;

// SAE J2012 format: P/B/C/U (system) + 4 hex characters, e.g. P0301.
// The 4th/5th characters go beyond 0-9 in the extended ranges (e.g. P000A,
// used for hybrid/EV powertrain codes), so hex digits must be accepted too.
const FAULT_CODE_PATTERN = /^[PBCU][0-9A-F]{4}$/;

export function normalizeFaultCode(rawCode: string): string {
  return rawCode.trim().toUpperCase();
}

export function isValidFaultCodeFormat(code: string): boolean {
  return FAULT_CODE_PATTERN.test(code);
}

export function lookupFaultCode(code: string): FaultCodeInfo | undefined {
  return KNOWLEDGE_BASE[code];
}

export function isKnownFaultCode(code: string): boolean {
  return code in KNOWLEDGE_BASE;
}
