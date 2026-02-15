import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/requireUser";
import { asHttpError, HttpError } from "@/lib/http/httpError";
import { graphPost } from "@/lib/facebook/graph";
import type { GraphSendMessageResponse } from "@/lib/facebook/types";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SendBody = {
  conversationId?: string;
  text?: string;
};

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const body = (await req.json().catch(() => ({}))) as SendBody;
    const conversationId = typeof body.conversationId === "string" ? body.conversationId : "";
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!conversationId) throw new HttpError(400, "conversationId is required");
    if (!text) throw new HttpError(400, "text is required");

    const supabaseAdmin = getSupabaseAdminClient();

    const { data: conv, error: convErr } = await supabaseAdmin
      .from("conversations")
      .select("id,user_id,page_id,sender_id,platform")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (convErr) return NextResponse.json({ error: convErr.message }, { status: 502 });
    if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: page, error: pageErr } = await supabaseAdmin
      .from("connected_pages")
      .select("page_id,page_access_token,platform")
      .eq("page_id", conv.page_id)
      .eq("platform", conv.platform)
      .eq("user_id", user.id)
      .maybeSingle();

    if (pageErr) return NextResponse.json({ error: pageErr.message }, { status: 502 });
    if (!page?.page_access_token) {
      return NextResponse.json(
        { error: "Page is not connected or missing access token" },
        { status: 409 },
      );
    }

    const accessToken = page.page_access_token as string;
    const platform = conv.platform === "instagram" ? "instagram" : "facebook";

    // Graph Send API:
    // - Messenger: POST /me/messages?access_token=...
    // - Instagram: POST /{ig-user-id}/messages?access_token=...
    const path = platform === "instagram" ? `/${page.page_id}/messages` : "/me/messages";

    const res = await graphPost<GraphSendMessageResponse>(path, { access_token: accessToken }, {
      messaging_type: "RESPONSE",
      recipient: { id: conv.sender_id },
      message: { text },
    });

    const messageId = res.message_id || `${page.page_id}:${conv.sender_id}:${Date.now()}`;

    // Store sent message.
    await supabaseAdmin.from("messages").insert({
      conversation_id: conv.id,
      message_id: messageId,
      sender_id: page.page_id,
      text,
      platform,
      is_from_customer: false,
      timestamp: new Date().toISOString(),
    });

    await supabaseAdmin
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conv.id);

    return NextResponse.json({ ok: true, messageId }, { status: 200 });
  } catch (err: any) {
    const http = asHttpError(err);
    return NextResponse.json(
      { error: err?.message || "Failed to send message" },
      { status: http?.status || 500 },
    );
  }
}

