import type { ChatMessage, FaultCodeSummary } from "./types";

export interface HistoryEntry {
  conversationId: string;
  codes: FaultCodeSummary[];
  messages: ChatMessage[];
  updatedAt: string;
}

const STORAGE_KEY = "gobd-conversation-history";
const MAX_ENTRIES = 50;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadHistory(): HistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // Storage full/unavailable (e.g. private browsing) — history just won't persist this time.
  }
}

// Adds or updates an entry (moved to the front, most-recent-first) and persists the result.
export function upsertHistoryEntry(entry: HistoryEntry): HistoryEntry[] {
  const rest = loadHistory().filter((existing) => existing.conversationId !== entry.conversationId);
  const updated = [entry, ...rest];
  saveHistory(updated);
  return updated;
}

export function deleteHistoryEntry(conversationId: string): HistoryEntry[] {
  const updated = loadHistory().filter((entry) => entry.conversationId !== conversationId);
  saveHistory(updated);
  return updated;
}
