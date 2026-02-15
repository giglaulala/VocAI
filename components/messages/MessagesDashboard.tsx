"use client";

import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "./EmptyState";
import { ConnectionButton } from "./ConnectionButton";
import { ConnectedPages, fetchConnectedPages } from "./ConnectedPages";
import { ConversationsList } from "./ConversationsList";
import { ChatWindow } from "./ChatWindow";
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

  async function reloadConversations() {
    if (!token) return;
    setConversationsLoading(true);
    setError(null);
    try {
      const res = await apiFetchJson<ConversationsResponse>("/api/messages/conversations", {
        token,
        method: "GET",
      });
      setConversations(res.conversations || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load conversations");
    } finally {
      setConversationsLoading(false);
    }
  }

  async function loadConversation(conversationId: string) {
    if (!token) return;
    setSelectedConversationId(conversationId);
    setMessagesLoading(true);
    setError(null);
    try {
      const res = await apiFetchJson<ConversationMessagesResponse>(
        `/api/messages/${conversationId}`,
        { token, method: "GET" },
      );
      setSelectedConversation(res.conversation);
      setMessages(res.messages || []);
      const lastText = [...(res.messages || [])]
        .reverse()
        .map((m) => (typeof m.text === "string" ? m.text.trim() : ""))
        .find((t) => t.length > 0);
      if (lastText) {
        setPreviews((p) => ({ ...p, [conversationId]: lastText.slice(0, 80) }));
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load messages");
    } finally {
      setMessagesLoading(false);
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
      void reloadConversations();
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
      void reloadConversations();
    }, 10_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!token || !selectedConversationId) return;
    const id = window.setInterval(() => {
      void loadConversation(selectedConversationId);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
      <div className="space-y-4">
        <div className="rounded-2xl border border-primary-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-neutral-900">Connection</div>
              <div className="text-xs text-neutral-500">
                Auth token source: {source === "supabase" ? "Supabase session" : "Manual (dev)"}
              </div>
            </div>
          </div>
          <div className="mt-3">
            <ConnectionButton token={token} onConnected={() => {}} />
          </div>
        </div>

        <ConnectedPages token={token} pages={pages} onReload={reloadPages} />

        {pagesLoading ? (
          <div className="text-sm text-neutral-600">Loading pages…</div>
        ) : pages.length === 0 ? (
          <EmptyState
            icon="connect"
            title="No pages connected"
            description="Connect a Facebook Page (and optional Instagram business account) to start receiving messages."
          />
        ) : null}

        <ConversationsList
          conversations={conversations}
          getPreview={(c) => previews[c.id] || null}
          selectedId={selectedConversationId}
          onSelect={loadConversation}
          loading={conversationsLoading}
        />
      </div>

      <div className="space-y-3">
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {conversations.length === 0 && !conversationsLoading ? (
          <EmptyState
            icon="messages"
            title="No conversations yet"
            description="Once your webhook is configured and a customer messages your Page/IG account, conversations will appear here."
          />
        ) : null}

        <ChatWindow
          conversation={
            selectedConversationId
              ? (conversations.find((c) => c.id === selectedConversationId) || null)
              : null
          }
          page={selectedPage}
          messages={messages}
          loading={messagesLoading}
          sending={sending}
          onSend={sendMessage}
        />
      </div>
    </div>
  );
}

