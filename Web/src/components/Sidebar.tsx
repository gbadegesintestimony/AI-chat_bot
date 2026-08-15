"use client";

import type { HistoryEntry } from "@/lib/history";

interface SidebarProps {
  history: HistoryEntry[];
  activeConversationId: string | null;
  onSelect: (entry: HistoryEntry) => void;
  onNewChat: () => void;
  onDelete: (conversationId: string) => void;
}

function entryTitle(entry: HistoryEntry): string {
  const codes = entry.codes.map((c) => c.code);
  if (codes.length === 0) return "Conversation";
  if (codes.length <= 2) return codes.join(", ");
  return `${codes.slice(0, 2).join(", ")} +${codes.length - 2}`;
}

export function Sidebar({ history, activeConversationId, onSelect, onNewChat, onDelete }: SidebarProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="p-3">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-left text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          + New fault code
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        <p className="px-2 pb-1 text-xs font-medium text-zinc-400 dark:text-zinc-500">History</p>

        {history.length === 0 && <p className="px-2 py-2 text-xs text-zinc-400 dark:text-zinc-500">No past conversations yet.</p>}

        <ul className="space-y-0.5">
          {history.map((entry) => (
            <li key={entry.conversationId} className="group flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelect(entry)}
                className={`min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-left font-mono text-sm transition-colors ${
                  entry.conversationId === activeConversationId
                    ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                {entryTitle(entry)}
              </button>
              <button
                type="button"
                onClick={() => onDelete(entry.conversationId)}
                aria-label="Delete conversation"
                title="Delete"
                className="shrink-0 rounded px-1.5 py-1 text-xs text-zinc-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
