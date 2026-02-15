import { NextResponse } from "next/server";

import { getFacebookAppSecret, getFacebookWebhookVerifyToken } from "@/lib/facebook/config";
import { verifyFacebookSignature256 } from "@/lib/facebook/crypto";
import type { FacebookWebhookPayload } from "@/lib/facebook/types";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === getFacebookWebhookVerifyToken() && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ ok: false }, { status: 403 });
}

export async function POST(req: Request) {
  const raw = Buffer.from(await req.arrayBuffer());
  const sigHeader = req.headers.get("x-hub-signature-256");

  const ok = verifyFacebookSignature256(getFacebookAppSecret(), raw, sigHeader);
  if (!ok) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let payload: FacebookWebhookPayload | null = null;
  try {
    payload = JSON.parse(raw.toString("utf8")) as FacebookWebhookPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Store best-effort; keep logic lightweight to return within 20s.
  try {
    await handleWebhook(payload);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("facebook webhook handler error", e);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

async function handleWebhook(payload: FacebookWebhookPayload | null) {
  if (!payload?.entry?.length) return;

  const supabaseAdmin = getSupabaseAdminClient();

  for (const entry of payload.entry) {
    const entryId = entry?.id;
    const events = Array.isArray(entry?.messaging) ? entry.messaging : [];
    if (!entryId || events.length === 0) continue;

    for (const ev of events) {
      const senderId = ev?.sender?.id;
      const recipientId = ev?.recipient?.id;
      const msg = ev?.message;
      const mid = msg?.mid;
      const tsMs = typeof ev?.timestamp === "number" ? ev.timestamp : Date.now();

      if (!senderId || (!recipientId && !entryId) || !msg) continue;

      const platform = payload?.object === "instagram" ? "instagram" : "facebook";
      const pageExternalId = platform === "instagram" ? entryId : recipientId || entryId;
      const isFromCustomer = senderId !== pageExternalId && !msg?.is_echo;

      const text =
        typeof msg?.text === "string"
          ? msg.text
          : msg?.attachments?.[0]?.payload?.url
            ? msg.attachments[0].payload.url
            : null;

      const messageId = mid || `${pageExternalId}:${senderId}:${tsMs}`;

      // Find owning user by connected page.
      const { data: page } = await supabaseAdmin
        .from("connected_pages")
        .select("user_id,page_id,platform")
        .eq("page_id", pageExternalId)
        .eq("platform", platform)
        .maybeSingle();

      if (!page?.user_id) continue;

      // Upsert conversation.
      const { data: conv, error: convErr } = await supabaseAdmin
        .from("conversations")
        .upsert(
          {
            user_id: page.user_id,
            page_id: pageExternalId,
            sender_id: senderId,
            platform,
            last_message_at: new Date(tsMs).toISOString(),
          },
          { onConflict: "page_id,sender_id" },
        )
        .select("id")
        .single();

      if (convErr || !conv?.id) continue;

      // Store message (idempotent).
      await supabaseAdmin
        .from("messages")
        .upsert(
          {
            conversation_id: conv.id,
            message_id: messageId,
            sender_id: senderId,
            text,
            platform,
            is_from_customer: isFromCustomer,
            timestamp: new Date(tsMs).toISOString(),
          },
          { onConflict: "message_id" },
        );

      // Update last_message_at.
      await supabaseAdmin
        .from("conversations")
        .update({ last_message_at: new Date(tsMs).toISOString() })
        .eq("id", conv.id);
    }
  }
}

