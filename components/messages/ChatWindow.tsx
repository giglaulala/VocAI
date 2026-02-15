"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";

import type { ConnectedPage, Conversation, Message } from "./types";
import { PlatformBadge } from "./PlatformBadge";
import { LinkifiedText } from "./text";
import { formatTime } from "./time";

export function ChatWindow({
  conversation,
  page,
  messages,
  loading,
  sending,
  onSend,
}: {
  conversation: Conversation | null;
  page: ConnectedPage | null;
  messages: Message[];
  loading?: boolean;
  sending?: boolean;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, conversation?.id]);

  const header = useMemo(() => {
    if (!conversation) return null;
    return {
      pageName: page?.page_name || conversation.page_id,
      customer: conversation.sender_id,
      platform: conversation.platform,
    };
  }, [conversation, page]);

  function submit() {
    const v = text.trim();
    if (!v) return;
    onSend(v);
    setText("");
  }

  if (!conversation) {
    return (
      <div className="rounded-2xl border border-primary-100 bg-white shadow-sm p-8 text-center text-neutral-600">
        Select a conversation to start.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary-100 bg-white shadow-sm flex flex-col h-[70vh] overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-neutral-900 truncate">
              {header?.pageName}
            </div>
            <PlatformBadge platform={header?.platform || "facebook"} />
          </div>
          <div className="text-xs text-neutral-500 truncate">
            Customer: {header?.customer}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4 space-y-3 bg-gradient-to-b from-white to-primary-50/30">
        {loading ? (
          <div className="text-sm text-neutral-600">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-sm text-neutral-600">No messages yet.</div>
        ) : (
          messages.map((m) => {
            const isCustomer = m.is_from_customer;
            return (
              <div
                key={m.message_id || m.id}
                className={"flex " + (isCustomer ? "justify-start" : "justify-end")}
              >
                <div
                  className={
                    "max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 border " +
                    (isCustomer
                      ? "bg-white border-neutral-200 text-neutral-900"
                      : "bg-primary-600 border-primary-600 text-white")
                  }
                >
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {m.text ? <LinkifiedText text={m.text} /> : <span>(no text)</span>}
                  </div>
                  <div
                    className={
                      "mt-1 text-[11px] " + (isCustomer ? "text-neutral-500" : "text-white/80")
                    }
                  >
                    {formatTime(m.timestamp || m.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-neutral-200 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            className="flex-1 resize-none rounded-xl border border-neutral-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          <button
            onClick={submit}
            disabled={sending || text.trim().length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
        <div className="mt-1 text-xs text-neutral-500">
          Press Enter to send, Shift+Enter for a new line.
        </div>
      </div>
    </div>
  );
}

