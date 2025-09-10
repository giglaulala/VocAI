"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Play,
  MessageSquare,
  Brain,
  CheckCircle,
  TrendingUp,
  Clock,
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
};

export default function WorkingDemo(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [useFallback, setUseFallback] = useState(true);
  const [language, setLanguage] = useState<string>("");

  const generateDemo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/demo-fallback", {
        method: "POST",
        body: JSON.stringify({ mode: "generate" }),
      });
      const data = await res.json();
      setAnalysisResult(data.analysis as AnalysisResult);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      if (language) form.append("language", language);
      // Try real STT first with a timeout and clear fallbacks
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 90000);
      let res: Response;
      try {
        // Route selection: use Whisper for Turkish/Georgian or if user chose a language explicitly
        const shouldUseWhisper = ["tr", "ka"].includes(language);
        const endpoint = shouldUseWhisper
          ? "/api/whisper"
          : "/api/process-audio";
        res = await fetch(endpoint, {
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
          const errJson = await res.json();
          console.error("/api/process-audio failed:", errJson);
        } catch (_) {
          console.error("/api/process-audio failed with status", res.status);
        }
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
      // Normalize to our AnalysisResult shape
      let analysis: AnalysisResult = {};
      if (
        contentType.includes("application/json") &&
        "text" in data &&
        !("analysis" in data)
      ) {
        analysis = { transcript: data.text };
      } else {
        analysis = (data.analysis || {}) as AnalysisResult;
      }
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
    } catch (err) {
      console.error(err);
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
    <section
      id="demo"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-white"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
            Interactive VocAI Demo
          </h2>
          <p className="text-neutral-600">
            Upload an MP3 or generate a sample to see chat-style analysis.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left controls */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary-600" /> Upload Your
                Audio
              </h3>
              <div className="flex gap-3 mb-3">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="border border-neutral-300 rounded-md px-2 py-1 text-sm"
                >
                  <option value="">Auto (Google/Whisper)</option>
                  <option value="en">English (Whisper)</option>
                  <option value="ru">Russian (Whisper)</option>
                  <option value="tr">Turkish (Whisper)</option>
                  <option value="ka">Georgian (Whisper)</option>
                </select>
              </div>
              <input
                type="file"
                accept="audio/mpeg,audio/mp3,audio/wav"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(file);
                }}
                className="block w-full text-sm text-neutral-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200"
              />
              <p className="text-xs text-neutral-500 mt-2">
                MP3/WAV up to ~60s in demo mode.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-accent-600" /> Generate Sample
                Call
              </h3>
              <button
                onClick={generateDemo}
                disabled={isLoading}
                className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
              >
                {isLoading ? "Generating..." : "Generate Demo"}
              </button>
              {useFallback && (
                <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-3 py-2 mt-3 inline-block">
                  Demo mode is active. Set Google Cloud credentials to enable
                  real STT.
                </p>
              )}
            </div>
          </motion.div>

          {/* Right results */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {analysisResult ? (
              <>
                <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary-600" /> Full
                    Transcript
                  </h3>
                  <div className="bg-neutral-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      {analysisResult.transcript || "No transcript available"}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    Conversation Flow
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {analysisResult.conversation &&
                    analysisResult.conversation.length > 0 ? (
                      analysisResult.conversation.map((turn, index) => (
                        <motion.div
                          key={index}
                          className={`flex ${
                            turn.speaker.includes("Speaker 1") ||
                            turn.speaker.includes("Agent") ||
                            turn.speaker.includes("Sales Rep")
                              ? "justify-start"
                              : "justify-end"
                          }`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <div
                            className={`max-w-xs ${
                              turn.speaker.includes("Speaker 1") ||
                              turn.speaker.includes("Agent") ||
                              turn.speaker.includes("Sales Rep")
                                ? "order-1"
                                : "order-2"
                            }`}
                          >
                            <div
                              className={`rounded-lg p-3 ${
                                turn.speaker.includes("Speaker 1") ||
                                turn.speaker.includes("Agent") ||
                                turn.speaker.includes("Sales Rep")
                                  ? "bg-primary-100 text-neutral-800"
                                  : "bg-neutral-100 text-neutral-800"
                              }`}
                            >
                              <p className="text-sm">{turn.message}</p>
                            </div>
                            <div className="flex items-center justify-between mt-1 text-xs text-neutral-500">
                              <span className="font-medium">
                                {turn.speaker}
                              </span>
                              <span>{turn.timestamp}</span>
                            </div>
                          </div>

                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center mx-2 ${
                              turn.speaker.includes("Speaker 1") ||
                              turn.speaker.includes("Agent") ||
                              turn.speaker.includes("Sales Rep")
                                ? "bg-primary-500 text-white order-2"
                                : "bg-accent-500 text-white order-1"
                            }`}
                          >
                            <span className="text-xs font-semibold">
                              {turn.speaker.includes("Speaker 1") ||
                              turn.speaker.includes("Agent") ||
                              turn.speaker.includes("Sales Rep")
                                ? "A"
                                : "B"}
                            </span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-neutral-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 text-neutral-300" />
                        <p>No conversation data available</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    AI Analysis
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-lg bg-neutral-50">
                      <TrendingUp className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                      <p className="text-sm text-neutral-600 mb-1">Sentiment</p>
                      <p className="font-semibold text-neutral-900 capitalize">
                        {analysisResult.sentiment?.label || "neutral"}
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-neutral-50">
                      <Clock className="w-8 h-8 text-accent-600 mx-auto mb-2" />
                      <p className="text-sm text-neutral-600 mb-1">Duration</p>
                      <p className="font-semibold text-neutral-900">
                        {analysisResult.duration
                          ? `${Math.floor(analysisResult.duration / 60)}:${(
                              analysisResult.duration % 60
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
                  <div className="flex flex-wrap gap-2 mb-4">
                    {analysisResult.topics &&
                    analysisResult.topics.length > 0 ? (
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
                  <h4 className="font-medium text-neutral-900 mb-2">
                    Action Items
                  </h4>
                  <div className="space-y-2">
                    {analysisResult.actionItems &&
                    analysisResult.actionItems.length > 0 ? (
                      analysisResult.actionItems.map((item, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-primary-600 mt-0.5" />
                          <span className="text-sm text-neutral-700">
                            {item}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-neutral-500 text-sm">
                        No action items identified
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-lg text-center">
                <Brain className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Ready for Analysis
                </h3>
                <p className="text-neutral-600">
                  Upload an audio file or generate a demo to see AI analysis in
                  action
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
