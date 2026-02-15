"use client";

import { useState } from "react";
import { Unplug } from "lucide-react";

import { apiFetchJson } from "./api";
import type { ConnectedPage, PagesResponse } from "./types";
import { PlatformBadge } from "./PlatformBadge";

export function ConnectedPages({
  token,
  pages,
  onReload,
}: {
  token: string;
  pages: ConnectedPage[];
  onReload: () => void;
}) {
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function disconnect(pageId: string) {
    setError(null);
    setDisconnecting(pageId);
    try {
      await apiFetchJson<{ ok: true }>(`/api/facebook/pages/disconnect/${pageId}`, {
        token,
        method: "POST",
      });
      onReload();
    } catch (e: any) {
      setError(e?.message || "Failed to disconnect page");
    } finally {
      setDisconnecting(null);
    }
  }

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-neutral-900">Connected pages</div>
        <button
          onClick={onReload}
          className="text-xs text-neutral-600 hover:text-neutral-900"
        >
          Refresh
        </button>
      </div>

      {pages.length === 0 ? (
        <div className="text-sm text-neutral-600">No pages connected yet.</div>
      ) : (
        <div className="space-y-2">
          {pages.map((p) => (
            <div
              key={p.page_id}
              className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-neutral-900 truncate">
                    {p.page_name || p.page_id}
                  </div>
                  <PlatformBadge platform={p.platform} />
                </div>
                <div className="text-xs text-neutral-500 truncate">{p.page_id}</div>
              </div>

              <button
                onClick={() => disconnect(p.page_id)}
                disabled={disconnecting === p.page_id}
                className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-60"
              >
                <Unplug className="w-4 h-4" />
                {disconnecting === p.page_id ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>
          ))}
        </div>
      )}

      {error ? <div className="mt-2 text-sm text-rose-600">{error}</div> : null}
    </div>
  );
}

export async function fetchConnectedPages(token: string) {
  return apiFetchJson<PagesResponse>("/api/facebook/pages", { token, method: "GET" });
}

