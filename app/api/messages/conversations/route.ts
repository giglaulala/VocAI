import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/requireUser";
import { asHttpError } from "@/lib/http/httpError";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    const supabaseAdmin = getSupabaseAdminClient();

    // Collect page_ids where this user is a member (but not the owner).
    const { data: memberships } = await supabaseAdmin
      .from("page_members")
      .select("page_id")
      .eq("user_id", user.id);

    const memberPageIds = (memberships || []).map((m) => m.page_id);

    // Build filter: own conversations OR conversations on member pages.
    const filter =
      memberPageIds.length > 0
        ? `user_id.eq.${user.id},page_id.in.(${memberPageIds.join(",")})`
        : `user_id.eq.${user.id}`;

    const { data, error } = await supabaseAdmin
      .from("conversations")
      .select(
        "id,user_id,page_id,sender_id,sender_name,avg_response_time_seconds,platform,last_message_at,created_at,connected_pages(page_name,platform)",
      )
      .or(filter)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json({ conversations: data || [] }, { status: 200 });
  } catch (err: any) {
    const http = asHttpError(err);
    return NextResponse.json(
      { error: err?.message || "Failed to load conversations" },
      { status: http?.status || 500 },
    );
  }
}
