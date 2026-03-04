"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { EmptyState } from "./EmptyState";
import { ConnectionButton } from "./ConnectionButton";
import { ConnectedPages, fetchConnectedPages } from "./ConnectedPages";
import { PageInboxCards } from "./PageInboxCards";
import { ConversationsList } from "./ConversationsList";
import { ChatWindow } from "./ChatWindow";
import { AnalysisPanel, type ConversationAnalysis, type ConversationMetrics } from "./AnalysisPanel";
import { TeamStatsPanel } from "./TeamStatsPanel";
import { PlatformBadge } from "./PlatformBadge";
import { apiFetchJson } from "./api";
import type {
  ConnectedPage,
  Conversation,
  ConversationMessagesResponse,
  ConversationsResponse,
  Message,
  SendMessageResponse,
} from "./types";
import { useAccessToken } from "./useAccessToken";

export function MessagesDashboard() {
  const { loading: tokenLoading, token, source, setManualToken } = useAccessToken();

  const [pages, setPages] = useState<ConnectedPage[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);

  // Which page inbox is currently open. null = show page selection cards.
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<
    ConversationMessagesResponse["conversation"] | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const [analysis, setAnalysis] = useState<ConversationAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [metrics, setMetrics] = useState<ConversationMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  // Track which conversation has already been analyzed so polling doesn't re-trigger.
  const lastAnalyzedIdRef = useRef<string | null>(null);

  const selectedPage = useMemo(() => {
    if (!selectedConversation) return null;
    return (
      pages.find(
        (p) =>
          p.page_id === selectedConversation.page_id &&
          p.platform === selectedConversation.platform,
      ) || null
    );
  }, [pages, selectedConversation]);

  // Conversations filtered to the currently open page inbox.
  const filteredConversations = useMemo(() => {
    if (!selectedPageId) return conversations;
    return conversations.filter((c) => c.page_id === selectedPageId);
  }, [conversations, selectedPageId]);

  // The page object for the currently open inbox.
  const activePage = useMemo(
    () => pages.find((p) => p.page_id === selectedPageId) ?? null,
    [pages, selectedPageId],
  );

  async function reloadPages() {
    if (!token) return;
    setPagesLoading(true);
    setError(null);
    try {
      const res = await fetchConnectedPages(token);
      setPages(res.pages || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load connected pages");
    } finally {
      setPagesLoading(false);
    }
  }

  async function reloadConversations({ silent = false }: { silent?: boolean } = {}) {
    if (!token) return;
    if (!silent) {
      setConversationsLoading(true);
      setError(null);
    }
    try {
      const res = await apiFetchJson<ConversationsResponse>("/api/messages/conversations", {
        token,
        method: "GET",
      });
      setConversations(res.conversations || []);
    } catch (e: any) {
      if (!silent) setError(e?.message || "Failed to load conversations");
    } finally {
      if (!silent) setConversationsLoading(false);
    }
  }

  async function runAnalysis(msgs: Message[]) {
    const textMessages = msgs.filter((m) => m.text);
    if (textMessages.length === 0) return;

    const transcript = textMessages
      .map((m) => `${m.is_from_customer ? "Customer" : "Agent"}: ${m.text}`)
      .join("\n");

    // Run both calls concurrently.
    setAnalysisLoading(true);
    setMetricsLoading(true);
    setAnalysis(null);
    setMetrics(null);

    const insightsPromise = fetch("/api/analyze-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, language: "en" }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.analysis) setAnalysis(data.analysis);
      })
      .catch(() => {})
      .finally(() => setAnalysisLoading(false));

    const metricsPayload = textMessages.map((m) => ({
      timestamp: m.timestamp || m.created_at,
      sender: m.is_from_customer ? "customer" : "agent",
      text: m.text || "",
    }));

    const metricsPromise = fetch("/api/support-metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: metricsPayload }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.metrics) setMetrics(data.metrics);
      })
      .catch(() => {})
      .finally(() => setMetricsLoading(false));

    await Promise.all([insightsPromise, metricsPromise]);
  }

  async function loadConversation(conversationId: string, { silent = false }: { silent?: boolean } = {}) {
    if (!token) return;

    // Determine if this is a fresh selection (not a poll refresh).
    const isNewSelection = conversationId !== lastAnalyzedIdRef.current;

    if (isNewSelection) {
      // Clear stale analysis immediately when switching conversations.
      setAnalysis(null);
      setMetrics(null);
      setAnalysisLoading(false);
      setMetricsLoading(false);
    }

    if (!silent) {
      setSelectedConversationId(conversationId);
      setMessagesLoading(true);
      setError(null);
    }

    try {
      const res = await apiFetchJson<ConversationMessagesResponse>(
        `/api/messages/${conversationId}`,
        { token, method: "GET" },
      );
      setSelectedConversation(res.conversation);
      const msgs = res.messages || [];
      setMessages(msgs);
      const lastText = [...msgs]
        .reverse()
        .map((m) => (typeof m.text === "string" ? m.text.trim() : ""))
        .find((t) => t.length > 0);
      if (lastText) {
        setPreviews((p) => ({ ...p, [conversationId]: lastText.slice(0, 80) }));
      }

      // Run analysis only on first selection, not on every poll refresh.
      if (isNewSelection && msgs.length > 0) {
        lastAnalyzedIdRef.current = conversationId;
        void runAnalysis(msgs);
      }
    } catch (e: any) {
      if (!silent) setError(e?.message || "Failed to load messages");
    } finally {
      if (!silent) setMessagesLoading(false);
    }
  }

  async function sendMessage(text: string) {
    if (!token || !selectedConversationId) return;
    setSending(true);
    setError(null);

    // Optimistic insert
    const optimisticId = `optimistic:${Date.now()}`;
    const optimistic: Message = {
      id: optimisticId,
      message_id: optimisticId,
      sender_id: selectedConversation?.page_id || "me",
      text,
      platform: selectedConversation?.platform || "facebook",
      is_from_customer: false,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    setPreviews((p) => ({ ...p, [selectedConversationId]: text.slice(0, 80) }));

    try {
      const res = await apiFetchJson<SendMessageResponse>("/api/messages/send", {
        token,
        method: "POST",
        body: { conversationId: selectedConversationId, text },
      });
      setMessages((m) =>
        m.map((msg) =>
          msg.message_id === optimisticId ? { ...msg, message_id: res.messageId } : msg,
        ),
      );
      // Refresh conversations so ordering updates
      void reloadConversations({ silent: true });
    } catch (e: any) {
      // Rollback optimistic message
      setMessages((m) => m.filter((msg) => msg.message_id !== optimisticId));
      setError(e?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  // Initial loads + polling
  useEffect(() => {
    if (!token) return;
    void reloadPages();
    void reloadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const id = window.setInterval(() => {
      void reloadConversations({ silent: true });
    }, 10_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token || !selectedConversationId) return;
    const id = window.setInterval(() => {
      void loadConversation(selectedConversationId, { silent: true });
    }, 5_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, selectedConversationId]);

  // If selection disappears after refresh, clear selection
  useEffect(() => {
    if (!selectedConversationId) return;
    if (conversations.some((c) => c.id === selectedConversationId)) return;
    setSelectedConversationId(null);
    setSelectedConversation(null);
    setMessages([]);
  }, [conversations, selectedConversationId]);

  if (tokenLoading) {
    return <div className="text-sm text-neutral-600">Loading…</div>;
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon="connect"
          title="Sign in required"
          description="These APIs require a Supabase access token (Authorization: Bearer). Your current Sign In page is demo-only, so paste a token to test, or add Supabase Auth in a later step."
          action={
            <div className="w-full max-w-xl text-left">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Supabase access token (for testing)
              </label>
              <textarea
                rows={3}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200"
                placeholder="Paste JWT access token here…"
                onChange={(e) => setManualToken(e.target.value)}
              />
              <div className="mt-2 text-xs text-neutral-500">
                Stored locally in your browser. Remove it anytime by clearing the field.
              </div>
            </div>
          }
        />
      </div>
    );
  }

  // ── Screen 1: Page inbox selection ──────────────────────────────────────────
  if (!selectedPageId) {
    return (
      <div className="space-y-8">
        {/* Connection bar */}
        <div className="flex justify-end">
          <ConnectionButton token={token} onConnected={reloadPages} />
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {/* Page inbox cards */}
        {pagesLoading ? (
          <PageInboxCards pages={[]} conversations={[]} loading onSelect={() => {}} />
        ) : pages.length === 0 ? (
          <EmptyState
            icon="connect"
            title="No pages connected"
            description="Connect a Facebook Page (and optional Instagram business account) to start receiving messages."
          />
        ) : (
          <div className="space-y-3">
            <div className="text-base font-semibold text-neutral-700">Your inboxes</div>
            <PageInboxCards
              pages={pages}
              conversations={conversations}
              loading={conversationsLoading}
              onSelect={(pageId) => {
                setSelectedPageId(pageId);
                setSelectedConversationId(null);
                setSelectedConversation(null);
                setMessages([]);
              }}
            />
          </div>
        )}

        {/* Page management (disconnect etc.) */}
        {pages.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
              Manage pages
            </div>
            <ConnectedPages token={token} pages={pages} onReload={reloadPages} />
          </div>
        )}
      </div>
    );
  }

  // ── Screen 2: Conversations for the selected page ────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header: back button + page name */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setSelectedPageId(null);
            setSelectedConversationId(null);
            setSelectedConversation(null);
            setMessages([]);
          }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All inboxes
        </button>
        <span className="text-neutral-300">/</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-900">
            {activePage?.page_name || selectedPageId}
          </span>
          {activePage && <PlatformBadge platform={activePage.platform} />}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <ConversationsList
          conversations={filteredConversations}
          getPreview={(c) => previews[c.id] || null}
          selectedId={selectedConversationId}
          onSelect={loadConversation}
          loading={conversationsLoading}
        />

        <div className="space-y-3">
          {filteredConversations.length === 0 && !conversationsLoading ? (
            <EmptyState
              icon="messages"
              title="No conversations yet"
              description="Once your webhook is configured and a customer messages your Page/IG account, conversations will appear here."
            />
          ) : null}

          <ChatWindow
            conversation={
              selectedConversationId
                ? (filteredConversations.find((c) => c.id === selectedConversationId) || null)
                : null
            }
            page={selectedPage}
            messages={messages}
            loading={messagesLoading}
            sending={sending}
            onSend={sendMessage}
          />

          <AnalysisPanel
            analysis={analysis}
            analysisLoading={analysisLoading}
            metrics={metrics}
            metricsLoading={metricsLoading}
          />

          <TeamStatsPanel pageId={selectedPageId} token={token} />
        </div>
      </div>
    </div>
  );
}

