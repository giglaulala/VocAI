import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VocAI - AI-Powered Call Analysis & Conversation Insights",
  description:
    "Transform your calls into actionable insights with AI-powered conversation analysis. Parse calls, extract conversations, and gain valuable business intelligence.",
  keywords:
    "AI, call analysis, conversation parsing, business intelligence, voice recognition, transcription",
  authors: [{ name: "VocAI Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
          {children}
        </div>
      </body>
    </html>
  );
}
