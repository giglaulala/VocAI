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
  language?: string;
  metrics?: {
    csat: number;
    fcr: number;
    aht: number;
    responseTime: number;
    transfers: number;
    sentimentScore: number;
    compliance: number;
  };
};

export default function ChatDemo(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [useFallback, setUseFallback] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [selectedThreadId, setSelectedThreadId] = useState<string>("t1");
  const [language, setLanguage] = useState<string>("");

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
    if (turns.length > 0) {
      // Heuristic: sometimes diarization returns many tiny/garbled segments.
      // BUT if the provider is ai-diarization, we trust it and render as chat.
      if (analysisResult?.provider === "ai-diarization") return turns;
      const total = turns.length;
      const zeroTsCount = turns.filter(
        (t) => !t.timestamp || t.timestamp === "00:00" || t.timestamp === "—"
      ).length;
      const shortMsgCount = turns.filter((t) => {
        const wc = (t.message || "").trim().split(/\s+/).filter(Boolean).length;
        return wc <= 3;
      }).length;
      const looksBad =
        total >= 6 &&
        (zeroTsCount / total >= 0.8 || shortMsgCount / total >= 0.6);
      if (!looksBad) return turns;
      // Fallback to the more reliable Whisper transcript when diarization looks bad
    }
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
        body: JSON.stringify({ mode: "generate", chatId: selectedThreadId }),
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
      if (language) form.append("language", language);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 90000);
      let res: Response;
      try {
        // Route selection:
        // - default/auto => hybrid (Whisper + diarization)
        // - hybrid => hybrid
        // - RU/TR/KA => Whisper
        // - explicit "en" => Whisper
        // - otherwise => hybrid
        let endpoint = "/api/hybrid-stt"; // default to hybrid to ensure diarization
        if (["ru", "tr", "ka", "en"].includes(language)) {
          endpoint = "/api/whisper";
        } else if (language === "hybrid" || language === "") {
          endpoint = "/api/hybrid-stt";
        }
        console.log(
          "🎯 Selected endpoint for language",
          language,
          ":",
          endpoint
        );
        res = await fetch(endpoint, {
          method: "POST",
          body: form,
          signal: controller.signal,
        });
        console.log(
          "📡 [uploadFile] Primary response:",
          res.status,
          res.statusText
        );
      } catch (e) {
        res = new Response(null, { status: 599 });
      } finally {
        clearTimeout(timer);
      }

      if (!res.ok) {
        try {
          const body = await res.text();
          console.log("⚠️ [uploadFile] Primary non-OK body:", body);
        } catch {}
        // Primary failed. Try Whisper as a secondary fallback before demo.
        try {
          const whisperForm = new FormData();
          whisperForm.append("file", file);
          if (language)
            whisperForm.append(
              "language",
              language === "hybrid" ? "en" : language
            );
          const whisperRes = await fetch("/api/whisper", {
            method: "POST",
            body: whisperForm,
            signal: controller.signal,
          });
          console.log(
            "📡 [uploadFile] Whisper fallback response:",
            whisperRes.status,
            whisperRes.statusText
          );
          if (whisperRes.ok) {
            const whisperData = await whisperRes.json();
            let analysis: AnalysisResult = (whisperData.analysis ||
              {}) as AnalysisResult;
            // If conversation empty but we have transcript, try simple diarization enrichment
            if (
              (!analysis.conversation || analysis.conversation.length === 0) &&
              (analysis.transcript || whisperData.text)
            ) {
              const transcriptText =
                analysis.transcript || whisperData.text || "";
              try {
                const simpleRes = await fetch("/api/simple-diarization", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ transcript: transcriptText }),
                });
                if (simpleRes.ok) {
                  const sd = await simpleRes.json();
                  analysis = {
                    ...analysis,
                    transcript: transcriptText,
                    conversation: sd.speakers || [],
                  };
                }
              } catch {}
            }
            if (analysis.transcript && analysis.transcript.trim().length > 0) {
              setUseFallback(false);
              setAnalysisResult(analysis);
              return;
            }
          }
        } catch {}

        // As a last resort, use demo fallback
        const fb = await fetch("/api/demo-fallback", {
          method: "POST",
          body: form,
        });
        const fbData = await fb.json();
        setUseFallback(true);
        setAnalysisResult(fbData.analysis as AnalysisResult);
        return;
      }

      const contentType = res.headers.get("content-type") || "";
      const data = await res.json();
      console.log(
        "🧪 [uploadFile] Primary JSON keys:",
        Object.keys(data || {})
      );
      // Normalize to our AnalysisResult shape
      let analysis: AnalysisResult = {};
      if (contentType.includes("application/json") && "analysis" in data) {
        // Whisper route returns analysis directly
        analysis = data.analysis as AnalysisResult;
      } else if (
        contentType.includes("application/json") &&
        "text" in data &&
        !("analysis" in data)
      ) {
        // Fallback for text-only responses
        analysis = { transcript: data.text };
      } else {
        // Google route returns data.analysis
        analysis = (data.analysis || {}) as AnalysisResult;
      }
      // Determine effective language for follow-up AI calls
      const effectiveLanguage =
        language === "hybrid" || language === ""
          ? analysis.language || "en"
          : language;

      // If we have transcript but no/poor conversation and user selected Hybrid, ask AI to segment into chat
      if (
        (language === "hybrid" || language === "") &&
        analysis.transcript &&
        (!analysis.conversation || analysis.conversation.length === 0)
      ) {
        try {
          const aiRes = await fetch("/api/ai-diarization", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transcript: analysis.transcript,
              language: effectiveLanguage,
            }),
          });
          if (aiRes.ok) {
            const aiData = await aiRes.json();
            console.log("🧠 [ai-diarization] response:", aiData);
            analysis = {
              ...analysis,
              conversation: aiData.speakers || [],
              provider: "ai-diarization",
            };
          }
        } catch {}
      }

      if (!analysis.transcript || analysis.transcript.trim().length === 0) {
        // Try to enrich via Whisper + simple diarization before demo
        try {
          const whisperForm = new FormData();
          whisperForm.append("file", file);
          if (language)
            whisperForm.append(
              "language",
              language === "hybrid" ? "en" : language
            );
          const whisperRes = await fetch("/api/whisper", {
            method: "POST",
            body: whisperForm,
            signal: controller.signal,
          });
          if (whisperRes.ok) {
            const whisperData = await whisperRes.json();
            let enriched: AnalysisResult = (whisperData.analysis ||
              {}) as AnalysisResult;
            if (
              (!enriched.conversation || enriched.conversation.length === 0) &&
              (enriched.transcript || whisperData.text)
            ) {
              const transcriptText =
                enriched.transcript || whisperData.text || "";
              try {
                const simpleRes = await fetch("/api/simple-diarization", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ transcript: transcriptText }),
                });
                if (simpleRes.ok) {
                  const sd = await simpleRes.json();
                  enriched = {
                    ...enriched,
                    transcript: transcriptText,
                    conversation: sd.speakers || [],
                  };
                }
              } catch {}
            }
            if (enriched.transcript && enriched.transcript.trim().length > 0) {
              setUseFallback(false);
              setAnalysisResult(enriched);
              return;
            }
          }
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
      setUseFallback(false);
      if (
        analysis?.provider === "ai-diarization" ||
        (analysis?.provider || "").includes("hybrid-whisper-ai")
      ) {
        try {
          const preview = (analysis.conversation || []).slice(0, 6);
          console.log("🧠 AI-segmented dialogue (preview):", preview);
          console.log("🧠 AI-segmented meta:", {
            provider: analysis.provider,
            totalTurns: analysis.conversation?.length || 0,
          });
        } catch {}
      }
      console.log("🎯 Setting analysis result:", analysis);
      setAnalysisResult(analysis);

      // Immediately after accepting the analysis, send the EXACT transcript to AI for dialogue segmentation.
      // This guarantees the AI sees the same text you see in the log above.
      try {
        const acceptedTranscript = (analysis.transcript || "").trim();
        if (
          (language === "hybrid" || language === "") &&
          acceptedTranscript.length > 0
        ) {
          const aiPostRes = await fetch("/api/ai-diarization", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transcript: acceptedTranscript,
              language: effectiveLanguage,
            }),
          });
          if (aiPostRes.ok) {
            const aiPostData = await aiPostRes.json();
            console.log("🧠 [post-set] AI diarization output:", aiPostData);
            if (
              Array.isArray(aiPostData.speakers) &&
              aiPostData.speakers.length > 0
            ) {
              setAnalysisResult((prev) =>
                prev
                  ? {
                      ...prev,
                      conversation: aiPostData.speakers,
                      provider: "ai-diarization",
                    }
                  : prev
              );

              // After conversation is set, fetch insights (sentiment, topics, action items)
              try {
                const insightsRes = await fetch("/api/analyze-text", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    transcript: acceptedTranscript,
                    language: effectiveLanguage,
                  }),
                });
                if (insightsRes.ok) {
                  const insights = await insightsRes.json();
                  console.log("✨ [post-set] Insights:", insights);
                  setAnalysisResult((prev) =>
                    prev
                      ? {
                          ...prev,
                          sentiment:
                            insights.analysis?.sentiment || prev.sentiment,
                          topics: insights.analysis?.topics || prev.topics,
                          actionItems:
                            insights.analysis?.actionItems || prev.actionItems,
                        }
                      : prev
                  );
                }
              } catch {}
            }
          }
        }
      } catch {}
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
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-900">Chats</h3>
            </div>
            <div className="max-h-[620px] overflow-y-auto">
              {fakeThreads.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedThreadId(t.id);
                    setAnalysisResult(null); // Clear analysis when switching chats
                  }}
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

          {analysisResult && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Action Items
              </h3>
              <div className="space-y-2">
                {analysisResult.actionItems &&
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
          )}
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
              <div className="flex items-center gap-2">
                <a
                  href="/#api"
                  className="text-xs inline-flex items-center gap-2 px-3 py-1.5 border border-primary-200 text-primary-700 hover:bg-primary-50 rounded-md font-medium"
                >
                  Bind your API
                </a>
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
            </div>

            <div className="h-[520px] overflow-y-auto p-4 space-y-3 bg-neutral-50">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-neutral-500">
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing audio and formatting dialogue…</span>
                  </div>
                </div>
              ) : messages.length === 0 ? (
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
                      className={`flex ${
                        isA ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-sm ${isA ? "order-1" : "order-2"}`}
                      >
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
              <div className="mb-3">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Auto (Google/Whisper)</option>
                  <option value="en">English (Whisper)</option>
                  <option value="ru">Russian (Whisper)</option>
                  <option value="tr">Turkish (Whisper)</option>
                  <option value="ka">Georgian (Whisper)</option>
                  <option value="hybrid">Hybrid (Whisper + Diarization)</option>
                </select>
              </div>
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
                {analysisResult?.sentiment?.score && (
                  <p className="text-xs text-neutral-500 mt-1">
                    {(analysisResult.sentiment.score * 100).toFixed(0)}%
                    confidence
                  </p>
                )}
              </div>
              <div className="text-center p-4 rounded-lg bg-neutral-50">
                <Clock className="w-8 h-8 text-accent-600 mx-auto mb-2" />
                <p className="text-sm text-neutral-600 mb-1">Duration</p>
                <p className="font-semibold text-neutral-900">
                  {analysisResult?.duration
                    ? (() => {
                        const totalSeconds = Math.floor(
                          analysisResult?.duration || 0
                        );
                        const minutes = Math.floor(totalSeconds / 60);
                        const seconds = (totalSeconds % 60)
                          .toString()
                          .padStart(2, "0");
                        return `${minutes}:${seconds}`;
                      })()
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
          </div>
        </div>
      </div>

      {analysisResult?.metrics && (
        <div className="mt-6 bg-white rounded-2xl border border-neutral-200 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Support Metrics
          </h3>
          <div className="grid grid-cols-7 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200 min-w-[120px]">
              <div className="text-2xl font-bold text-green-700 mb-2">
                {analysisResult.metrics.csat}/5
              </div>
              <div className="text-sm text-green-600 font-medium">CSAT</div>
              <div className="text-xs text-green-500">
                Customer Satisfaction
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200 min-w-[120px]">
              <div className="text-2xl font-bold text-blue-700 mb-2">
                {analysisResult.metrics.fcr}%
              </div>
              <div className="text-sm text-blue-600 font-medium">FCR</div>
              <div className="text-xs text-blue-500">
                First Contact Resolution
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200 min-w-[120px]">
              <div className="text-2xl font-bold text-purple-700 mb-2">
                {Math.floor(analysisResult.metrics.aht / 60)}:
                {(analysisResult.metrics.aht % 60).toString().padStart(2, "0")}
              </div>
              <div className="text-sm text-purple-600 font-medium">AHT</div>
              <div className="text-xs text-purple-500">Average Handle Time</div>
            </div>

            <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-200 min-w-[120px]">
              <div className="text-2xl font-bold text-orange-700 mb-2">
                {analysisResult.metrics.responseTime}s
              </div>
              <div className="text-sm text-orange-600 font-medium">
                Response
              </div>
              <div className="text-xs text-orange-500">Avg Response Time</div>
            </div>

            <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200 min-w-[120px]">
              <div className="text-2xl font-bold text-red-700 mb-2">
                {analysisResult.metrics.transfers}
              </div>
              <div className="text-sm text-red-600 font-medium">Transfers</div>
              <div className="text-xs text-red-500">Number of Transfers</div>
            </div>

            <div className="text-center p-4 rounded-lg bg-indigo-50 border border-indigo-200 min-w-[120px]">
              <div className="text-2xl font-bold text-indigo-700 mb-2">
                {Math.round(analysisResult.metrics.sentimentScore * 100)}%
              </div>
              <div className="text-sm text-indigo-600 font-medium">
                Sentiment
              </div>
              <div className="text-xs text-indigo-500">AI Sentiment Score</div>
            </div>

            <div className="text-center p-4 rounded-lg bg-teal-50 border border-teal-200 min-w-[120px]">
              <div className="text-2xl font-bold text-teal-700 mb-2">
                {analysisResult.metrics.compliance}%
              </div>
              <div className="text-sm text-teal-600 font-medium">
                Compliance
              </div>
              <div className="text-xs text-teal-500">
                Policy & Script Adherence
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
