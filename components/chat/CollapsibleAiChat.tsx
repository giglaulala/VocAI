"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, Send, X } from "lucide-react";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};

function uid(): string {
  // Good enough for UI-only message keys
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function placeholderAiReply(userText: string): Promise<string> {
  // Placeholder for future OpenAI integration.
  // Replace with a real call (e.g. /api/chat) later.
  await new Promise((r) => setTimeout(r, 900));
  return `Got it. You said: "${userText}". (AI placeholder)`;
}

export default function CollapsibleAiChat(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: uid(),
      role: "assistant",
      content:
        "Hi! I’m your AI Assistant. Ask me anything about this dashboard.",
      createdAt: Date.now(),
    },
  ]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(
    () => input.trim().length > 0 && !isTyping,
    [input, isTyping],
  );

  useEffect(() => {
    if (isOpen) {
      // Let the open transition start, then focus.
      const t = setTimeout(() => inputRef.current?.focus(), 180);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    // Auto-scroll to newest message / typing indicator
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isTyping, isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: uid(), role: "user", content: text, createdAt: Date.now() },
    ]);
    setIsTyping(true);

    try {
      const reply = await placeholderAiReply(text);
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "assistant", content: reply, createdAt: Date.now() },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* Container that animates between FAB and chat panel */}
      <div
        className={[
          "overflow-hidden bg-white shadow-2xl ring-1 ring-black/5",
          "transition-all duration-300 ease-out",
          isOpen
            ? [
                "rounded-2xl",
                "w-[min(92vw,380px)]",
                "h-[min(72vh,560px)]",
              ].join(" ")
            : "rounded-full w-14 h-14",
        ].join(" ")}
      >
        {!isOpen ? (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-full h-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-300"
            aria-label="Open AI chat"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        ) : (
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-emerald-500 text-white">
              <div className="font-semibold">AI Assistant</div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center rounded-md p-1 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60"
                aria-label="Close AI chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 px-3 py-3 overflow-y-auto bg-gradient-to-b from-white to-neutral-50">
              <div className="space-y-2">
                {messages.map((m) => {
                  const isUser = m.role === "user";
                  return (
                    <div
                      key={m.id}
                      className={[
                        "flex",
                        isUser ? "justify-end" : "justify-start",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                          isUser
                            ? "bg-emerald-500 text-white rounded-br-md"
                            : "bg-white text-neutral-900 border border-neutral-200 rounded-bl-md",
                        ].join(" ")}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })}

                {isTyping ? (
                  <div className="flex justify-start">
                    <div className="bg-white border border-neutral-200 text-neutral-700 rounded-2xl rounded-bl-md px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500">Typing</span>
                        <span className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.2s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.1s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div ref={endRef} />
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-neutral-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendMessage();
                    }
                  }}
                  placeholder="Type a message…"
                  className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={!canSend}
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-3 py-2 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 text-[11px] text-neutral-500">
                This is a demo UI. Wire this to an API route later.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
