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

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You return ONLY strict JSON that validates. Do not paraphrase or add words. Use transcript text verbatim and only split it into turns.",
        },
        { role: "user", content: buildPrompt(transcript, language) },
      ],
      temperature: 0,
      max_tokens: 1200,
      response_format: { type: "json_object" },
    });

    const content = completion.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      // Try to extract JSON if the model added any stray tokens
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        return NextResponse.json(
          { error: "Invalid JSON from AI" },
          { status: 502 },
        );
      }
    }

    const speakers = (
      Array.isArray(parsed?.speakers) ? parsed.speakers : []
    ).map((s: any) => ({
      speaker: String(s.speaker || "Speaker 1"),
      message: String(s.message || ""),
      timestamp: String(s.timestamp || "—"),
      startTime: Number.isFinite(s.startTime) ? s.startTime : 0,
      endTime: Number.isFinite(s.endTime) ? s.endTime : 0,
    }));

    return NextResponse.json(
      {
        speakers,
        totalSpeakers: Math.max(
          ...speakers.map(
            (s: any) => parseInt(String(s.speaker).replace(/[^0-9]/g, "")) || 1,
          ),
          1,
        ),
        provider: "ai-diarization",
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "AI diarization failed" },
      { status: 500 },
    );
  }
}

function buildPrompt(transcript: string, language: string): string {
  return `Instruction: this is a dialogue between more than 1 people. Divide it like a chat between people.

STRICT RULES:
- Use VERBATIM text from the transcript. Do NOT invent, paraphrase, or change wording.
- Each message must be a contiguous span from the transcript; do not reorder.
- Split at natural sentence/phrase boundaries to form short chat turns.
- Alternate speakers sensibly; if unclear, use "Speaker 1" and "Speaker 2".
- Start timestamps at 0:00 and increase; rough estimates are fine.
- Output ONLY JSON with this exact structure, no extra keys or commentary:
{
  "speakers": [
    { "speaker": "Speaker 1|Agent|Customer", "message": "...", "timestamp": "m:ss", "startTime": 0, "endTime": 5 },
    { "speaker": "Speaker 2", "message": "...", "timestamp": "m:ss", "startTime": 5, "endTime": 11 }
  ]
}

Transcript:
${transcript}`;
}
