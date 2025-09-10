import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { transcript, language = "en" } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set on the server" },
        { status: 500 }
      );
    }

    // Create analysis prompt based on language
    const analysisPrompt = createAnalysisPrompt(transcript, language);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return NextResponse.json(
        { error: "OpenAI API request failed", details: errorText },
        { status: 502 }
      );
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content;

    if (!analysisText) {
      return NextResponse.json(
        { error: "No analysis generated" },
        { status: 502 }
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
        topics: ["conversation"],
        actionItems: ["Follow up on discussion"],
        summary: analysisText,
      };
    }

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Analysis failed" },
      { status: 500 }
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

  return `Analyze this ${languageContext} conversation transcript and extract key business insights. Return ONLY a JSON object with this exact structure:

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
- Extract 3-5 main topics discussed
- Identify 2-4 specific action items or next steps
- Determine overall sentiment and confidence score
- Keep topics and action items concise but descriptive
- If no clear action items, use "Follow up on discussion" or similar
- Respond with valid JSON only, no other text`;
}
