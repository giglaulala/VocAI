import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const language = (form.get("language") as string | null)?.trim() || "en";

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("🔄 Starting hybrid STT: Whisper + Google diarization");

    // Step 1: Get transcription from Whisper
    console.log("📝 Step 1: Transcribing with Whisper...");
    const whisperForm = new FormData();
    whisperForm.append("file", file);
    whisperForm.append("language", language);
    whisperForm.append("model", "gpt-4o-mini-transcribe");

    const whisperRes = await fetch(`${req.url.split("/api")[0]}/api/whisper`, {
      method: "POST",
      body: whisperForm,
    });

    if (!whisperRes.ok) {
      const errorText = await whisperRes.text().catch(() => "");
      return NextResponse.json(
        { error: "Whisper transcription failed", details: errorText },
        { status: 502 }
      );
    }

    const whisperData = await whisperRes.json();
    const transcript = whisperData.text || "";
    console.log("✅ Whisper transcription completed");

    if (!transcript.trim()) {
      return NextResponse.json(
        { error: "No transcript generated" },
        { status: 400 }
      );
    }

    // Step 2: Get speaker diarization from Google
    console.log("🎭 Step 2: Getting speaker diarization from Google...");
    const diarizationForm = new FormData();
    diarizationForm.append("file", file);
    diarizationForm.append("minSpeakers", "2");
    diarizationForm.append("maxSpeakers", "4");

    const diarizationRes = await fetch(
      `${req.url.split("/api")[0]}/api/diarize-audio`,
      {
        method: "POST",
        body: diarizationForm,
      }
    );

    let speakers: any[] = [];
    if (diarizationRes.ok) {
      const diarizationData = await diarizationRes.json();
      speakers = diarizationData.speakers || [];
      console.log(
        "✅ Google diarization completed:",
        speakers.length,
        "speaker turns"
      );
    } else {
      const errorText = await diarizationRes.text().catch(() => "");
      console.log(
        "⚠️ Google diarization failed:",
        diarizationRes.status,
        errorText
      );
      console.log("🔄 Trying simple diarization fallback...");

      // Try simple diarization as fallback
      try {
        const simpleDiarizationRes = await fetch(
          `${req.url.split("/api")[0]}/api/simple-diarization`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript }),
          }
        );

        if (simpleDiarizationRes.ok) {
          const simpleData = await simpleDiarizationRes.json();
          speakers = simpleData.speakers || [];
          console.log(
            "✅ Simple diarization completed:",
            speakers.length,
            "speaker turns"
          );
        } else {
          throw new Error("Simple diarization also failed");
        }
      } catch (simpleError) {
        console.log(
          "⚠️ Simple diarization failed, using single speaker fallback"
        );
        speakers = [
          {
            speaker: "Speaker 1",
            message: transcript,
            timestamp: "00:00",
            startTime: 0,
            endTime: 0,
          },
        ];
      }
    }

    // Step 3: Get AI analysis
    console.log("🤖 Step 3: Analyzing with AI...");
    let analysis = {
      sentiment: { label: "neutral", score: 0.5 },
      topics: [],
      actionItems: [],
    };

    try {
      const analysisRes = await fetch(
        `${req.url.split("/api")[0]}/api/analyze-text`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript, language }),
        }
      );

      if (analysisRes.ok) {
        const analysisData = await analysisRes.json();
        analysis = analysisData.analysis || analysis;
        console.log("✅ AI analysis completed");
      } else {
        console.log("⚠️ AI analysis failed, using defaults");
      }
    } catch (analysisError) {
      console.log("⚠️ AI analysis error:", analysisError);
    }

    // Step 4: Combine results
    const result = {
      transcript,
      conversation: speakers,
      sentiment: analysis.sentiment,
      duration:
        speakers.length > 0
          ? Math.max(...speakers.map((s) => s.endTime || 0))
          : undefined,
      topics: analysis.topics,
      actionItems: analysis.actionItems,
      provider: "hybrid-whisper-google",
    };

    console.log("🎉 Hybrid STT completed successfully");
    return NextResponse.json({ analysis: result }, { status: 200 });
  } catch (error: any) {
    console.log("💥 Hybrid STT error:", error);
    return NextResponse.json(
      { error: error?.message || "Hybrid STT failed" },
      { status: 500 }
    );
  }
}
