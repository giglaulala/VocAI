"use client";

import React from "react";
import Header from "@/components/Header";
import ChatDemo from "@/components/chat/ChatDemo";

export default function DemoPage(): JSX.Element {
  return (
    <main className="min-h-screen">
      <Header />
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">
            Chat Demo
          </h1>
          <p className="text-neutral-600 mb-6">
            Upload audio or generate a sample and see AI analysis in a chat-like
            interface.
          </p>
          <ChatDemo />
        </div>
      </section>
    </main>
  );
}
