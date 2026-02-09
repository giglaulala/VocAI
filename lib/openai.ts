import OpenAI from "openai";

export type SupportAnalyticsMessage = {
  timestamp?: string;
  sender?: string; // "customer" | "agent" | ...
  text?: string;
};

export type SupportMetrics = {
  csat: number; // 1-5
  fcr: number; // 0-100
  aht: number; // seconds
  responseTime: number; // seconds
  transfers: number;
  sentimentScore: number; // 0-1
  compliance: number; // 0-100
};

let _client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (_client) return _client;
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set on the server");
  }
  _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
}

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function parseAhtToSeconds(aht: unknown): number {
  if (typeof aht === "number" && Number.isFinite(aht)) return Math.max(0, aht);
  if (typeof aht !== "string") return 0;
  const s = aht.trim();
  const mmss = s.match(/^(\d{1,3}):([0-5]\d)$/);
  if (!mmss) return 0;
  const minutes = Number(mmss[1]);
  const seconds = Number(mmss[2]);
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return 0;
  return Math.max(0, minutes * 60 + seconds);
}

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Invalid JSON from AI");
  }
}

function formatConversationForModel(
  messages: SupportAnalyticsMessage[],
  opts?: { maxMessages?: number; maxChars?: number },
): string {
  const maxMessages = opts?.maxMessages ?? 80;
  const maxChars = opts?.maxChars ?? 12000;

  const normalized = (Array.isArray(messages) ? messages : [])
    .map((m) => ({
      timestamp:
        typeof m?.timestamp === "string" && m.timestamp.trim()
          ? m.timestamp.trim()
          : "",
      sender:
        typeof m?.sender === "string" && m.sender.trim()
          ? m.sender.trim()
          : "unknown",
      text: typeof m?.text === "string" && m.text.trim() ? m.text.trim() : "",
    }))
    .filter((m) => m.text.length > 0)
    .slice(0, maxMessages);

  const lines = normalized.map((m, i) => {
    const ts = m.timestamp ? `[${m.timestamp}] ` : "";
    return `${i + 1}. ${ts}${m.sender}: ${m.text}`;
  });

  let out = lines.join("\n");
  if (out.length > maxChars) out = out.slice(0, maxChars) + "\n...(truncated)";
  return out;
}

export async function analyzeConversation(
  messages: SupportAnalyticsMessage[],
  params?: {
    model?: "gpt-4o-mini" | "gpt-4o";
    maxMessages?: number;
    maxChars?: number;
  },
): Promise<SupportMetrics> {
  const openai = getOpenAIClient();
  const model = params?.model ?? "gpt-4o-mini";

  const conversationText = formatConversationForModel(messages, {
    maxMessages: params?.maxMessages,
    maxChars: params?.maxChars,
  });

  const system =
    'You are a support analytics expert. Analyze the following customer support conversation and return ONLY a JSON object with these exact metrics:\n{\n  "csat": <number 1-5>,\n  "fcr": <number 0-100 representing percentage>,\n  "aht": <string in format "MM:SS">,\n  "responseTime": <number in seconds>,\n  "transfers": <number of agent transfers>,\n  "sentiment": <number 0-100 representing percentage>,\n  "compliance": <number 0-100 representing percentage>\n}\n\nAnalysis criteria:\n- CSAT: Infer customer satisfaction from tone, resolution, and feedback\n- FCR: Was the issue completely resolved in this conversation?\n- AHT: Calculate total conversation duration from first to last message\n- Response Time: Average time agent took to respond to customer\n- Transfers: Count how many times conversation was handed between agents\n- Sentiment: Overall customer emotional tone (positive=100, negative=0)\n- Compliance: Professional language, empathy, policy adherence\n\nReturn ONLY the JSON object, no explanation.';

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0,
    max_tokens: 220,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: conversationText || "(empty conversation)" },
    ],
  });

  const content = completion.choices?.[0]?.message?.content || "";
  const parsed = safeJsonParse(content);

  const csat = clamp(Number(parsed?.csat), 1, 5);
  const fcr = clamp(Number(parsed?.fcr), 0, 100);
  const ahtSeconds = parseAhtToSeconds(parsed?.aht);
  const responseTime = clamp(Number(parsed?.responseTime), 0, 24 * 60 * 60);
  const transfers = clamp(Number(parsed?.transfers), 0, 999);
  const sentimentPct = clamp(Number(parsed?.sentiment), 0, 100);
  const compliance = clamp(Number(parsed?.compliance), 0, 100);

  return {
    csat: Math.round(csat * 10) / 10,
    fcr: Math.round(fcr),
    aht: Math.round(ahtSeconds),
    responseTime: Math.round(responseTime),
    transfers: Math.round(transfers),
    sentimentScore: Math.round((sentimentPct / 100) * 100) / 100,
    compliance: Math.round(compliance),
  };
}
