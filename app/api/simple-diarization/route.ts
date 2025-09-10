import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 }
      );
    }

    console.log(
      "🎭 Starting simple diarization for transcript:",
      transcript.substring(0, 100) + "..."
    );

    // Simple heuristic-based speaker separation
    // This is a basic approach - in practice you'd want more sophisticated methods
    const sentences = transcript
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const speakers: Array<{
      speaker: string;
      message: string;
      timestamp: string;
      startTime: number;
      endTime: number;
    }> = [];

    // Simple alternating speaker assignment
    let currentSpeaker = 1;
    let timeOffset = 0;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      if (sentence.length < 3) continue; // Skip very short sentences

      // Alternate speakers every 2-3 sentences
      if (i > 0 && i % 2 === 0) {
        currentSpeaker = currentSpeaker === 1 ? 2 : 1;
      }

      const duration = Math.max(sentence.length * 0.1, 2); // Rough duration estimate

      speakers.push({
        speaker: `Speaker ${currentSpeaker}`,
        message: sentence,
        timestamp: formatTime(timeOffset),
        startTime: timeOffset,
        endTime: timeOffset + duration,
      });

      timeOffset += duration;
    }

    // If we only have one speaker worth of content, keep it as Speaker 1
    if (speakers.length <= 2) {
      speakers.forEach((speaker) => {
        speaker.speaker = "Speaker 1";
      });
    }

    console.log(
      "✅ Simple diarization completed:",
      speakers.length,
      "speaker turns"
    );

    return NextResponse.json(
      {
        speakers,
        totalSpeakers: Math.max(
          ...speakers.map((s) => parseInt(s.speaker.split(" ")[1])),
          1
        ),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("💥 Simple diarization error:", error);
    return NextResponse.json(
      { error: error?.message || "Simple diarization failed" },
      { status: 500 }
    );
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
