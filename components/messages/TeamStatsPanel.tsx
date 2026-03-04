"use client";

import { useEffect, useState } from "react";
import { BarChart2, ShieldCheck, User, Loader2, Clock, MessageSquare, RefreshCw } from "lucide-react";

import { apiFetchJson } from "./api";
import type { EmployeeStat, ResponseTimeStatsResponse } from "./types";
import { formatResponseTime } from "@/lib/messages/responseTime";

function StatBadge({
  value,
  label,
  icon: Icon,
}: {
  value: string;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-neutral-600">
      <Icon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
      <span className="font-medium text-neutral-900">{value}</span>
      <span>{label}</span>
    </div>
  );
}

export function TeamStatsPanel({
  pageId,
  token,
}: {
  pageId: string;
  token: string;
}) {
  const [stats, setStats] = useState<EmployeeStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetchJson<ResponseTimeStatsResponse>(
        `/api/stats/response-times?pageId=${encodeURIComponent(pageId)}`,
        { token, method: "GET" },
      );
      setStats(res.stats ?? []);
    } catch (e: any) {
      setError(e?.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  return (
    <div className="rounded-2xl border border-primary-100 bg-white shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-primary-600" />
          <h3 className="text-sm font-semibold text-neutral-900">Team Performance</h3>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading team stats…
        </div>
      ) : error ? (
        <div className="text-sm text-rose-600">{error}</div>
      ) : stats.length === 0 ? (
        <div className="text-sm text-neutral-500">No team members found for this page.</div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {stats.map((s) => (
            <div key={s.user_id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                {/* Employee identity */}
                <div className="flex items-center gap-2 min-w-0">
                  {s.role === "admin" ? (
                    <ShieldCheck className="w-4 h-4 text-primary-500 shrink-0" />
                  ) : (
                    <User className="w-4 h-4 text-neutral-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-neutral-900 truncate">
                      {s.display_name ?? s.email ?? s.user_id}
                    </div>
                    {s.display_name && s.email && (
                      <div className="text-xs text-neutral-400 truncate">{s.email}</div>
                    )}
                  </div>
                </div>

                {/* Avg response time — the headline metric */}
                <div className="shrink-0 text-right">
                  {s.avg_response_time_seconds !== null ? (
                    <div className="text-base font-semibold text-neutral-900">
                      {formatResponseTime(s.avg_response_time_seconds)}
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-400">No data yet</div>
                  )}
                  <div className="text-[11px] text-neutral-400">avg response</div>
                </div>
              </div>

              {/* Secondary stats */}
              {s.reply_count > 0 && (
                <div className="mt-2 flex items-center gap-4 pl-6">
                  <StatBadge
                    icon={MessageSquare}
                    value={String(s.reply_count)}
                    label={s.reply_count === 1 ? "reply" : "replies"}
                  />
                  <StatBadge
                    icon={Clock}
                    value={String(s.conversation_count)}
                    label={s.conversation_count === 1 ? "conversation" : "conversations"}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
