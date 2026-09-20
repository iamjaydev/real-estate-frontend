"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Sparkles, MapPin, Building, ShieldCheck } from "lucide-react";

import { sendChatMessage } from "@/lib/api/chat";

const SUGGESTIONS = [
  "3 BHK in Vesu, Surat under ₹80L",
  "Penthouse near Canal Road with terrace garden",
  "2 BHK furnished apartment near VIP Road",
  "Villa in Adajan with private parking",
];

export default function HomePage() {
  const [input, setInput] = useState("");

  const hasInput = input.trim().length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = input.trim();
    if (!query) return;

    setInput("");

    try {
      const response = await sendChatMessage({
        conversation_id: null,
        message: query,
        polygon: null,
      });

      console.log("AI response:", response.reply);
      console.log("Listings:", response.listings);
    } catch (error) {
      console.error("Chat failed:", error);
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-surface via-surface to-accent/5 px-4 py-12">
      <div className="absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />

      <div className="w-full max-w-2xl px-4 text-center sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-5xl sm:leading-tight">
          Find your{" "}
          <span className="relative inline-block text-accent">
            perfect home
            <svg
              className="absolute -bottom-1.5 left-0 h-2 w-full text-accent/60"
              viewBox="0 0 220 8"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 5C70 2, 150 6, 217 3.5"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-base text-text-secondary sm:text-lg">
          Describe what you&apos;re looking for in plain language and our AI will curate the best matching properties.
        </p>

        {/* Search Bar Container */}
        <form onSubmit={handleSubmit} className="mt-8 text-left">
          <div className="group relative flex items-center rounded-2xl border border-accent/20 bg-surface/80 p-2 shadow-xl shadow-accent/5 backdrop-blur-md transition-all duration-200 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/10 hover:border-accent/40">
            <div className="flex items-center pl-3 text-accent">
              <Sparkles size={20} className="shrink-0" />
            </div>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 3 BHK in Vesu, Surat under ₹80L with parking..."
              aria-label="Describe your ideal home"
              className="w-full border-none bg-transparent px-3 py-2 text-base text-text-primary outline-none placeholder:text-text-muted"
            />

            <button
              type="submit"
              disabled={!hasInput}
              aria-label="Search for homes"
              className={`flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 font-medium text-white transition-all duration-200 ${hasInput
                ? "cursor-pointer bg-accent hover:bg-accent-hover shadow-md shadow-accent/20 active:scale-95"
                : "cursor-not-allowed bg-accent-disabled opacity-60"
                }`}
            >
              <span className="hidden sm:inline text-sm">Search</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-medium text-text-muted">Try asking:</span>
          {SUGGESTIONS.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="rounded-lg border border-accent-border/50 bg-surface/50 px-3 py-1.5 text-xs text-text-secondary transition-all hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
            >
              {suggestion}
            </button>
          ))}
        </div>


      </div>
    </section>
  );
}