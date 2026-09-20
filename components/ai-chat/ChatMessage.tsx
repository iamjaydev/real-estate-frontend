import { cn } from "@/lib/utils";
import type { Message } from "./types";

const BUBBLE_STYLES = {
  assistant: "rounded-tl-md border border-slate-100 bg-[#F8FAFC] text-slate-800",
  user: "rounded-tr-md bg-[#1E1E24] text-white",
} as const satisfies Record<Message["role"], string>;

type ChatMessageProps = Omit<Message, "id">;

export default function ChatMessage({ role, content, time }: ChatMessageProps) {
  const isAssistant = role === "assistant";

  return (
    <div className={cn("flex", isAssistant ? "justify-start" : "justify-end")}>
      <div className="max-w-[88%] sm:max-w-[80%]">
        <div
          className={cn(
            "rounded-[20px] px-4 py-3 text-[15px] leading-relaxed shadow-sm",
            BUBBLE_STYLES[role],
          )}
        >
          <p className="break-words">{content}</p>
        </div>

        <span
          className={cn(
            "mt-1.5 block px-1 text-xs text-slate-400",
            isAssistant ? "text-left" : "text-right",
          )}
        >
          {time}
        </span>
      </div>
    </div>
  );
}
