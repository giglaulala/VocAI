import { NextResponse } from "next/server";
import {
  analyzeConversation,
  type SupportAnalyticsMessage,
} from "@/lib/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Best-effort in-memory cache (helps in dev / node runtime).
const cache: Map<string, any> =
  (globalThis as any).__supportMetricsCache ||
  ((globalThis as any).__supportMetricsCache = new Map());

function cacheKey(messages: SupportAnalyticsMessage[]): string {
  const stable = (Array.isArray(messages) ? messages : []).map((m) => ({
    t: typeof m?.timestamp === "string" ? m.timestamp : "",
    s: typeof m?.sender === "string" ? m.sender : "",
    x: typeof m?.text === "string" ? m.text : "",
  }));
  // Keep key bounded to avoid huge memory usage.
  return JSON.stringify(stable).slice(0, 20000);
}

export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json().catch(() => ({}));

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 },
      );
    }

    const normalized: SupportAnalyticsMessage[] = messages
      .map((m: any) => ({
        timestamp: m?.timestamp,
        sender: m?.sender,
        text: m?.text,
      }))
      .filter((m) => typeof m.text === "string" && m.text.trim().length > 0);

    if (normalized.length === 0) {
      return NextResponse.json(
        { error: "messages array is empty" },
        { status: 400 },
      );
    }

    const key = cacheKey(normalized);
    if (cache.has(key)) {
      return NextResponse.json(
        { metrics: cache.get(key), cached: true },
        { status: 200 },
      );
    }

    const metrics = await analyzeConversation(normalized, {
      model: model === "gpt-4o" ? "gpt-4o" : "gpt-4o-mini",
      maxMessages: 80,
      maxChars: 12000,
    });

    cache.set(key, metrics);

    return NextResponse.json({ metrics, cached: false }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Support metrics analysis failed" },
      { status: 500 },
    );
  }
}
