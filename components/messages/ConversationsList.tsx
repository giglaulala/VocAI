"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import type { Conversation } from "./types";
import { PlatformBadge } from "./PlatformBadge";
import { formatRelative } from "./time";

export function ConversationsList({
  conversations,
  getPreview,
  selectedId,
  onSelect,
  loading,
}: {
  conversations: Conversation[];
  getPreview?: (c: Conversation) => string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const pageName = c.connected_pages?.page_name || "";
      return (
        c.sender_id.toLowerCase().includes(q) ||
        c.page_id.toLowerCase().includes(q) ||
        pageName.toLowerCase().includes(q)
      );
    });
  }, [conversations, query]);

  return (
    <div className="rounded-2xl border border-primary-100 bg-white shadow-sm overflow-hidden">
      <div className="p-3 border-b border-neutral-200">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>
      </div>

      <div className="max-h-[65vh] overflow-auto">
        {loading ? (
          <div className="p-4 text-sm text-neutral-600">
            Loading conversations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-sm text-neutral-600">
            No conversations found.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {filtered.map((c) => {
              const active = c.id === selectedId;
              const preview = getPreview ? getPreview(c) : null;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => onSelect(c.id)}
                    className={
                      "w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors " +
                      (active ? "bg-primary-50" : "")
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-neutral-900 truncate">
                            {c.sender_id}
                          </div>
                          <PlatformBadge platform={c.platform} />
                        </div>
                        <div className="text-xs text-neutral-500 truncate">
                          {preview
                            ? preview
                            : c.connected_pages?.page_name || c.page_id}
                        </div>
                      </div>
                      <div className="text-xs text-neutral-500 whitespace-nowrap">
                        {formatRelative(c.last_message_at || c.created_at)}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
