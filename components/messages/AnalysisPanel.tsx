"use client";

import { useState } from "react";
import {
  BarChart2,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Target,
  Star,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Zap,
  ClipboardList,
  UserCheck,
  MessageSquareDashed,
} from "lucide-react";
import { formatResponseTime } from "@/lib/messages/responseTime";

export type ConversationAnalysis = {
  sentiment?: { label: string; score?: number };
  topics?: string[];
  summary?: string;
  intent?: string;
  resolution?: "resolved" | "unresolved" | "pending";
  urgency?: "low" | "medium" | "high";
  keyIssues?: string[];
  actionItems?: string[];
  agentPerformance?: string;
  suggestedReply?: string | null;
};

export type ConversationMetrics = {
  csat: number;
  fcr: number;
  aht: number;
  responseTime: number;
  transfers: number;
  sentimentScore: number;
  compliance: number;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatAht(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5 text-center">
      <div className="text-[11px] text-neutral-500 leading-none">{label}</div>
      <div className="text-sm font-semibold text-neutral-900 mt-1">{value}</div>
    </div>
  );
}

function sentimentStyles(label: string) {
  if (label === "positive") return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (label === "negative") return "text-rose-700 bg-rose-50 border-rose-200";
  return "text-amber-700 bg-amber-50 border-amber-200";
}

function resolutionStyles(r: string) {
  if (r === "resolved") return { bg: "bg-emerald-50 border-emerald-200 text-emerald-700", dot: "bg-emerald-500", label: "Resolved" };
  if (r === "unresolved") return { bg: "bg-rose-50 border-rose-200 text-rose-700", dot: "bg-rose-500", label: "Unresolved" };
  return { bg: "bg-amber-50 border-amber-200 text-amber-700", dot: "bg-amber-500", label: "Pending" };
}

function urgencyStyles(u: string) {
  if (u === "high") return { bg: "bg-rose-50 border-rose-200 text-rose-700", icon: "🔴", label: "High urgency" };
  if (u === "medium") return { bg: "bg-amber-50 border-amber-200 text-amber-700", icon: "🟡", label: "Medium urgency" };
  return { bg: "bg-neutral-50 border-neutral-200 text-neutral-600", icon: "🟢", label: "Low urgency" };
}

