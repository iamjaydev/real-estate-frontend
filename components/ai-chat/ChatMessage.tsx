import { cn } from "@/lib/utils";
import { HistoricalMessage } from "@/lib/api/chat";
import ListingCard from "@/components/ai-chat/ListingCard";

const BUBBLE_STYLES = {
  assistant: "rounded-tl-md border border-slate-100 bg-[#F8FAFC] text-slate-800",
  user: "rounded-tr-md bg-[#1E1E24] text-white",
} as const;

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  time?: string;
  listings?: HistoricalMessage["listings"];
}

export default function ChatMessage({ role, content, time, listings }: ChatMessageProps) {
  const isAssistant = role === "assistant";
  const hasListings = isAssistant && listings && listings.length > 0;

  return (
    <div className={cn("flex flex-col", isAssistant ? "items-start" : "items-end")}>
      <div className="max-w-[88%] sm:max-w-[80%] space-y-2">
        <div
          className={cn(
            "rounded-[20px] px-4 py-3 text-[15px] leading-relaxed shadow-xs",
            BUBBLE_STYLES[role]
          )}
        >
          <p className="break-words">{content}</p>
        </div>

        {hasListings && (
          <div className="mt-2.5 space-y-2">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        <span
          className={cn(
            "block px-1 text-xs text-slate-400 mt-1",
            isAssistant ? "text-left" : "text-right"
          )}
        >
          {time}
        </span>
      </div>
    </div>
  );
}
