import { NextResponse } from "next/server";

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
        { status: 500 }
      );
    }

    const apiForm = new FormData();
    apiForm.append("file", file, (file as any).name || "audio");
    apiForm.append("model", model);
    if (language) apiForm.append("language", language);

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: apiForm,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return NextResponse.json(
        { error: "Whisper request failed", details: errText },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text: string = data?.text || "";
    return NextResponse.json({ text }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Transcription error" },
      { status: 500 }
    );
  }
}

