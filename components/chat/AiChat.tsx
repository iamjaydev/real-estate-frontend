"use client";

import { useState } from "react";

import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! What kind of home are you looking for?",
    },
  ]);

  function handleSendMessage(content: string) {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      newMessage,
    ]);

    // Later:
    // Call your AI API here.
  }

  return (
    <aside
      style={{
        position: "absolute",
        top: "24px",
        left: "24px",
        width: "380px",
        height: "520px",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
        overflow: "hidden",
      }}
    >
      <ChatHeader />

      <ChatMessages messages={messages} />

      <ChatInput onSend={handleSendMessage} />
    </aside>
  );
}