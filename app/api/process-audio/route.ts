import { NextResponse } from "next/server";
import { SpeechClient } from "@google-cloud/speech";
import path from "path";

// Ensure Node runtime and no static caching
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  console.log("🔍 STT API called - starting debug");
  try {
    // Allow model override via query param
    const url = new URL(req.url);
    const modelQueryParam = (url.searchParams.get("model") || "").toLowerCase();
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
    // Allow model override via multipart field as well
    const modelFormField = (form.get("model") as string | null) || null;
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

    // Initialize Google Speech client with flexible credential loading
    console.log("🔑 Initializing Google Speech client...");
    console.log(
      "🔑 GOOGLE_APPLICATION_CREDENTIALS:",
      process.env.GOOGLE_APPLICATION_CREDENTIALS
    );
    console.log(
      "🔑 GOOGLE_APPLICATION_CREDENTIALS_JSON:",
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ? "Set" : "Not set"
    );

    let client: SpeechClient;
    const inlineJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (inlineJson) {
      console.log("🔑 Using inline JSON credentials");
      try {
        const credentials = JSON.parse(inlineJson);
        client = new SpeechClient({ credentials });
        console.log("✅ Inline credentials parsed successfully");
      } catch (e: any) {
        console.log("❌ Failed to parse inline credentials:", e?.message);
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
      console.log("🔑 Resolved path:", resolved);

      // Check if file exists
      try {
        const fs = require("fs");
        if (fs.existsSync(resolved)) {
          console.log("✅ Key file exists at resolved path");
        } else {
          console.log("❌ Key file does not exist at resolved path");
          return NextResponse.json(
            {
              error: "Google credentials file not found",
              details: `File not found at: ${resolved}`,
            },
            { status: 500 }
          );
        }
      } catch (e) {
        console.log("⚠️ Could not check file existence:", e);
      }

      client = new SpeechClient({ keyFilename: resolved });
      console.log("✅ SpeechClient created with key file");
    } else {
      console.log("🔑 Using default ADC (Application Default Credentials)");
      client = new SpeechClient();
      console.log("✅ SpeechClient created with default ADC");
    }

    // Configure encoding based on uploaded content type when possible
    console.log("🎵 Configuring audio encoding for:", mimeType);
    let encoding: "MP3" | undefined;
    if (mimeType.includes("mpeg") || mimeType.includes("mp3")) {
      encoding = "MP3";
      console.log("✅ Set encoding to MP3");
    } else if (mimeType.includes("wav") || mimeType.includes("wave")) {
      console.log("✅ WAV detected, letting API infer encoding");
      encoding = undefined;
    } else if (
      mimeType.includes("m4a") ||
      mimeType.includes("mp4") ||
      mimeType.includes("aac")
    ) {
      console.log("❌ Unsupported audio type:", mimeType);
      return NextResponse.json(
        {
          error: "Unsupported audio type",
          details: `Received ${
            mimeType || "unknown"
          }. Please upload MP3 or WAV.`,
        },
        { status: 415 }
      );
    } else {
      console.log("⚠️ Unknown audio type, letting API infer:", mimeType);
      encoding = undefined;
    }

    // Validate auth early to surface credential errors clearly
    console.log("🔐 Testing authentication...");
    try {
      const projectId = await client.getProjectId();
      console.log("✅ Authentication successful, project ID:", projectId);
    } catch (authErr: any) {
      console.log("❌ Authentication failed:", authErr?.message);
      console.log("❌ Auth error details:", authErr);
      return NextResponse.json(
        {
          error: "Google credentials not working",
          details: authErr?.message,
          hint: "Set GOOGLE_APPLICATION_CREDENTIALS to an absolute path or GOOGLE_APPLICATION_CREDENTIALS_JSON to the full JSON.",
        },
        { status: 401 }
      );
    }

    // Let the API infer encoding if not set. Use a general-purpose model and punctuation.
    console.log("🎯 Creating recognition request...");
    // Decide model to use
    const requestedModel = (modelFormField || modelQueryParam || "video")
      .toString()
      .toLowerCase();
    const chosenModel = ["video", "phone_call", "default"].includes(
      requestedModel
    )
      ? (requestedModel as "video" | "phone_call" | "default")
      : "video";
    const useEnhanced = chosenModel === "video" || chosenModel === "phone_call";
    // Optional advanced parameters from query/form
    const parseBool = (val: string | null): boolean | undefined => {
      if (val == null) return undefined;
      const v = val.toLowerCase();
      if (v === "true" || v === "1" || v === "yes") return true;
      if (v === "false" || v === "0" || v === "no") return false;
      return undefined;
    };
    const getAll = (name: string): string[] => {
      const values: string[] = [];
      // query params
      url.searchParams.getAll(name).forEach((v) => values.push(v));
      // form field (comma-separated or repeated are both supported below)
      const formVal = form.getAll(name);
      formVal.forEach((v) => {
        if (typeof v === "string")
          values.push(
            ...v
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          );
      });
      return values;
    };

    const diarizationEnabled =
      parseBool(url.searchParams.get("diarization")) ??
      parseBool((form.get("diarization") as string) || null);
    const minSpeakers = parseInt(
      url.searchParams.get("minSpeakers") ||
        (form.get("minSpeakers") as string) ||
        "",
      10
    );
    const maxSpeakers = parseInt(
      url.searchParams.get("maxSpeakers") ||
        (form.get("maxSpeakers") as string) ||
        "",
      10
    );
    const phrases = getAll("phrases");
    const sampleRateHertz = parseInt(
      url.searchParams.get("sampleRateHertz") ||
        (form.get("sampleRateHertz") as string) ||
        "",
      10
    );
    const audioChannelCount = parseInt(
      url.searchParams.get("audioChannelCount") ||
        (form.get("audioChannelCount") as string) ||
        "",
      10
    );
    const enableSeparateRecognitionPerChannel =
      parseBool(url.searchParams.get("enableSeparateRecognitionPerChannel")) ??
      parseBool(
        (form.get("enableSeparateRecognitionPerChannel") as string) || null
      );

    const request = {
      audio: { content: audioBytes },
      config: {
        ...(encoding !== undefined ? { encoding } : {}),
        enableAutomaticPunctuation: true,
        languageCode: "en-US",
        model: chosenModel,
        ...(useEnhanced ? { useEnhanced: true } : {}),
        enableWordTimeOffsets: false,
        ...(Number.isFinite(sampleRateHertz) && sampleRateHertz > 0
          ? { sampleRateHertz }
          : {}),
        ...(Number.isFinite(audioChannelCount) && audioChannelCount > 0
          ? { audioChannelCount }
          : {}),
        ...(enableSeparateRecognitionPerChannel !== undefined
          ? { enableSeparateRecognitionPerChannel }
          : {}),
        ...(diarizationEnabled
          ? {
              enableSpeakerDiarization: true,
              ...(Number.isFinite(minSpeakers) && minSpeakers > 0
                ? { minSpeakerCount: minSpeakers }
                : {}),
              ...(Number.isFinite(maxSpeakers) && maxSpeakers > 0
                ? { maxSpeakerCount: maxSpeakers }
                : {}),
            }
          : {}),
        ...(phrases.length > 0 ? { speechContexts: [{ phrases }] } : {}),
      },
    } as const;
    // Redact audio content from logs
    const requestForLog = {
      ...request,
      audio: { content: "<redacted base64>" },
    };
    console.log("✅ Request created:", JSON.stringify(requestForLog, null, 2));

    // Add timeout to prevent hanging on bad creds
    console.log("⏱️ Starting speech recognition with 60s timeout...");
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Speech recognition timeout")), 60000)
    );

    const startTime = Date.now();
    const response = (await Promise.race([
      client.recognize(request),
      timeoutPromise,
    ])) as any;
    const duration = Date.now() - startTime;
    console.log("✅ Speech recognition completed in", duration, "ms");
    console.log("📝 Response received:", JSON.stringify(response, null, 2));

    const transcript = (response[0]?.results || [])
      .map((r: any) => r.alternatives?.[0]?.transcript || "")
      .join(" ")
      .trim();
    console.log("📝 Final transcript:", transcript);

    // Minimal shaping to fit the demo UI; conversation is not available without diarization
    const analysis = {
      transcript,
      conversation: [],
      sentiment: { label: "neutral" },
      duration: undefined as unknown as number | undefined,
      topics: [],
      actionItems: [],
      provider: "google-speech-to-text",
    };

    console.log("🎉 Success! Returning analysis");
    return NextResponse.json({ analysis }, { status: 200 });
  } catch (error: any) {
    console.log("💥 Error occurred:", error);
    console.log("💥 Error message:", error?.message);
    console.log("💥 Error code:", error?.code);
    console.log("💥 Error details:", error?.details);
    console.log("💥 Full error:", JSON.stringify(error, null, 2));

    const message = error?.message || "Transcription failed";
    const code = error?.code;
    const details = error?.details;
    return NextResponse.json(
      { error: message, code, details },
      { status: 500 }
    );
  }
}
