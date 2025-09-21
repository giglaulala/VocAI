"use client";

import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import {
  ArrowUpRight,
  BarChart3,
  MessageSquare,
  Users,
  Clock,
  Smile,
  Activity,
} from "lucide-react";

export default function DemoDashboardPage(): JSX.Element {
  const trendData = [
    32, 40, 36, 45, 48, 44, 52, 60, 58, 66, 70, 76, 74, 80, 86, 92, 88, 95, 102,
    98, 110, 118, 115, 120, 126, 130, 138, 144, 150, 156,
  ];

  const barData = [12, 16, 10, 18, 22, 14, 20];
  const pieData = [48, 30, 22];

  const totalChats = 1560;
  const growthPercent = 24.31;

  // Helpers for simple SVG charts
  const maxTrend = Math.max(...trendData);
  const points = trendData
    .map((v, i) => {
      const x = (i / (trendData.length - 1)) * 100;
      const y = 100 - (v / maxTrend) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const barMax = Math.max(...barData);

  const pieTotal = pieData.reduce((a, b) => a + b, 0);
  const pieAngles = pieData.map((v) => (v / pieTotal) * 360);

  return (
    <main className="min-h-screen">
      <Header />
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900">
                Analytics Dashboard
              </h1>
              <p className="text-neutral-600 mt-2">
                Real-time insights and performance metrics
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="text-left sm:text-right">
                <div className="text-sm text-neutral-500">Last updated</div>
                <div className="text-sm font-medium text-neutral-900">
                  2 minutes ago
                </div>
              </div>
              <motion.a
                href="/demo/analytics"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all duration-200 shadow-glow hover:shadow-lg w-full sm:w-auto justify-center"
                whileHover={{ y: -2, scale: 1.02 }}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Live Demo</span>
                <ArrowUpRight className="w-4 h-4" />
              </motion.a>
            </div>
          </div>

          {/* Top stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Activity}
              title="Chat Session Dynamics"
              value="Last 30 Days"
              delta={`+${growthPercent}%`}
              positive
            />

            <StatCard
              icon={MessageSquare}
              title="Total Chats"
              value={totalChats.toLocaleString()}
              delta="+8.2%"
              positive
            />

            <StatCard
              icon={Clock}
              title="Avg Response Time"
              value="1.8s"
              delta="-12%"
              positive
            />

            <StatCard
              icon={Smile}
              title="CSAT"
              value="92%"
              delta="+3%"
              positive
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Line chart card */}
            <ChartCard
              title="Chat Volume - Last 30 Days"
              subtitle="Sessions per day"
            >
              <div className="aspect-[16/9]">
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="w-full h-full"
                >
                  <defs>
                    <linearGradient
                      id="lineGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="rgba(59,130,246,0.35)" />
                      <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                    </linearGradient>
                  </defs>
                  <polyline
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="1.5"
                    points={points}
                  />
                  <polygon
                    points={`0,100 ${points} 100,100`}
                    fill="url(#lineGradient)"
                  />
                </svg>
              </div>
              <div className="mt-4 text-sm text-neutral-500">
                Growth {growthPercent}% vs previous 30 days
              </div>
            </ChartCard>

            {/* Bar chart card */}
            <ChartCard title="Chat Distribution" subtitle="By day of week">
              <div className="aspect-[16/9] flex items-end gap-2">
                {barData.map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary-100 rounded-t-md"
                    style={{ height: `${(v / barMax) * 100}%` }}
                  />
                ))}
              </div>
              <div className="mt-4 text-sm text-neutral-500">
                Most active: Thu - Sat
              </div>
            </ChartCard>

            {/* Pie chart card */}
            <ChartCard title="Intent Breakdown" subtitle="Top categories">
              <div className="flex items-center justify-center py-6">
                <DonutChart
                  values={pieData}
                  colors={["#2563eb", "#60a5fa", "#bfdbfe"]}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <LegendDot color="#2563eb" label="Support" value="48%" />
                <LegendDot color="#60a5fa" label="Sales" value="30%" />
                <LegendDot color="#bfdbfe" label="Other" value="22%" />
              </div>
            </ChartCard>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  delta,
  positive,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  delta: string;
  positive?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      className="rounded-xl border border-primary-100 bg-white p-5 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-neutral-500">{title}</div>
            <div className="text-xl font-semibold text-neutral-900">
              {value}
            </div>
          </div>
        </div>
        <div
          className={`text-sm font-medium ${
            positive ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {delta}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="rounded-xl border border-primary-100 bg-white p-5 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-4">
        <div className="text-neutral-900 font-semibold">{title}</div>
        {subtitle ? (
          <div className="text-sm text-neutral-500">{subtitle}</div>
        ) : null}
      </div>
      {children}
    </motion.div>
  );
}

function MiniSparkline({ points }: { points: string }) {
  return (
    <div className="mt-3 h-16">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <polyline
          fill="none"
          stroke="#2563eb"
          strokeWidth="1.5"
          points={points}
        />
      </svg>
    </div>
  );
}

function MiniBars({ data, max }: { data: number[]; max: number }) {
  return (
    <div className="mt-3 h-16 flex items-end gap-1">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 bg-primary-100"
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

function DonutChart({
  values,
  colors,
}: {
  values: number[];
  colors: string[];
}) {
  const total = values.reduce((a, b) => a + b, 0);
  let cumulative = 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      className="rotate-[-90deg]"
    >
      <circle
        cx="60"
        cy="60"
        r={radius}
        stroke="#eef2ff"
        strokeWidth="16"
        fill="none"
      />
      {values.map((v, i) => {
        const fraction = v / total;
        const dash = fraction * circumference;
        const gap = circumference - dash;
        const circle = (
          <circle
            key={i}
            cx="60"
            cy="60"
            r={radius}
            stroke={colors[i % colors.length]}
            strokeWidth="16"
            fill="none"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-cumulative}
          />
        );
        cumulative += dash;
        return circle;
      })}
      <g className="rotate-90" transform="translate(0,0)">
        <circle cx="60" cy="60" r="24" fill="white" />
      </g>
    </svg>
  );
}

function LegendDot({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-neutral-700">{label}</span>
      <span className="ml-auto text-neutral-500">{value}</span>
    </div>
  );
}
