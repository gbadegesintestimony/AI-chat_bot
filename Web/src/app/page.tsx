"use client";

import { useState } from "react";
import { ApiError, sendMessage, startConversation } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";
import { FaultCodeInput } from "@/components/FaultCodeInput";
import { CurrentFaultBadge } from "@/components/CurrentFaultBadge";
import { MessageList } from "@/components/MessageList";
import { SuggestedQuestions } from "@/components/SuggestedQuestions";
import { ChatInput } from "@/components/ChatInput";
import { ErrorBanner } from "@/components/ErrorBanner";

interface ActiveFault {
  conversationId: string;
  faultCode: string;
  known: boolean;
}

export default function Home() {
  const [activeFault, setActiveFault] = useState<ActiveFault | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  async function handleStartConversation(code: string) {
    setIsStarting(true);
    setStartError(null);
    try {
      const response = await startConversation(code);
      setActiveFault({ conversationId: response.conversationId, faultCode: response.faultCode, known: response.known });
      // Drop the synthetic priming message (index 0) — show just the assistant's explanation.
      setMessages(response.messages.slice(1));
    } catch (error) {
      setStartError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsStarting(false);
    }
  }

  async function handleSendMessage(text: string) {
    if (!activeFault || isSending) return;

    const userMessage: ChatMessage = { role: "user", content: text, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setChatError(null);
    setIsSending(true);

    try {
      const response = await sendMessage(activeFault.conversationId, text);
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
    setActiveFault(null);
    setMessages([]);
    setStartError(null);
    setChatError(null);
  }

  if (!activeFault) {
    return (
      <div className="flex flex-1 flex-col">
        <FaultCodeInput onSubmit={handleStartConversation} isLoading={isStarting} error={startError} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
      <CurrentFaultBadge faultCode={activeFault.faultCode} known={activeFault.known} onReset={handleReset} />
      <MessageList messages={messages} isLoading={isSending} />
      {chatError && <ErrorBanner message={chatError} />}
      <SuggestedQuestions onSelect={handleSendMessage} disabled={isSending} />
      <ChatInput onSend={handleSendMessage} isLoading={isSending} />
    </div>
  );
}
