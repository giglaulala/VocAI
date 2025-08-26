import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let mode = "upload";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      mode = body?.mode || mode;
    } else {
      // form-data upload — ignore file and return mock
      await req.arrayBuffer();
    }

    const mock = buildMockAnalysis(mode);
    return NextResponse.json({ analysis: mock }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Demo fallback failed" },
      { status: 500 }
    );
  }
}

function buildMockAnalysis(mode: string) {
  const conversation = [
    {
      speaker: "Agent",
      message: "Hi there! Thanks for calling VocAI, how can I help today?",
      timestamp: "00:00",
    },
    {
      speaker: "Customer",
      message: "I want to understand your call analysis product.",
      timestamp: "00:02",
    },
    {
      speaker: "Agent",
      message: "We transcribe, diarize, analyze sentiment, topics and actions.",
      timestamp: "00:06",
    },
    {
      speaker: "Customer",
      message: "Nice. Can you send me a summary afterwards?",
      timestamp: "00:10",
    },
    {
      speaker: "Agent",
      message: "Absolutely. I will email a summary and next steps.",
      timestamp: "00:13",
    },
  ];

  const transcript = conversation
    .map((t) => `${t.speaker}: ${t.message}`)
    .join("\n");

  return {
    transcript,
    conversation,
    sentiment: { label: "positive", score: 0.82 },
    duration: 18,
    topics: ["product", "features", "summary"],
    actionItems: ["Email summary", "Share pricing page"],
    mode,
  };
}
