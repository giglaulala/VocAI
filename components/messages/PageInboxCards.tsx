"use client";

import { ChevronRight, MessageSquare } from "lucide-react";

import type { ConnectedPage, Conversation } from "./types";
import { PlatformBadge } from "./PlatformBadge";

const platformStyles: Record<
  string,
  { card: string; border: string; chevron: string; countBadge: string; icon: string }
> = {
  facebook: {
    card: "bg-blue-50 hover:bg-blue-100/80",
    border: "border-blue-200",
    chevron: "text-blue-400 group-hover:text-blue-600",
    countBadge: "bg-blue-100 text-blue-700",
    icon: "text-blue-400",
  },
  instagram: {
    card: "bg-fuchsia-50 hover:bg-fuchsia-100/80",
    border: "border-fuchsia-200",
    chevron: "text-fuchsia-400 group-hover:text-fuchsia-600",
    countBadge: "bg-fuchsia-100 text-fuchsia-700",
    icon: "text-fuchsia-400",
  },
};

function Skeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-36 rounded-2xl border border-neutral-100 bg-neutral-50 animate-pulse"
        />
      ))}
    </div>
  );
}

export function PageInboxCards({
  pages,
  conversations,
  loading,
  onSelect,
}: {
  pages: ConnectedPage[];
  conversations: Conversation[];
  loading?: boolean;
  onSelect: (pageId: string) => void;
}) {
  if (loading) return <Skeleton />;

  const countByPage: Record<string, number> = {};
  for (const c of conversations) {
    countByPage[c.page_id] = (countByPage[c.page_id] || 0) + 1;
  }

  if (pages.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {pages.map((page) => {
        const s = platformStyles[page.platform] ?? platformStyles.facebook;
        const count = countByPage[page.page_id] ?? 0;

        return (
          <button
            key={page.page_id}
            onClick={() => onSelect(page.page_id)}
            className={`group text-left rounded-2xl border ${s.border} ${s.card} p-5 shadow-sm hover:shadow-md transition-all`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <PlatformBadge platform={page.platform} />
                <div className="mt-2 font-semibold text-neutral-900 text-lg leading-snug truncate">
                  {page.page_name || page.page_id}
                </div>
              </div>
              <ChevronRight
                className={`w-5 h-5 mt-1 shrink-0 ${s.chevron} group-hover:translate-x-0.5 transition-transform`}
              />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <MessageSquare className={`w-4 h-4 ${s.icon}`} />
              <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${s.countBadge}`}>
                {count} {count === 1 ? "conversation" : "conversations"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
