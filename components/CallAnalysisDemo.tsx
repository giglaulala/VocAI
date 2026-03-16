"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";

export default function CallAnalysisDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(180); // 3 minutes

  const conversation = [
    {
      speaker: "Agent",
      message:
        "Hello! Thank you for calling TechSupport. My name is Sarah. How can I help you today?",
      timestamp: "00:00",
      sentiment: "positive",
      type: "greeting",
    },
    {
      speaker: "Customer",
      message:
        "Hi Sarah, I'm having trouble with my internet connection. It keeps dropping every few minutes.",
      timestamp: "00:05",
      sentiment: "negative",
      type: "issue",
    },
    {
      speaker: "Agent",
      message:
        "I understand that can be frustrating. Let me help you troubleshoot this. First, can you tell me what type of connection you have?",
      timestamp: "00:12",
      sentiment: "positive",
      type: "question",
    },
    {
      speaker: "Customer",
      message:
        "I have cable internet through your company. It was working fine until yesterday.",
      timestamp: "00:18",
      sentiment: "neutral",
      type: "information",
    },
    {
      speaker: "Agent",
      message:
        "Thank you for that information. Let's start with some basic troubleshooting. Can you check if all the cables are securely connected?",
      timestamp: "00:25",
      sentiment: "positive",
      type: "instruction",
    },
    {
      speaker: "Customer",
      message: "Yes, I checked that already. Everything looks secure.",
      timestamp: "00:32",
      sentiment: "neutral",
      type: "confirmation",
    },
    {
      speaker: "Agent",
      message:
        "Great! Now let's try resetting your modem. Can you unplug the power cable for 30 seconds and then plug it back in?",
      timestamp: "00:38",
      sentiment: "positive",
      type: "instruction",
    },
  ];

  const insights = [
    {
      label: "Sentiment Score",
      value: "7.2/10",
      icon: TrendingUp,
      color: "primary",
    },
    {
      label: "Key Topics",
      value: "Internet, Connection, Troubleshooting",
      icon: MessageSquare,
      color: "accent",
    },
    {
      label: "Action Items",
      value: "3 identified",
      icon: CheckCircle,
      color: "primary",
    },
    { label: "Call Duration", value: "3:00 min", icon: Clock, color: "accent" },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
            See VocAI in Action
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Watch how we transform a real customer service call into structured
            insights
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Audio Player & Conversation */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Audio Player */}
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-6 border border-primary-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Call Recording
                </h3>
                <div className="flex items-center space-x-2 text-sm text-neutral-600">
                  <Volume2 className="w-4 h-4" />
                  <span>Customer Service Call #CS-2024-001</span>
                </div>
              </div>

              {/* Audio Controls */}
              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center text-white transition-colors duration-200"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-neutral-600 font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Conversation Display */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-primary-600" />
                <span>Conversation Analysis</span>
              </h3>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {conversation.map((msg, index) => (
                  <motion.div
                    key={index}
                    className={`flex ${
                      msg.speaker === "Agent" ? "justify-start" : "justify-end"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div
                      className={`max-w-xs ${
                        msg.speaker === "Agent" ? "order-1" : "order-2"
                      }`}
                    >
                      <div
                        className={`rounded-lg p-3 ${
                          msg.speaker === "Agent"
                            ? "bg-primary-100 text-neutral-800"
                            : "bg-neutral-100 text-neutral-800"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-neutral-500">
                        <span className="font-medium">{msg.speaker}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mx-2 ${
                        msg.speaker === "Agent"
                          ? "bg-primary-500 text-white order-2"
                          : "bg-accent-500 text-white order-1"
                      }`}
                    >
                      <span className="text-xs font-semibold">
                        {msg.speaker === "Agent" ? "A" : "C"}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Side - Insights & Analytics */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Key Insights */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Key Insights
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    className="text-center p-4 rounded-lg bg-neutral-50"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div
                      className={`w-10 h-10 bg-${insight.color}-100 rounded-lg flex items-center justify-center mx-auto mb-2`}
                    >
                      <insight.icon
                        className={`w-5 h-5 text-${insight.color}-600`}
                      />
                    </div>
                    <p className="text-sm text-neutral-600 mb-1">
                      {insight.label}
                    </p>
                    <p className="font-semibold text-neutral-900">
                      {insight.value}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Sentiment Analysis */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Sentiment Analysis
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Positive</span>
                  <span className="text-sm font-medium text-neutral-900">
                    60%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: "60%" }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Neutral</span>
                  <span className="text-sm font-medium text-neutral-900">
                    30%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-neutral-400 h-2 rounded-full"
                    style={{ width: "30%" }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Negative</span>
                  <span className="text-sm font-medium text-neutral-900">
                    10%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-accent-500 h-2 rounded-full"
                    style={{ width: "10%" }}
                  />
                </div>
              </div>
            </div>

            {/* Action Items */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Action Items Identified
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      Check cable connections
                    </p>
                    <p className="text-xs text-neutral-500">
                      Customer confirmed cables are secure
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      Reset modem
                    </p>
                    <p className="text-xs text-neutral-500">
                      Unplug for 30 seconds, then reconnect
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-accent-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      Monitor connection stability
                    </p>
                    <p className="text-xs text-neutral-500">
                      Test after modem reset
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-glow hover:shadow-xl"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Try This Demo Yourself
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
