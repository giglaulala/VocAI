"use client";

import { useEffect, useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const MANUAL_TOKEN_KEY = "vocai_manual_supabase_access_token";

export function useAccessToken() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [source, setSource] = useState<"supabase" | "manual" | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      // 1) Try Supabase session
      const { data } = await supabase.auth.getSession();
      const sessionToken = data.session?.access_token ?? null;
      if (mounted && sessionToken) {
        setToken(sessionToken);
        setSource("supabase");
        setLoading(false);
        return;
      }

      // 2) Manual token (dev/testing)
      const manual =
        typeof window !== "undefined" ? window.localStorage.getItem(MANUAL_TOKEN_KEY) : null;
      if (mounted && manual) {
        setToken(manual);
        setSource("manual");
        setLoading(false);
        return;
      }

      if (mounted) setLoading(false);
    }

    void init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionToken = session?.access_token ?? null;
      if (sessionToken) {
        setToken(sessionToken);
        setSource("supabase");
      } else if (source !== "manual") {
        setToken(null);
        setSource(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  function setManualToken(next: string | null) {
    const v = next?.trim() || "";
    if (!v) {
      window.localStorage.removeItem(MANUAL_TOKEN_KEY);
      if (source === "manual") {
        setToken(null);
        setSource(null);
      }
      return;
    }
    window.localStorage.setItem(MANUAL_TOKEN_KEY, v);
    setToken(v);
    setSource("manual");
  }

  return { loading, token, source, setManualToken };
}

