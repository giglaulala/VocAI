import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/requireUser";
import { asHttpError } from "@/lib/http/httpError";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } },
) {
  try {
    const user = await requireUser(req);
    const conversationId = params.conversationId;
    if (!conversationId) {
      return NextResponse.json(
        { error: "Missing conversationId" },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    const { data: conv, error: convErr } = await supabaseAdmin
      .from("conversations")
      .select("id,user_id,page_id,sender_id,platform")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (convErr) {
      return NextResponse.json({ error: convErr.message }, { status: 502 });
    }
    if (!conv) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: messages, error } = await supabaseAdmin
      .from("messages")
      .select(
        "id,message_id,sender_id,text,platform,is_from_customer,timestamp,created_at",
      )
      .eq("conversation_id", conv.id)
      .order("timestamp", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json(
      { conversation: conv, messages: messages || [] },
      { status: 200 },
    );
  } catch (err: any) {
    const http = asHttpError(err);
    return NextResponse.json(
      { error: err?.message || "Failed to load messages" },
      { status: http?.status || 500 },
    );
  }
}
