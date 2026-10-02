"use client";

import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import { HistoricalMessage } from "@/lib/api/chat";

type ChatMessagesProps = {
  messages: HistoricalMessage[];
  hoveredListingId?: number | null;
  onHoverListing?: (listingId: number | null) => void;
};

export default function ChatArea({
  messages,
  hoveredListingId = null,
  onHoverListing,
}: ChatMessagesProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fade-bottom h-full scrollbar-thin scrollbar-thumb-gray-200 overflow-y-auto px-5 py-6">
      <div className="space-y-5">
        {messages.map((msg, index) => {
          const formattedTime = msg.created_at
            ? new Date(msg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          return (
            <ChatMessage
              key={msg.id || `msg-${index}`}
              role={msg.sender}
              content={msg.message}
              time={formattedTime}
              listings={msg.listings}
              hoveredListingId={hoveredListingId}
              onHoverListing={onHoverListing}
            />
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
}
