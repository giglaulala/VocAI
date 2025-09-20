import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let mode = "upload";
    let chatId = "t1"; // default to first chat
    if (contentType.includes("application/json")) {
      const body = await req.json();
      mode = body?.mode || mode;
      chatId = body?.chatId || chatId;
    } else {
      // form-data upload — ignore file and return mock
      await req.arrayBuffer();
    }

    const mock = buildMockAnalysis(mode, chatId);
    return NextResponse.json({ analysis: mock }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Demo fallback failed" },
      { status: 500 }
    );
  }
}

function buildMockAnalysis(mode: string, chatId: string) {
  const conversation = [
    {
      speaker: "Agent",
      message:
        "Good morning! Thank you for calling TechSupport Pro, this is Sarah. How can I assist you today?",
      timestamp: "00:00",
    },
    {
      speaker: "Customer",
      message:
        "Hi Sarah, I'm having some serious issues with my account login. I've been trying to access my dashboard for the past two days and it keeps giving me an error message.",
      timestamp: "00:05",
    },
    {
      speaker: "Agent",
      message:
        "I'm sorry to hear you're experiencing login difficulties. That must be very frustrating. Let me help you resolve this right away. Can you tell me what specific error message you're seeing?",
      timestamp: "00:12",
    },
    {
      speaker: "Customer",
      message:
        "It says 'Invalid credentials' but I know my password is correct. I've reset it three times already and it's still not working. I'm getting really frustrated because I have important work to do.",
      timestamp: "00:18",
    },
    {
      speaker: "Agent",
      message:
        "I completely understand your frustration, and I apologize for the inconvenience. Let me check your account status right away. Can you please provide me with your email address or account ID?",
      timestamp: "00:25",
    },
    {
      speaker: "Customer",
      message:
        "Sure, it's john.smith@company.com. I've been a customer for over two years and never had this problem before.",
      timestamp: "00:30",
    },
    {
      speaker: "Agent",
      message:
        "Thank you, John. I can see your account in our system. It looks like there might be a temporary security lock on your account due to multiple failed login attempts. This is actually a security feature we have in place.",
      timestamp: "00:35",
    },
    {
      speaker: "Customer",
      message:
        "Oh, that makes sense. I did try logging in multiple times when it wasn't working. How do I get this lock removed?",
      timestamp: "00:42",
    },
    {
      speaker: "Agent",
      message:
        "I can remove that lock for you right now. I'm also going to reset your password one more time to ensure everything is fresh. You'll receive an email with a temporary password that you'll need to change on your first login.",
      timestamp: "00:47",
    },
    {
      speaker: "Customer",
      message:
        "That sounds good. Will I be able to access my account immediately after this?",
      timestamp: "00:53",
    },
    {
      speaker: "Agent",
      message:
        "Yes, absolutely. I'm processing the unlock now... and done! Your account is now unlocked and I've sent you a password reset email. You should receive it within the next 2-3 minutes.",
      timestamp: "00:58",
    },
    {
      speaker: "Customer",
      message:
        "Perfect! Thank you so much, Sarah. I really appreciate your help. This has been much more efficient than I expected.",
      timestamp: "01:05",
    },
    {
      speaker: "Agent",
      message:
        "You're very welcome, John! I'm glad I could help resolve this quickly for you. Is there anything else I can assist you with today? Perhaps any questions about our new features or billing?",
      timestamp: "01:10",
    },
    {
      speaker: "Customer",
      message:
        "Actually, yes. I noticed there's a new analytics dashboard that I haven't explored yet. Could you tell me a bit about what it offers?",
      timestamp: "01:16",
    },
    {
      speaker: "Agent",
      message:
        "Absolutely! Our new analytics dashboard provides real-time insights into your data usage, performance metrics, and user engagement. It includes customizable reports, automated alerts, and integration with popular business intelligence tools.",
      timestamp: "01:22",
    },
    {
      speaker: "Customer",
      message:
        "That sounds really useful. I'm particularly interested in the performance metrics. Does it track response times and system uptime?",
      timestamp: "01:28",
    },
    {
      speaker: "Agent",
      message:
        "Yes, exactly! It tracks response times, uptime percentages, error rates, and even provides predictive analytics to help you identify potential issues before they become problems. Would you like me to schedule a demo session with one of our product specialists?",
      timestamp: "01:35",
    },
    {
      speaker: "Customer",
      message:
        "That would be great! I'm available next Tuesday or Wednesday afternoon. What times work best?",
      timestamp: "01:42",
    },
    {
      speaker: "Agent",
      message:
        "Perfect! I can see we have slots available on Tuesday at 2 PM or Wednesday at 3 PM. I'll send you a calendar invite with the details. The session typically lasts about 30 minutes and you'll get a comprehensive walkthrough.",
      timestamp: "01:47",
    },
    {
      speaker: "Customer",
      message:
        "Tuesday at 2 PM works perfectly for me. Thank you for being so helpful today, Sarah. You've really turned this frustrating experience into a positive one.",
      timestamp: "01:53",
    },
    {
      speaker: "Agent",
      message:
        "I'm so glad I could help, John! I'll send you the calendar invite and the password reset email right now. Is there anything else I can do for you today?",
      timestamp: "01:58",
    },
    {
      speaker: "Customer",
      message:
        "No, that's everything. Thank you again for your excellent service. Have a wonderful day!",
      timestamp: "02:03",
    },
    {
      speaker: "Agent",
      message:
        "You too, John! Thank you for being such a valued customer. If you need anything else, don't hesitate to call us. Have a great day!",
      timestamp: "02:06",
    },
  ];

  const transcript = conversation
    .map((t) => `${t.speaker}: ${t.message}`)
    .join("\n");

  return {
    transcript,
    conversation,
    sentiment: { label: "positive", score: 0.89 },
    duration: 186, // 3 minutes and 6 seconds
    topics: [
      "account security",
      "login issues",
      "password reset",
      "customer support",
      "analytics dashboard",
      "performance metrics",
      "product demo",
      "scheduling",
      "customer satisfaction",
      "technical troubleshooting",
      "account management",
      "feature exploration",
    ],
    actionItems: [
      "Remove security lock from customer account",
      "Send password reset email to john.smith@company.com",
      "Schedule analytics dashboard demo for Tuesday 2 PM",
      "Send calendar invite for product demo session",
      "Follow up on customer satisfaction after resolution",
      "Document case resolution for future reference",
      "Escalate to product team about login security improvements",
    ],
    metrics: {
      csat: 4.8, // Customer Satisfaction Score out of 5
      fcr: 100, // First Contact Resolution percentage
      aht: 186, // Average Handle Time in seconds (3:06)
      responseTime: 12, // Average response time in seconds
      transfers: 0, // Number of transfers
      sentimentScore: 0.89, // Sentiment analysis score
      compliance: 95, // Compliance percentage
    },
    mode,
  };
}
