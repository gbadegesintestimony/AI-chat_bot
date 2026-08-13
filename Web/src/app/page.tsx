"use client";

import { useState } from "react";
import { ApiError, sendMessage, startConversation } from "@/lib/api";
import type { ChatMessage, FaultCodeSummary } from "@/lib/types";
import { FaultCodeInput } from "@/components/FaultCodeInput";
import { CurrentFaultBadge } from "@/components/CurrentFaultBadge";
import { MessageList } from "@/components/MessageList";
import { SuggestedQuestions } from "@/components/SuggestedQuestions";
import { ChatInput } from "@/components/ChatInput";
import { ErrorBanner } from "@/components/ErrorBanner";

interface ActiveConversation {
  conversationId: string;
  codes: FaultCodeSummary[];
}

export default function Home() {
  const [activeConversation, setActiveConversation] = useState<ActiveConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  async function handleStartConversation(input: string) {
    setIsStarting(true);
    setStartError(null);
    try {
      const response = await startConversation(input);
      setActiveConversation({ conversationId: response.conversationId, codes: response.codes });
      setMessages(response.messages);
    } catch (error) {
      setStartError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsStarting(false);
    }
  }

  async function handleSendMessage(text: string) {
    if (!activeConversation || isSending) return;

    const userMessage: ChatMessage = { role: "user", content: text, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setChatError(null);
    setIsSending(true);

    try {
      const response = await sendMessage(activeConversation.conversationId, text);
      setMessages((prev) => [...prev, { role: "assistant", content: response.reply, createdAt: new Date().toISOString() }]);
    } catch (error) {
      setChatError(
        error instanceof ApiError
          ? error.message
          : "Couldn't get a response. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  }

  function handleReset() {
    setActiveConversation(null);
    setMessages([]);
    setStartError(null);
    setChatError(null);
  }

  if (!activeConversation) {
    return (
      <div className="flex flex-1 flex-col">
        <FaultCodeInput onSubmit={handleStartConversation} isLoading={isStarting} error={startError} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
      <CurrentFaultBadge codes={activeConversation.codes} onReset={handleReset} />
      <MessageList messages={messages} isLoading={isSending} />
      {chatError && <ErrorBanner message={chatError} />}
      <SuggestedQuestions onSelect={handleSendMessage} disabled={isSending} />
      <ChatInput onSend={handleSendMessage} isLoading={isSending} />
    </div>
  );
}
