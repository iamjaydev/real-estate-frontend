"use client";

import { useState } from "react";
import { AiChat } from "@/components/ai-chat";
import GoogleMap from "@/components/map/GoogleMap";

export default function ChatPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden">
      <div
        className={`absolute inset-x-0 top-0 w-full transition-all duration-500 ease-in-out ${isCollapsed ? "h-full" : "h-1/2"} lg:inset-0 lg:h-full`}
      >
        <GoogleMap />
      </div>

      <AiChat
        isCollapsed={isCollapsed}
        onToggle={() => {
          setIsCollapsed(!isCollapsed);
        }}
      />
    </main>
  );
}
