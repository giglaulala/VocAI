"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { useState } from "react";

export default function SignInPage(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Placeholder auth submit
      await new Promise((r) => setTimeout(r, 800));
      alert("Signed in (demo)");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Header />
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-md mx-auto bg-white border border-neutral-200 rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">
            Welcome back
          </h1>
          <p className="text-neutral-600 mb-6">Sign in to your account</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="text-sm text-neutral-600 mt-4">
            Don’t have an account?{" "}
            <Link href="/sign-up" className="text-primary-700 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
