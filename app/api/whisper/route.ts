import { NextResponse } from "next/server";
import { toFile } from "openai/uploads";
import { getOpenAIClient } from "@/lib/openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const language =
      (form.get("language") as string | null)?.trim() || undefined;
    const model =
      (form.get("model") as string | null)?.trim() || "gpt-4o-mini-transcribe"; // or "whisper-1"

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set on the server" },
        { status: 500 },
      );
    }

    const openai = getOpenAIClient();
    const openaiFile = await toFile(file, (file as any).name || "audio");

    let text = "";
    try {
      const transcription = await openai.audio.transcriptions.create({
        file: openaiFile,
        model,
        language,
      });
      text = (transcription as any)?.text || "";
    } catch (e: any) {
      return NextResponse.json(
        { error: "Whisper request failed", details: e?.message || String(e) },
        { status: 502 },
      );
    }

    // If we have a transcript, analyze it with AI
    if (text.trim()) {
      try {
        const analysisRes = await fetch(
          `${req.url.split("/api")[0]}/api/analyze-text`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transcript: text,
              language: language || "en",
            }),
          },
        );

        if (analysisRes.ok) {
          const analysisData = await analysisRes.json();
          return NextResponse.json(
            {
              text,
              analysis: {
                transcript: text,
                conversation: [],
                sentiment: analysisData.analysis?.sentiment || {
                  label: "neutral",
                },
                duration: undefined,
                topics: analysisData.analysis?.topics || [],
                actionItems: analysisData.analysis?.actionItems || [],
                provider: "openai-whisper",
              },
            },
            { status: 200 },
          );
        }
      } catch (analysisError) {
        console.error("Analysis failed:", analysisError);
      }
    }

    return NextResponse.json({ text }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Transcription error" },
      { status: 500 },
    );
  }
}
