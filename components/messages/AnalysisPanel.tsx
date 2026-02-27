"use client";

import { BarChart2, CheckCircle2, Loader2 } from "lucide-react";

type SentimentLabel = "positive" | "negative" | "neutral";

export type ConversationAnalysis = {
  sentiment?: { label: string; score?: number };
  topics?: string[];
  actionItems?: string[];
  summary?: string;
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

function sentimentColors(label: string) {
  if (label === "positive") return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (label === "negative") return "text-rose-700 bg-rose-50 border-rose-200";
  return "text-amber-700 bg-amber-50 border-amber-200";
}

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

export function AnalysisPanel({
  analysis,
  analysisLoading,
  metrics,
  metricsLoading,
}: {
  analysis: ConversationAnalysis | null;
  analysisLoading: boolean;
  metrics: ConversationMetrics | null;
  metricsLoading: boolean;
}) {
  const hasAnything = analysisLoading || metricsLoading || analysis || metrics;
  if (!hasAnything) return null;

  return (
    <div className="rounded-2xl border border-primary-100 bg-white shadow-sm p-4 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-primary-600" />
        <h3 className="text-sm font-semibold text-neutral-900">AI Analysis</h3>
      </div>

      {/* Insights */}
      {analysisLoading && !analysis ? (
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing conversation…
        </div>
      ) : analysis ? (
        <div className="space-y-3">
          {analysis.sentiment && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-500 w-20 shrink-0">Sentiment</span>
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${sentimentColors(analysis.sentiment.label)}`}
              >
                {analysis.sentiment.label}
                {analysis.sentiment.score !== undefined
                  ? ` · ${Math.round(analysis.sentiment.score * 100)}%`
                  : ""}
              </span>
            </div>
          )}

          {analysis.topics && analysis.topics.length > 0 && (
            <div className="flex items-start gap-3">
              <span className="text-xs text-neutral-500 w-20 shrink-0 mt-0.5">Topics</span>
              <div className="flex flex-wrap gap-1.5">
                {analysis.topics.map((t) => (
                  <span
                    key={t}
                    className="text-xs bg-primary-50 text-primary-700 border border-primary-200 rounded-full px-2.5 py-0.5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.actionItems && analysis.actionItems.length > 0 && (
            <div className="flex items-start gap-3">
              <span className="text-xs text-neutral-500 w-20 shrink-0 mt-0.5">Actions</span>
              <ul className="space-y-1">
                {analysis.actionItems.map((a, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-neutral-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.summary && (
            <div className="flex items-start gap-3">
              <span className="text-xs text-neutral-500 w-20 shrink-0 mt-0.5">Summary</span>
              <p className="text-xs text-neutral-600 leading-relaxed">{analysis.summary}</p>
            </div>
          )}
        </div>
      ) : null}

      {/* Divider between sections */}
      {(analysis || analysisLoading) && (metrics || metricsLoading) && (
        <div className="border-t border-neutral-100" />
      )}

      {/* Support metrics */}
      {metricsLoading && !metrics ? (
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Calculating support metrics…
        </div>
      ) : metrics ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <MetricTile label="CSAT" value={`${metrics.csat} / 5`} />
          <MetricTile label="FCR" value={`${metrics.fcr}%`} />
          <MetricTile label="AHT" value={formatAht(metrics.aht)} />
          <MetricTile label="Avg Response" value={`${metrics.responseTime}s`} />
          <MetricTile label="Transfers" value={String(metrics.transfers)} />
          <MetricTile
            label="Sentiment"
            value={`${Math.round(metrics.sentimentScore * 100)}%`}
          />
          <MetricTile label="Compliance" value={`${metrics.compliance}%`} />
        </div>
      ) : null}
    </div>
  );
}
