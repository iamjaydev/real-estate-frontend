"use client";

import { FormEvent, useState } from "react";

type ChatInputProps = {
  onSend: (message: string) => void;
};

export default function ChatInput({
  onSend,
}: ChatInputProps) {
  const [input, setInput] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();

    if (!message) {
      return;
    }

    onSend(message);

    setInput("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: "8px",
        padding: "16px",
        borderTop: "1px solid #e5e5e5",
      }}
    >
      <input
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Describe your ideal home..."
        style={{
          flex: 1,
          border: "1px solid #d1d1d1",
          borderRadius: "10px",
          padding: "10px 12px",
          fontSize: "14px",
          outline: "none",
        }}
      />

      <button
        type="submit"
        style={{
          border: "none",
          borderRadius: "10px",
          padding: "10px 16px",
          background: "#111111",
          color: "#ffffff",
          cursor: "pointer",
        }}
      >
        Send
      </button>
    </form>
  );
}