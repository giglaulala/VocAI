"use client";

import { useState } from "react";
import { PlugZap } from "lucide-react";

import { apiFetchJson } from "./api";
import type { OAuthConnectResponse } from "./types";

export function ConnectionButton({
  token,
  disabled,
  onConnected,
}: {
  token: string;
  disabled?: boolean;
  onConnected?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetchJson<OAuthConnectResponse>("/api/facebook/auth/connect", {
        token,
        method: "GET",
        acceptJson: true,
      });
      onConnected?.();
      window.location.assign(data.url);
    } catch (e: any) {
      setError(e?.message || "Failed to start Facebook connection");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 transition-colors"
      >
        <PlugZap className="w-4 h-4" />
        {loading ? "Connecting..." : "Connect Facebook/Instagram"}
      </button>
      {error ? <div className="mt-2 text-sm text-rose-600">{error}</div> : null}
    </div>
  );
}

