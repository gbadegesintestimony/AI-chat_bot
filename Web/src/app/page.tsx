"use client";

import { useEffect, useState } from "react";
import { ApiError, restoreConversation, sendMessage, startConversation } from "@/lib/api";
import type { ChatMessage, FaultCodeSummary } from "@/lib/types";
import { deleteHistoryEntry, loadHistory, upsertHistoryEntry, type HistoryEntry } from "@/lib/history";
import { FaultCodeInput } from "@/components/FaultCodeInput";
import { CurrentFaultBadge } from "@/components/CurrentFaultBadge";
import { MessageList } from "@/components/MessageList";
import { SuggestedQuestions } from "@/components/SuggestedQuestions";
import { ChatInput } from "@/components/ChatInput";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Sidebar, SidebarToggleIcon } from "@/components/Sidebar";

interface ActiveConversation {
  conversationId: string;
  codes: FaultCodeSummary[];
}

export default function Home() {
  const [activeConversation, setActiveConversation] = useState<ActiveConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  // localStorage is only available client-side. Reading it during render (even via a lazy
  // useState initializer) would make the client's first pass diverge from the server-
  // rendered (empty) HTML and trigger a hydration mismatch — loading it in an effect after
  // mount is the correct, standard way to bring in browser-only data safely.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(loadHistory());
  }, []);

  async function handleStartConversation(input: string) {
    setIsStarting(true);
    setStartError(null);
    try {
      const response = await startConversation(input);
      setActiveConversation({ conversationId: response.conversationId, codes: response.codes });
      setMessages(response.messages);
      setHistory(
        upsertHistoryEntry({
          conversationId: response.conversationId,
          codes: response.codes,
          messages: response.messages,
          updatedAt: new Date().toISOString(),
        }),
      );
    } catch (error) {
      setStartError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsStarting(false);
    }
  }

  async function handleSendMessage(text: string) {
    if (!activeConversation || isSending) return;

    const userMessage: ChatMessage = { role: "user", content: text, createdAt: new Date().toISOString() };
    const messagesWithUser = [...messages, userMessage];
    setMessages(messagesWithUser);
    setChatError(null);
    setIsSending(true);

    const originalConversationId = activeConversation.conversationId;
    let conversationId = originalConversationId;
    let codes = activeConversation.codes;

    try {
      let response;
      try {
        response = await sendMessage(conversationId, text);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 404) throw error;
        // Backend has forgotten this conversation (restart, or Render free-tier cold
        // start) — rebuild it from the history we already have locally, then retry the
        // send against the freshly restored id. No error shown to the user for this.
        const restored = await restoreConversation(
          codes.map((c) => c.code),
          messages,
        );
        conversationId = restored.conversationId;
        codes = restored.codes;
        setActiveConversation({ conversationId, codes });
        response = await sendMessage(conversationId, text);
      }

      const assistantMessage: ChatMessage = { role: "assistant", content: response.reply, createdAt: new Date().toISOString() };
      const messagesWithReply = [...messagesWithUser, assistantMessage];
      setMessages(messagesWithReply);

      let nextHistory = upsertHistoryEntry({
        conversationId,
        codes: response.codes,
        messages: messagesWithReply,
        updatedAt: assistantMessage.createdAt,
      });
      if (conversationId !== originalConversationId) {
        // Drop the stale entry under the old id so the sidebar doesn't show a dead duplicate.
        nextHistory = deleteHistoryEntry(originalConversationId);
      }
      setHistory(nextHistory);
    } catch (error) {
      setChatError(error instanceof ApiError ? error.message : "Couldn't get a response. Please try again.");
      // Still persist what the user asked, even though the reply failed.
      setHistory(
        upsertHistoryEntry({
          conversationId,
          codes,
          messages: messagesWithUser,
          updatedAt: userMessage.createdAt,
        }),
      );
    } finally {
      setIsSending(false);
    }
  }

  function handleNewChat() {
    setActiveConversation(null);
    setMessages([]);
    setStartError(null);
    setChatError(null);
  }

  function handleSelectHistoryEntry(entry: HistoryEntry) {
    setActiveConversation({ conversationId: entry.conversationId, codes: entry.codes });
    setMessages(entry.messages);
    setStartError(null);
    setChatError(null);
  }

  function handleDeleteHistoryEntry(conversationId: string) {
    setHistory(deleteHistoryEntry(conversationId));
    if (activeConversation?.conversationId === conversationId) {
      handleNewChat();
    }
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        history={history}
        activeConversationId={activeConversation?.conversationId ?? null}
        onSelect={handleSelectHistoryEntry}
        onNewChat={handleNewChat}
        onDelete={handleDeleteHistoryEntry}
      />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
            title="Open sidebar"
            className="fixed left-3 top-3 z-20 rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <SidebarToggleIcon />
          </button>
        )}
        {!activeConversation ? (
          <FaultCodeInput onSubmit={handleStartConversation} isLoading={isStarting} error={startError} />
        ) : (
          <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col overflow-hidden">
            <CurrentFaultBadge codes={activeConversation.codes} onReset={handleNewChat} leftGutter={!isSidebarOpen} />
            <MessageList messages={messages} isLoading={isSending} />
            {chatError && <ErrorBanner message={chatError} />}
            <SuggestedQuestions onSelect={handleSendMessage} disabled={isSending} />
            <ChatInput onSend={handleSendMessage} isLoading={isSending} />
          </div>
        )}
      </div>
    </div>
  );
}
