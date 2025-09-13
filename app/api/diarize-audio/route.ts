import { NextResponse } from "next/server";
import { SpeechClient } from "@google-cloud/speech";
import path from "path";

// Ensure Node runtime and no static caching
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  console.log("🔍 Diarization API called - starting debug");
  try {
    const contentType = req.headers.get("content-type") || "";
    console.log("📋 Content-Type:", contentType);

    if (!contentType.includes("multipart/form-data")) {
      console.log("❌ Invalid content type");
      return NextResponse.json(
        { error: "Expected multipart/form-data" },
        { status: 400 }
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    const minSpeakers = parseInt(
      (form.get("minSpeakers") as string) || "2",
      10
    );
    const maxSpeakers = parseInt(
      (form.get("maxSpeakers") as string) || "4",
      10
    );

    console.log(
      "📁 File received:",
      file ? `${(file as Blob).type} (${(file as Blob).size} bytes)` : "No file"
    );

    if (!(file instanceof Blob)) {
      console.log("❌ File is not a Blob");
      return NextResponse.json({ error: "File not provided" }, { status: 400 });
    }

    const mimeType = (file as Blob).type || "";
    const arrayBuffer = await file.arrayBuffer();
    const audioBytes = Buffer.from(arrayBuffer).toString("base64");
    console.log(
      "🎵 Audio processed:",
      mimeType,
      "->",
      audioBytes.length,
      "base64 chars"
    );

    // Initialize Google Speech client
    console.log("🔑 Initializing Google Speech client for diarization...");
    let client: SpeechClient;
    const inlineJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    const base64Json = process.env.GOOGLE_CREDENTIALS_BASE64;
    const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (base64Json) {
      console.log("🔑 Using Base64 encoded credentials");
      try {
        const jsonString = Buffer.from(base64Json, "base64").toString();
        const credentials = JSON.parse(jsonString);
        client = new SpeechClient({ credentials });
        console.log("✅ Base64 credentials parsed successfully");
      } catch (e: any) {
        console.log("❌ Failed to parse Base64 credentials:", e?.message);
        return NextResponse.json(
          {
            error: "Invalid GOOGLE_CREDENTIALS_BASE64",
            details: e?.message,
          },
          { status: 500 }
        );
      }
    } else if (inlineJson) {
      console.log("🔑 Using inline JSON credentials");
      console.log("🔑 JSON length:", inlineJson.length);
      console.log("🔑 JSON preview:", inlineJson.substring(0, 100) + "...");
      try {
        const credentials = JSON.parse(inlineJson);
        console.log("🔑 Parsed credentials keys:", Object.keys(credentials));
        client = new SpeechClient({ credentials });
        console.log("✅ Inline credentials parsed successfully");
      } catch (e: any) {
        console.log("❌ Failed to parse inline credentials:", e?.message);
        console.log("❌ JSON that failed to parse:", inlineJson);
        return NextResponse.json(
          {
            error: "Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON",
            details: e?.message,
          },
          { status: 500 }
        );
      }
    } else if (keyFilePath) {
      console.log("🔑 Using key file path:", keyFilePath);
      const resolved = path.isAbsolute(keyFilePath)
        ? keyFilePath
        : path.join(process.cwd(), keyFilePath);
      client = new SpeechClient({ keyFilename: resolved });
      console.log("✅ SpeechClient created with key file");
    } else {
      console.log("🔑 Using default ADC (Application Default Credentials)");
      client = new SpeechClient();
      console.log("✅ SpeechClient created with default ADC");
    }

    // Configure encoding based on uploaded content type
    console.log("🎵 Configuring audio encoding for:", mimeType);
    let encoding: "MP3" | undefined;
    if (mimeType.includes("mpeg") || mimeType.includes("mp3")) {
      encoding = "MP3";
      console.log("✅ Set encoding to MP3");
    } else if (mimeType.includes("wav") || mimeType.includes("wave")) {
      console.log("✅ WAV detected, letting API infer encoding");
      encoding = undefined;
    } else {
      console.log("⚠️ Unknown audio type, letting API infer:", mimeType);
      encoding = undefined;
    }

    // Validate auth
    console.log("🔐 Testing authentication...");
    try {
      const projectId = await client.getProjectId();
      console.log("✅ Authentication successful, project ID:", projectId);
    } catch (authErr: any) {
      console.log("❌ Authentication failed:", authErr?.message);
      // For now, let's continue anyway and see what happens
      console.log("⚠️ Continuing without auth validation...");
    }

    // Create diarization request
    console.log("🎯 Creating diarization request...");
    const request = {
      audio: { content: audioBytes },
      config: {
        ...(encoding !== undefined ? { encoding } : {}),
        enableAutomaticPunctuation: true,
        languageCode: "en-US", // We'll use Whisper for transcription, this is just for diarization
        enableSpeakerDiarization: true,
        minSpeakerCount: minSpeakers,
        maxSpeakerCount: maxSpeakers,
        enableWordTimeOffsets: true, // We need word-level timing for diarization
      },
    } as const;

    console.log("✅ Diarization request created");

    // Add timeout
    console.log("⏱️ Starting speaker diarization with 60s timeout...");
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Diarization timeout")), 60000)
    );

    const startTime = Date.now();
    const response = (await Promise.race([
      client.recognize(request),
      timeoutPromise,
    ])) as any;
    const duration = Date.now() - startTime;
    console.log("✅ Speaker diarization completed in", duration, "ms");

    // Process diarization results
    const speakers: Array<{
      speaker: string;
      message: string;
      timestamp: string;
      startTime: number;
      endTime: number;
    }> = [];

    if (response[0]?.results) {
      for (const result of response[0].results) {
        if (result.alternatives && result.alternatives[0]) {
          const alternative = result.alternatives[0];
          const transcript = alternative.transcript || "";

          if (alternative.words) {
            // Group words by speaker
            let currentSpeaker = "";
            let currentMessage = "";
            let currentStartTime = 0;
            let currentEndTime = 0;

            for (const word of alternative.words) {
              const speakerTag = word.speakerTag || 0;
              const speaker = `Speaker ${speakerTag + 1}`;
              const wordText = word.word || "";
              const startTime = word.startTime?.seconds || 0;
              const endTime = word.endTime?.seconds || 0;

              if (speaker !== currentSpeaker && currentMessage.trim()) {
                // Save previous speaker's message
                speakers.push({
                  speaker: currentSpeaker,
                  message: currentMessage.trim(),
                  timestamp: formatTime(currentStartTime),
                  startTime: currentStartTime,
                  endTime: currentEndTime,
                });

                // Start new speaker
                currentSpeaker = speaker;
                currentMessage = wordText;
                currentStartTime = startTime;
                currentEndTime = endTime;
              } else {
                // Continue current speaker
                currentSpeaker = speaker;
                currentMessage += (currentMessage ? " " : "") + wordText;
                currentEndTime = endTime;
              }
            }

            // Add the last message
            if (currentMessage.trim()) {
              speakers.push({
                speaker: currentSpeaker,
                message: currentMessage.trim(),
                timestamp: formatTime(currentStartTime),
                startTime: currentStartTime,
                endTime: currentEndTime,
              });
            }
          } else {
            // Fallback if no word-level timing
            speakers.push({
              speaker: "Speaker 1",
              message: transcript,
              timestamp: "00:00",
              startTime: 0,
              endTime: 0,
            });
          }
        }
      }
    }

    console.log("📝 Diarization results:", speakers.length, "speaker turns");

    return NextResponse.json(
      {
        speakers,
        totalSpeakers: Math.max(
          ...speakers.map((s) => parseInt(s.speaker.split(" ")[1])),
          0
        ),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("💥 Diarization error:", error);
    return NextResponse.json(
      { error: error?.message || "Diarization failed" },
      { status: 500 }
    );
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
