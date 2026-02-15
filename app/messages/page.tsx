"use client";

import Header from "@/components/Header";
import { MessagesDashboard } from "@/components/messages/MessagesDashboard";

export default function MessagesPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <section className="pt-24 pb-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900">
              Messages
            </h1>
            <p className="text-neutral-600 mt-2">
              Facebook & Instagram customer conversations.
            </p>
          </div>

          <MessagesDashboard />
        </div>
      </section>
    </main>
  );
}

