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
  const samples = {
    t1: {
      // Acme Corp - Technical Support
      conversation: [
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
      ],
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
        csat: 4.8,
        fcr: 100,
        aht: 186,
        responseTime: 12,
        transfers: 0,
        sentimentScore: 0.89,
        compliance: 95,
      },
    },
    t2: {
      // Sophia Lee - Sales Follow-up
      conversation: [
        {
          speaker: "Agent",
          message:
            "Hello Sophia! This is Michael from our sales team. I hope you're doing well today. I wanted to follow up on our conversation from last week about our premium analytics package.",
          timestamp: "00:00",
        },
        {
          speaker: "Customer",
          message:
            "Hi Michael! Yes, I remember our discussion. I've been reviewing the proposal you sent over, and I have some questions about the implementation timeline.",
          timestamp: "00:08",
        },
        {
          speaker: "Agent",
          message:
            "Absolutely, I'd be happy to address any questions you have. What specific aspects of the implementation timeline would you like to discuss?",
          timestamp: "00:15",
        },
        {
          speaker: "Customer",
          message:
            "Well, we're looking at a Q2 rollout, but I'm concerned about the data migration process. How long does that typically take, and what kind of downtime should we expect?",
          timestamp: "00:22",
        },
        {
          speaker: "Agent",
          message:
            "Great question, Sophia. For a company of your size, data migration typically takes 2-3 weeks, and we can do it with minimal downtime using our phased approach. We can migrate during off-peak hours to ensure business continuity.",
          timestamp: "00:30",
        },
        {
          speaker: "Customer",
          message:
            "That sounds promising. What about training for our team? We have about 15 people who would be using the new system.",
          timestamp: "00:38",
        },
        {
          speaker: "Agent",
          message:
            "We provide comprehensive training as part of the package. We offer both on-site and virtual training sessions, plus we have a dedicated customer success manager who will work with your team for the first 90 days to ensure smooth adoption.",
          timestamp: "00:45",
        },
        {
          speaker: "Customer",
          message:
            "That's very reassuring. I'm also curious about the reporting capabilities. Can we customize the dashboards to match our specific KPIs?",
          timestamp: "00:53",
        },
        {
          speaker: "Agent",
          message:
            "Absolutely! Our platform is highly customizable. You can create custom dashboards, set up automated reports, and even integrate with your existing business intelligence tools. We also offer white-labeling options if needed.",
          timestamp: "01:01",
        },
        {
          speaker: "Customer",
          message:
            "Excellent. I think this could be a great fit for us. What would be the next steps if we decide to move forward?",
          timestamp: "01:09",
        },
        {
          speaker: "Agent",
          message:
            "Perfect! I'd love to schedule a technical demo with your IT team and a pilot program. We can start with a 30-day trial at no cost, and I'll prepare a detailed implementation plan tailored to your specific needs.",
          timestamp: "01:16",
        },
        {
          speaker: "Customer",
          message:
            "That sounds ideal. When would be a good time for the technical demo? I'd like to include our CTO and our data analytics manager.",
          timestamp: "01:24",
        },
        {
          speaker: "Agent",
          message:
            "I can arrange that for next week. How does Tuesday at 2 PM work for everyone? I'll send over a calendar invite with the meeting details and a brief agenda.",
          timestamp: "01:31",
        },
        {
          speaker: "Customer",
          message:
            "Tuesday at 2 PM works perfectly. Thank you for being so thorough, Michael. I'm really excited about this opportunity.",
          timestamp: "01:38",
        },
        {
          speaker: "Agent",
          message:
            "I'm excited too, Sophia! I'll send over the calendar invite and some additional resources about our implementation process. I'll also prepare a customized proposal based on our discussion today.",
          timestamp: "01:45",
        },
        {
          speaker: "Customer",
          message:
            "That would be wonderful. I look forward to our meeting next week. Thank you for your time today.",
          timestamp: "01:52",
        },
        {
          speaker: "Agent",
          message:
            "Thank you, Sophia! I'll be in touch soon with all the details. Have a great rest of your day!",
          timestamp: "01:58",
        },
      ],
      topics: [
        "sales follow-up",
        "implementation timeline",
        "data migration",
        "training requirements",
        "customization options",
        "technical demo",
        "pilot program",
        "proposal discussion",
        "business continuity",
        "customer success",
        "reporting capabilities",
        "integration options",
      ],
      actionItems: [
        "Schedule technical demo for Tuesday 2 PM",
        "Prepare customized implementation plan",
        "Send calendar invite with agenda",
        "Create detailed proposal based on discussion",
        "Arrange 30-day trial setup",
        "Coordinate with CTO and analytics manager",
        "Follow up with additional resources",
      ],
      metrics: {
        csat: 4.6,
        fcr: 85,
        aht: 118,
        responseTime: 8,
        transfers: 0,
        sentimentScore: 0.92,
        compliance: 88,
      },
    },
    t3: {
      // Northwind Sales - Product Demo
      conversation: [
        {
          speaker: "Agent",
          message:
            "Good afternoon! This is Jennifer from our product team. I understand you're interested in seeing a demo of our latest features. I'm excited to show you what we've been working on.",
          timestamp: "00:00",
        },
        {
          speaker: "Customer",
          message:
            "Hi Jennifer! Yes, I've heard great things about your new AI-powered analytics. I'm particularly interested in the real-time insights and predictive capabilities you mentioned.",
          timestamp: "00:07",
        },
        {
          speaker: "Agent",
          message:
            "Fantastic! Let me walk you through our AI analytics dashboard. First, I'll show you the real-time monitoring capabilities. As you can see, it tracks key performance indicators in real-time with customizable alerts.",
          timestamp: "00:15",
        },
        {
          speaker: "Customer",
          message:
            "This looks impressive! How accurate are the predictive analytics? We deal with a lot of seasonal data, so accuracy is crucial for our business planning.",
          timestamp: "00:23",
        },
        {
          speaker: "Agent",
          message:
            "Great question! Our AI model has a 94% accuracy rate for seasonal predictions, and it continuously learns from your data patterns. It can identify trends up to 6 months in advance and even account for external factors like market conditions.",
          timestamp: "00:31",
        },
        {
          speaker: "Customer",
          message:
            "That's exactly what we need! Can you show me how the reporting works? We need to generate reports for different stakeholders - executives, managers, and operational teams.",
          timestamp: "00:39",
        },
        {
          speaker: "Agent",
          message:
            "Absolutely! Our reporting system is very flexible. You can create role-based dashboards, automated reports that go out on schedule, and even interactive reports that stakeholders can drill down into. Let me show you the executive summary view.",
          timestamp: "00:47",
        },
        {
          speaker: "Customer",
          message:
            "This is perfect! I love how intuitive the interface is. What about data security? We handle sensitive customer information, so compliance is a top priority for us.",
          timestamp: "00:55",
        },
        {
          speaker: "Agent",
          message:
            "Security is our top priority too. We're SOC 2 Type II compliant, GDPR ready, and offer end-to-end encryption. We also provide audit trails and can integrate with your existing security infrastructure. Would you like me to show you our security dashboard?",
          timestamp: "01:03",
        },
        {
          speaker: "Customer",
          message:
            "Yes, please! This is very reassuring. I'm also curious about the integration capabilities. We use Salesforce and HubSpot extensively.",
          timestamp: "01:11",
        },
        {
          speaker: "Agent",
          message:
            "Perfect! We have native integrations with both Salesforce and HubSpot, plus over 200 other popular business tools. The integrations are seamless and can sync data in real-time. Let me demonstrate the Salesforce integration.",
          timestamp: "01:19",
        },
        {
          speaker: "Customer",
          message:
            "This is exactly what we've been looking for! The integration looks seamless. What about support? We'll need ongoing assistance as we implement this across our organization.",
          timestamp: "01:27",
        },
        {
          speaker: "Agent",
          message:
            "We provide 24/7 support with dedicated account managers, plus we have a comprehensive knowledge base and community forum. For enterprise clients like yourselves, we also offer priority support and custom training programs.",
          timestamp: "01:35",
        },
        {
          speaker: "Customer",
          message:
            "Excellent! I'm very impressed with what I've seen today. I'd like to discuss pricing and next steps with our team. When would be a good time to schedule a follow-up call?",
          timestamp: "01:43",
        },
        {
          speaker: "Agent",
          message:
            "I'm so glad you're excited about it! I can schedule a follow-up for next week. I'll also send you a detailed proposal with pricing options and implementation timeline. How does Wednesday at 3 PM work for you?",
          timestamp: "01:50",
        },
        {
          speaker: "Customer",
          message:
            "Wednesday at 3 PM works perfectly. Thank you for such a comprehensive demo, Jennifer. I'm looking forward to our next conversation.",
          timestamp: "01:57",
        },
        {
          speaker: "Agent",
          message:
            "Thank you! I'll send over the proposal and calendar invite today. I'm confident this solution will be a great fit for Northwind Sales. Talk to you soon!",
          timestamp: "02:04",
        },
      ],
      topics: [
        "product demo",
        "AI analytics",
        "real-time insights",
        "predictive capabilities",
        "reporting system",
        "data security",
        "compliance",
        "integration capabilities",
        "customer support",
        "pricing discussion",
        "implementation timeline",
        "stakeholder management",
      ],
      actionItems: [
        "Send detailed proposal with pricing options",
        "Schedule follow-up call for Wednesday 3 PM",
        "Prepare implementation timeline",
        "Send calendar invite for next meeting",
        "Provide security compliance documentation",
        "Arrange technical integration demo",
        "Set up trial environment for testing",
      ],
      metrics: {
        csat: 4.9,
        fcr: 90,
        aht: 124,
        responseTime: 7,
        transfers: 0,
        sentimentScore: 0.95,
        compliance: 92,
      },
    },
    t4: {
      // Delta Support - Issue Resolution
      conversation: [
        {
          speaker: "Agent",
          message:
            "Hello! This is David from technical support. I see you have ticket #4821 regarding the API integration issue. I've been reviewing the case details and I believe I can help resolve this for you today.",
          timestamp: "00:00",
        },
        {
          speaker: "Customer",
          message:
            "Hi David! Yes, we've been experiencing intermittent failures with our API calls, and it's affecting our production environment. This is quite urgent as it's impacting our customer-facing services.",
          timestamp: "00:08",
        },
        {
          speaker: "Agent",
          message:
            "I completely understand the urgency. Let me check the recent logs and error patterns. I can see there have been some timeout issues with the authentication endpoint. Can you tell me what specific error codes you're seeing?",
          timestamp: "00:16",
        },
        {
          speaker: "Customer",
          message:
            "We're getting 401 authentication errors and 504 gateway timeouts. The errors seem to happen randomly, but they're becoming more frequent. We've tried refreshing our API keys, but that didn't resolve it.",
          timestamp: "00:24",
        },
        {
          speaker: "Agent",
          message:
            "I see the issue now. There's a known bug in our authentication service that's causing intermittent failures. We've identified the root cause and deployed a hotfix this morning. Let me verify that the fix is active for your account.",
          timestamp: "00:32",
        },
        {
          speaker: "Customer",
          message:
            "That's great news! How can I verify that the fix is working? We need to test this in our staging environment first before pushing to production.",
          timestamp: "00:40",
        },
        {
          speaker: "Agent",
          message:
            "Perfect approach! I can see the fix is now active. I'll send you a test script that you can run in your staging environment to verify the authentication is working properly. The script will test various scenarios including the ones that were failing.",
          timestamp: "00:48",
        },
        {
          speaker: "Customer",
          message:
            "Excellent! Can you also provide some monitoring recommendations? We want to set up alerts to catch any future issues before they impact our customers.",
          timestamp: "00:56",
        },
        {
          speaker: "Agent",
          message:
            "Absolutely! I'll send you our recommended monitoring setup, including specific metrics to watch and alert thresholds. We also have a new health check endpoint that you can use for automated monitoring. I'll include that in the documentation.",
          timestamp: "01:04",
        },
        {
          speaker: "Customer",
          message:
            "That's very helpful. What about compensation for the downtime? We've had significant impact on our business operations over the past few days.",
          timestamp: "01:12",
        },
        {
          speaker: "Agent",
          message:
            "I completely understand the business impact, and I apologize for the inconvenience. I'm escalating this to our customer success team who will review your case and provide appropriate compensation. They'll be in touch within 24 hours with a resolution.",
          timestamp: "01:20",
        },
        {
          speaker: "Customer",
          message:
            "Thank you, David. I appreciate your quick response and the escalation. Is there anything else I should know about this fix or any preventive measures we should take?",
          timestamp: "01:28",
        },
        {
          speaker: "Agent",
          message:
            "The fix is comprehensive and should prevent this issue from recurring. However, I recommend updating to our latest SDK version when convenient, as it includes additional error handling improvements. I'll send you the upgrade guide as well.",
          timestamp: "01:36",
        },
        {
          speaker: "Customer",
          message:
            "Perfect! Thank you for resolving this so quickly. I'll test the fix in staging and let you know if we encounter any issues. I really appreciate your thorough approach to this problem.",
          timestamp: "01:44",
        },
        {
          speaker: "Agent",
          message:
            "You're very welcome! I'm glad I could help get this resolved quickly. I'll follow up with you tomorrow to ensure everything is working smoothly in production. If you need anything else, don't hesitate to reach out.",
          timestamp: "01:51",
        },
        {
          speaker: "Customer",
          message: "Thank you again, David. Have a great day!",
          timestamp: "01:58",
        },
        {
          speaker: "Agent",
          message: "You too! Take care!",
          timestamp: "02:01",
        },
      ],
      topics: [
        "technical support",
        "API integration",
        "authentication issues",
        "production problems",
        "bug resolution",
        "hotfix deployment",
        "monitoring setup",
        "compensation discussion",
        "customer impact",
        "preventive measures",
        "SDK updates",
        "follow-up procedures",
      ],
      actionItems: [
        "Send test script for staging environment verification",
        "Provide monitoring setup recommendations and documentation",
        "Escalate compensation request to customer success team",
        "Send SDK upgrade guide and latest version details",
        "Schedule follow-up call for tomorrow",
        "Update ticket status to resolved",
        "Create knowledge base article about this issue",
      ],
      metrics: {
        csat: 4.2,
        fcr: 100,
        aht: 121,
        responseTime: 15,
        transfers: 1,
        sentimentScore: 0.78,
        compliance: 85,
      },
    },
  };

  const sample = samples[chatId as keyof typeof samples] || samples.t1;
  const conversation = sample.conversation;
  const transcript = conversation
    .map((t) => `${t.speaker}: ${t.message}`)
    .join("\n");

  return {
    transcript,
    conversation,
    sentiment: { label: "positive", score: sample.metrics.sentimentScore },
    duration: sample.metrics.aht,
    topics: sample.topics,
    actionItems: sample.actionItems,
    metrics: sample.metrics,
    mode,
  };
}
