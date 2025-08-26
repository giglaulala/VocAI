"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Play,
  MessageSquare,
  Mic,
  StopCircle,
  Loader2,
  Sparkles,
  Clock,
  CheckCircle,
} from "lucide-react";

type ConversationTurn = {
  speaker: string;
  message: string;
  timestamp: string;
};

type AnalysisResult = {
  transcript?: string;
  conversation?: ConversationTurn[];
  sentiment?: { label: string; score?: number };
  duration?: number;
  topics?: string[];
  actionItems?: string[];
  provider?: string;
};

export default function ChatDemo(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [useFallback, setUseFallback] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [selectedThreadId, setSelectedThreadId] = useState<string>("t1");

  const fakeThreads = [
    {
      id: "t1",
      name: "Acme Corp",
      lastMessage: "Could you send the pricing tiers?",
      time: "2m",
      color: "primary",
    },
    {
      id: "t2",
      name: "Sophia Lee",
      lastMessage: "Let's schedule a follow-up next week.",
      time: "15m",
      color: "accent",
    },
    {
      id: "t3",
      name: "Northwind Sales",
      lastMessage: "Thanks for the demo!",
      time: "1h",
      color: "primary",
    },
    {
      id: "t4",
      name: "Delta Support",
      lastMessage: "Ticket #4821 has been resolved.",
      time: "3h",
      color: "accent",
    },
  ];

  const messages = useMemo(() => {
    const turns = analysisResult?.conversation || [];
    if (turns.length > 0) return turns;
    // fallback to transcript as single message when available
    return analysisResult?.transcript
      ? [
          {
            speaker: "Transcript",
            message: analysisResult.transcript,
            timestamp: "—",
          },
        ]
      : [];
  }, [analysisResult]);

  const generateDemo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/demo-fallback", {
        method: "POST",
        body: JSON.stringify({ mode: "generate" }),
        headers: { "content-type": "application/json" },
      });
      const data = await res.json();
      setUseFallback(true);
      setAnalysisResult(data.analysis as AnalysisResult);
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    setIsLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 90000);
      let res: Response;
      try {
        res = await fetch("/api/process-audio", {
          method: "POST",
          body: form,
          signal: controller.signal,
        });
      } catch (e) {
        res = new Response(null, { status: 599 });
      } finally {
        clearTimeout(timer);
      }

      if (!res.ok) {
        try {
          await res.json();
        } catch {}
        const fb = await fetch("/api/demo-fallback", {
          method: "POST",
          body: form,
        });
        const fbData = await fb.json();
        setUseFallback(true);
        setAnalysisResult(fbData.analysis as AnalysisResult);
        return;
      }

      const data = await res.json();
      const analysis = (data.analysis || {}) as AnalysisResult;
      if (!analysis.transcript || analysis.transcript.trim().length === 0) {
        const fb = await fetch("/api/demo-fallback", {
          method: "POST",
          body: form,
        });
        const fbData = await fb.json();
        setUseFallback(true);
        setAnalysisResult(fbData.analysis as AnalysisResult);
        return;
      }
      setUseFallback(false);
      setAnalysisResult(analysis);
    } catch (e) {
      try {
        const form = new FormData();
        form.append("file", file);
        const fb = await fetch("/api/demo-fallback", {
          method: "POST",
          body: form,
        });
        const fbData = await fb.json();
        setUseFallback(true);
        setAnalysisResult(fbData.analysis as AnalysisResult);
      } catch {}
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <aside className="lg:col-span-3">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200">
            <h3 className="text-sm font-semibold text-neutral-900">Chats</h3>
          </div>
          <div className="max-h-[620px] overflow-y-auto">
            {fakeThreads.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedThreadId(t.id)}
                className={`w-full px-4 py-3 flex items-center gap-3 border-b border-neutral-100 hover:bg-neutral-50 text-left ${
                  selectedThreadId === t.id ? "bg-neutral-50" : "bg-white"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    t.color === "primary" ? "bg-primary-100" : "bg-accent-100"
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      t.color === "primary"
                        ? "text-primary-700"
                        : "text-accent-700"
                    }`}
                  >
                    {t.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {t.name}
                    </p>
                    <span className="text-[11px] text-neutral-500 ml-2 flex-shrink-0">
                      {t.time}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 truncate">
                    {t.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="lg:col-span-6">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-600" />
              <span className="font-semibold text-neutral-900">
                Conversation
              </span>
            </div>
            {useFallback ? (
              <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-2 py-1">
                Demo mode
              </span>
            ) : (
              <span className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-2 py-1">
                Live STT
              </span>
            )}
          </div>

          <div className="h-[520px] overflow-y-auto p-4 space-y-3 bg-neutral-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-neutral-500">
                <div className="text-center">
                  <Sparkles className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
                  <p>
                    Upload an audio file or generate a sample to get started.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((turn, idx) => {
                const isA =
                  turn.speaker.includes("Speaker 1") ||
                  turn.speaker.includes("Agent") ||
                  turn.speaker.includes("Sales Rep");
                return (
                  <div
                    key={idx}
                    className={`flex ${isA ? "justify-start" : "justify-end"}`}
                  >
                    <div className={`max-w-sm ${isA ? "order-1" : "order-2"}`}>
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                          isA
                            ? "bg-white border border-neutral-200"
                            : "bg-primary-100"
                        }`}
                      >
                        <p className="text-sm text-neutral-800 whitespace-pre-wrap">
                          {turn.message}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-500">
                        <span className="font-medium">{turn.speaker}</span>
                        <span>{turn.timestamp}</span>
                      </div>
                    </div>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mx-2 ${
                        isA
                          ? "bg-primary-500 text-white order-2"
                          : "bg-accent-500 text-white order-1"
                      }`}
                    >
                      <span className="text-xs font-semibold">
                        {isA ? "A" : "B"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="px-4 py-3 border-t border-neutral-200 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
                <Upload className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-neutral-800">
                  Upload audio
                </span>
                <input
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file);
                  }}
                />
              </label>
              <button
                onClick={generateDemo}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">Generate sample</span>
              </button>
              <button
                disabled
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 text-neutral-500"
                title="Coming soon"
              >
                <Mic className="w-4 h-4" />
                <span className="text-sm font-medium">Record (soon)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            AI Analysis
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-neutral-50">
              <Sparkles className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm text-neutral-600 mb-1">Sentiment</p>
              <p className="font-semibold text-neutral-900 capitalize">
                {analysisResult?.sentiment?.label || "neutral"}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-neutral-50">
              <Clock className="w-8 h-8 text-accent-600 mx-auto mb-2" />
              <p className="text-sm text-neutral-600 mb-1">Duration</p>
              <p className="font-semibold text-neutral-900">
                {analysisResult?.duration
                  ? `${Math.floor((analysisResult?.duration || 0) / 60)}:${(
                      (analysisResult?.duration || 0) % 60
                    )
                      .toString()
                      .padStart(2, "0")}`
                  : "0:00"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Key Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysisResult?.topics && analysisResult.topics.length > 0 ? (
              analysisResult.topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                >
                  {topic}
                </span>
              ))
            ) : (
              <span className="text-neutral-500 text-sm">
                No topics identified
              </span>
            )}
          </div>
          <h4 className="font-medium text-neutral-900 mt-4 mb-2">
            Action Items
          </h4>
          <div className="space-y-2">
            {analysisResult?.actionItems &&
            analysisResult.actionItems.length > 0 ? (
              analysisResult.actionItems.map((item, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary-600 mt-0.5" />
                  <span className="text-sm text-neutral-700">{item}</span>
                </div>
              ))
            ) : (
              <span className="text-neutral-500 text-sm">
                No action items identified
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