function StarRating({ score }: { score: number }) {
  const full = Math.floor(score);
  const half = score - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= full
              ? "fill-amber-400 text-amber-400"
              : i === full + 1 && half
              ? "fill-amber-200 text-amber-400"
              : "text-neutral-200"
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-neutral-700">{score.toFixed(1)}</span>
    </div>
  );
}

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <Icon className="w-3.5 h-3.5 text-neutral-400" />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{label}</span>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function AnalysisPanel({
  analysis,
  analysisLoading,
  metrics,
  metricsLoading,
  avgResponseTimeSecs,
  language = "en",
  onLangChange,
}: {
  analysis: ConversationAnalysis | null;
  analysisLoading: boolean;
  metrics: ConversationMetrics | null;
  metricsLoading: boolean;
  avgResponseTimeSecs?: number | null;
  language?: "en" | "ka";
  onLangChange?: (lang: "en" | "ka") => void;
}) {
  const [metricsOpen, setMetricsOpen] = useState(false);

  const hasAnything = analysisLoading || metricsLoading || analysis || metrics;
  if (!hasAnything) return null;

  const res = analysis?.resolution ? resolutionStyles(analysis.resolution) : null;
  const urg = analysis?.urgency ? urgencyStyles(analysis.urgency) : null;

  return (
    <div className="rounded-2xl border border-primary-100 bg-white shadow-sm divide-y divide-neutral-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-primary-600" />
          <h3 className="text-sm font-semibold text-neutral-900">AI Analysis</h3>
        </div>

        {/* Language toggle */}
        {onLangChange && (
          <div className="flex items-center rounded-lg border border-neutral-200 overflow-hidden text-xs font-medium">
            {(["en", "ka"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => onLangChange(lang)}
                className={`px-2.5 py-1 transition-colors ${
                  language === lang
                    ? "bg-primary-600 text-white"
                    : "bg-white text-neutral-500 hover:bg-neutral-50"
                }`}
              >
                {lang === "en" ? "EN" : "ქარ"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading state — first load */}
      {analysisLoading && !analysis && (
        <div className="flex items-center gap-2 px-4 py-4 text-sm text-neutral-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          {language === "ka" ? "ანალიზი მიმდინარეობს…" : "Analysing conversation…"}
        </div>
      )}

      {/* Re-analysing indicator (language switch while analysis visible) */}
      {analysisLoading && analysis && (
        <div className="flex items-center gap-1.5 px-4 py-2 text-xs text-neutral-400 bg-neutral-50">
          <Loader2 className="w-3 h-3 animate-spin" />
          {language === "ka" ? "ხელახლა ანალიზი…" : "Re-analysing…"}
        </div>
      )}

      {analysis && (
        <>
          {/* ── Overview ── */}
          <div className="px-4 py-3 space-y-3">
            {/* Resolution + Urgency badges */}
            {(res || urg) && (
              <div className="flex flex-wrap gap-2">
                {res && (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${res.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${res.dot}`} />
                    {res.label}
                  </span>
                )}
                {urg && (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${urg.bg}`}>
                    {urg.icon} {urg.label}
                  </span>
                )}
                {analysis.sentiment && (
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${sentimentStyles(analysis.sentiment.label)}`}>
                    {analysis.sentiment.label}
                    {analysis.sentiment.score !== undefined && ` · ${Math.round(analysis.sentiment.score * 100)}%`}
                  </span>
                )}
              </div>
            )}

            {/* Summary */}
            {analysis.summary && (
              <p className="text-sm text-neutral-700 leading-relaxed">{analysis.summary}</p>
            )}
          </div>

          {/* ── Customer intent + key issues ── */}
          {(analysis.intent || (analysis.keyIssues && analysis.keyIssues.length > 0)) && (
            <div className="px-4 py-3 space-y-2.5">
              <SectionHeader icon={Target} label="Customer" />
              {analysis.intent && (
                <div className="flex items-start gap-2">
                  <span className="text-xs text-neutral-500 w-12 shrink-0 mt-0.5">Intent</span>
                  <p className="text-xs text-neutral-700 leading-relaxed">{analysis.intent}</p>
                </div>
              )}
              {analysis.keyIssues && analysis.keyIssues.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-xs text-neutral-500 w-12 shrink-0 mt-0.5">Issues</span>
                  <ul className="space-y-1">
                    {analysis.keyIssues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-neutral-700">
                        <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ── Topics ── */}
          {analysis.topics && analysis.topics.length > 0 && (
            <div className="px-4 py-3">
              <SectionHeader icon={Zap} label="Topics" />
              <div className="flex flex-wrap gap-1.5">
                {analysis.topics.map((t) => (
                  <span key={t} className="text-xs bg-primary-50 text-primary-700 border border-primary-200 rounded-full px-2.5 py-0.5">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Action items ── */}
          {analysis.actionItems && analysis.actionItems.length > 0 && (
            <div className="px-4 py-3">
              <SectionHeader icon={ClipboardList} label="Action Items" />
              <ul className="space-y-1.5">
                {analysis.actionItems.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Agent performance ── */}
          {analysis.agentPerformance && (
            <div className="px-4 py-3">
              <SectionHeader icon={UserCheck} label="Agent Performance" />
              <p className="text-xs text-neutral-700 leading-relaxed">{analysis.agentPerformance}</p>
            </div>
          )}

          {/* ── Suggested reply ── */}
          {analysis.suggestedReply && (
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <SectionHeader icon={MessageSquareDashed} label="Suggested Reply" />
                <CopyButton text={analysis.suggestedReply} />
              </div>
              <div className="rounded-xl bg-primary-50 border border-primary-100 px-3 py-2.5 text-xs text-neutral-700 leading-relaxed whitespace-pre-wrap">
                {analysis.suggestedReply}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Support metrics (collapsible) ── */}
      {(metricsLoading || metrics) && (
        <div>
          <button
            onClick={() => setMetricsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors"
          >
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Support Metrics
            </span>
            {metricsOpen ? (
              <ChevronUp className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            )}
          </button>

          {metricsOpen && (
            <div className="px-4 pb-4">
              {metricsLoading && !metrics ? (
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calculating support metrics…
                </div>
              ) : metrics ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <MetricTile label="CSAT" value={`${metrics.csat} / 5`} />
                  <MetricTile label="FCR" value={`${metrics.fcr}%`} />
                  <MetricTile
                    label="AHT"
                    value={formatAht(metrics.aht)}
                  />
                  <MetricTile
                    label="Avg Response"
                    value={
                      avgResponseTimeSecs != null
                        ? formatResponseTime(avgResponseTimeSecs)
                        : `${metrics.responseTime}s`
                    }
                  />
                  <MetricTile label="Transfers" value={String(metrics.transfers)} />
                  <MetricTile
                    label="Sentiment"
                    value={`${Math.round(metrics.sentimentScore * 100)}%`}
                  />
                  <MetricTile label="Compliance" value={`${metrics.compliance}%`} />
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
