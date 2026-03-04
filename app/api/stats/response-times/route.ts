import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/requireUser";
import { asHttpError, HttpError } from "@/lib/http/httpError";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type EmployeeStat = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  role: string;
  reply_count: number;
  conversation_count: number;
  avg_response_time_seconds: number | null;
};

export type ResponseTimeStatsResponse = {
  page_id: string;
  stats: EmployeeStat[];
};

/**
 * GET /api/stats/response-times?pageId=xxx
 *
 * Returns per-employee response time stats for the given page.
 * Caller must be the page admin (owner) or a page member.
 */
export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    const url = new URL(req.url);
    const pageId = url.searchParams.get("pageId") ?? "";
    if (!pageId) throw new HttpError(400, "pageId query param is required");

    const supabaseAdmin = getSupabaseAdminClient();

    // Verify caller has access to this page.
    const { data: membership } = await supabaseAdmin
      .from("page_members")
      .select("role")
      .eq("page_id", pageId)
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: ownedPage } = await supabaseAdmin
      .from("connected_pages")
      .select("page_id")
      .eq("page_id", pageId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership && !ownedPage) throw new HttpError(403, "Access denied");

    // ── 1. Get all conversation IDs for this page ─────────────────────────────
    const { data: convRows } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .eq("page_id", pageId);

    const convIds = (convRows ?? []).map((c) => c.id);

    // ── 2. Get all agent messages with response times ─────────────────────────
    const agentMessages: Array<{
      replied_by: string;
      response_time_seconds: number;
      conversation_id: string;
    }> = [];

    if (convIds.length > 0) {
      const { data: msgRows } = await supabaseAdmin
        .from("messages")
        .select("replied_by,response_time_seconds,conversation_id")
        .in("conversation_id", convIds)
        .eq("is_from_customer", false)
        .not("replied_by", "is", null)
        .not("response_time_seconds", "is", null);

      for (const m of msgRows ?? []) {
        if (m.replied_by && m.response_time_seconds !== null) {
          agentMessages.push({
            replied_by: m.replied_by,
            response_time_seconds: m.response_time_seconds,
            conversation_id: m.conversation_id,
          });
        }
      }
    }

    // ── 3. Aggregate per employee ─────────────────────────────────────────────
    const byEmployee: Record<
      string,
      { times: number[]; convIds: Set<string> }
    > = {};

    for (const m of agentMessages) {
      if (!byEmployee[m.replied_by]) {
        byEmployee[m.replied_by] = { times: [], convIds: new Set() };
      }
      byEmployee[m.replied_by].times.push(m.response_time_seconds);
      byEmployee[m.replied_by].convIds.add(m.conversation_id);
    }

    // ── 4. Get all page members to include everyone (even with no data) ───────
    const { data: members } = await supabaseAdmin
      .from("page_members")
      .select("user_id,role")
      .eq("page_id", pageId);

    // ── 5. Enrich with auth user info and merge stats ─────────────────────────
    const stats: EmployeeStat[] = await Promise.all(
      (members ?? []).map(async (m) => {
        const { data: authData } = await supabaseAdmin.auth.admin.getUserById(
          m.user_id,
        );
        const authUser = authData?.user;
        const agg = byEmployee[m.user_id];

        return {
          user_id: m.user_id,
          role: m.role,
          email: authUser?.email ?? null,
          display_name:
            (authUser?.user_metadata?.full_name as string | undefined) ??
            (authUser?.user_metadata?.name as string | undefined) ??
            authUser?.email ??
            null,
          reply_count: agg?.times.length ?? 0,
          conversation_count: agg?.convIds.size ?? 0,
          avg_response_time_seconds:
            agg && agg.times.length > 0
              ? Math.round(
                  agg.times.reduce((s, t) => s + t, 0) / agg.times.length,
                )
              : null,
        };
      }),
    );

    // Sort: employees with data first, then by avg response time asc.
    stats.sort((a, b) => {
      if (a.avg_response_time_seconds === null) return 1;
      if (b.avg_response_time_seconds === null) return -1;
      return a.avg_response_time_seconds - b.avg_response_time_seconds;
    });

    return NextResponse.json({ page_id: pageId, stats }, { status: 200 });
  } catch (err: any) {
    const http = asHttpError(err);
    return NextResponse.json(
      { error: err?.message || "Failed to load stats" },
      { status: http?.status || 500 },
    );
  }
}
