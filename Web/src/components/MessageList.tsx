"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/types";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
            : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-500"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // flex-col-reverse anchors short conversations to the bottom (near the input) instead
  // of leaving them stranded at the top with empty space below — and unlike a
  // min-h-full/justify-end wrapper, it doesn't depend on percentage-height resolution
  // through the overflow container, which isn't reliably definite. Render order is
  // reversed to match: DOM-first = visually-bottom, so the message array is reversed too.
  return (
    <div className="flex min-h-0 flex-1 flex-col-reverse space-y-3 space-y-reverse overflow-y-auto px-4 py-4">
      <div ref={bottomRef} />
      {isLoading && <TypingIndicator />}
      {[...messages].reverse().map((message, index) => (
        <MessageBubble key={messages.length - 1 - index} message={message} />
      ))}
    </div>
  );
}
