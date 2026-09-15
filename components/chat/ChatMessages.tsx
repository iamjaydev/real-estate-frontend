import type { Message } from "./AiChat";

type ChatMessagesProps = {
  messages: Message[];
};

export default function ChatMessages({
  messages,
}: ChatMessagesProps) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {messages.map((message) => {
        const isUser = message.role === "user";

        return (
          <div
            key={message.id}
            style={{
              alignSelf: isUser ? "flex-end" : "flex-start",
              maxWidth: "80%",
              padding: "10px 14px",
              borderRadius: "12px",
              background: isUser ? "#111111" : "#f3f3f3",
              color: isUser ? "#ffffff" : "#111111",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            {message.content}
          </div>
        );
      })}
    </div>
  );
}