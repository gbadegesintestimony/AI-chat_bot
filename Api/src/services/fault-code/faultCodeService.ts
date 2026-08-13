import faultCodeData from "../../data/fault-codes.json";
import type { FaultCodeInfo } from "../../types";

const KNOWLEDGE_BASE = faultCodeData as Record<string, FaultCodeInfo>;

// SAE J2012 format: P/B/C/U (system) + 4 hex characters, e.g. P0301.
// The 4th/5th characters go beyond 0-9 in the extended ranges (e.g. P000A,
// used for hybrid/EV powertrain codes), so hex digits must be accepted too.
const FAULT_CODE_PATTERN = /^[PBCU][0-9A-F]{4}$/;

// Same shape as FAULT_CODE_PATTERN but global+case-insensitive+word-bounded, for pulling
// codes out of free text like "what could cause P0302 and p0171?" rather than validating
// a single already-isolated string.
const FAULT_CODE_SEARCH_PATTERN = /\b[PBCU][0-9A-F]{4}\b/gi;

const MAX_CODES_PER_REQUEST = 5;

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

// Pulls every fault code mentioned anywhere in free text, deduplicated, capped at
// MAX_CODES_PER_REQUEST so a pasted wall of codes can't blow up the prompt/AI cost.
export function extractFaultCodes(text: string): string[] {
  const matches = text.match(FAULT_CODE_SEARCH_PATTERN) ?? [];
  const unique = [...new Set(matches.map((match) => match.toUpperCase()))];
  return unique.slice(0, MAX_CODES_PER_REQUEST);
}
