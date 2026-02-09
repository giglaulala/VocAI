import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { transcript, language = "en" } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set on the server" },
        { status: 500 },
      );
    }

    // Create analysis prompt based on language (generic, works for any domain)
    const analysisPrompt = createAnalysisPrompt(transcript, language);

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert business analyst who extracts key insights from conversation transcripts. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      temperature: 0,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const analysisText = completion.choices?.[0]?.message?.content;

    if (!analysisText) {
      return NextResponse.json(
        { error: "No analysis generated" },
        { status: 502 },
      );
    }

    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      analysis = {
        sentiment: { label: "neutral", score: 0.5 },
        topics: [],
        actionItems: [],
        summary: analysisText,
      };
    }

    // Heuristic enrichment: ensure topics/actionItems are present
    if (!Array.isArray(analysis.topics) || analysis.topics.length === 0) {
      analysis.topics = extractTopicsHeuristic(transcript, 3, 6);
    }
    if (
      !Array.isArray(analysis.actionItems) ||
      analysis.actionItems.length === 0
    ) {
      analysis.actionItems = extractActionItemsHeuristic(transcript, 2, 4);
    }

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Analysis failed" },
      { status: 500 },
    );
  }
}

function createAnalysisPrompt(transcript: string, language: string): string {
  const languageContext =
    {
      en: "English",
      ru: "Russian",
      tr: "Turkish",
      ka: "Georgian",
    }[language] || "English";

  return `Analyze this ${languageContext} conversation transcript and extract general insights. Return ONLY a JSON object with this exact structure:

{
  "sentiment": {
    "label": "positive|negative|neutral",
    "score": 0.0-1.0
  },
  "topics": ["topic1", "topic2", "topic3"],
  "actionItems": ["action1", "action2", "action3"],
  "summary": "Brief 1-2 sentence summary of the conversation"
}

Transcript:
${transcript}

Guidelines:
- Extract 3-6 short topics (single words or short noun phrases)
- Identify 2-4 concrete action items (requests, promises, decisions)
- Determine overall sentiment and a confidence score
- Keep topics and action items concise and domain-agnostic (works for any conversation)
- Respond with valid JSON only, no other text`;
}

// Simple stopword list for heuristic extraction
const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "if",
  "then",
  "so",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "am",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "me",
  "my",
  "your",
  "his",
  "her",
  "their",
  "our",
  "at",
  "by",
  "as",
  "from",
  "that",
  "this",
  "these",
  "those",
  "can",
  "could",
  "would",
  "should",
  "will",
  "shall",
  "do",
  "does",
  "did",
  "have",
  "has",
  "had",
  "not",
  "no",
  "yes",
  "hi",
  "hello",
  "thanks",
  "thank",
  "please",
]);

function extractTopicsHeuristic(text: string, min = 3, max = 6): string[] {
  const freq = new Map<string, number>();
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w) && w.length > 2)
    .forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));
  const sorted = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w);
  while (sorted.length < min && sorted.length > 0) {
    // duplicate last to satisfy min
    sorted.push(sorted[sorted.length - 1]);
  }
  return sorted.slice(0, Math.max(min, Math.min(max, sorted.length)));
}

function extractActionItemsHeuristic(text: string, min = 2, max = 4): string[] {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const candidates = sentences.filter((s) =>
    /\b(will|please|can you|could you|let's|let us|i'll|we'll|send|email|share|follow up|schedule|call|order|deliver|confirm)\b/i.test(
      s,
    ),
  );
  const trimmed = candidates
    .map((s) => s.replace(/^[-•\s]+/, ""))
    .slice(0, max);
  if (trimmed.length === 0) {
    return ["Follow up on discussion", "Confirm next steps"].slice(0, min);
  }
  while (trimmed.length < min) trimmed.push(trimmed[trimmed.length - 1]);
  return trimmed.slice(0, Math.max(min, Math.min(max, trimmed.length)));
}
