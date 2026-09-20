"use client";

import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import type { Message } from "./types";

type ChatMessagesProps = {
  messages: Message[];
};

export default function ChatMessages({ messages }: ChatMessagesProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fade-bottom h-full scrollbar-thin scrollbar-thumb-gray-200 overflow-y-auto px-5 py-6">
      <div className="space-y-5">
        {messages.map(({ id, role, content, time }) => (
          <ChatMessage key={id} role={role} content={content} time={time} />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
