import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/requireUser";
import { asHttpError, HttpError } from "@/lib/http/httpError";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── DELETE /api/pages/[pageId]/members/[userId] ───────────────────────────────
// Removes a member from the page. Caller must be page admin, or removing themselves.

export async function DELETE(
  req: Request,
  { params }: { params: { pageId: string; userId: string } },
) {
  try {
    const user = await requireUser(req);
    const { pageId, userId } = params;
    if (!pageId || !userId) throw new HttpError(400, "Missing pageId or userId");

    const supabaseAdmin = getSupabaseAdminClient();

    const isAdmin = !!(
      await supabaseAdmin
        .from("connected_pages")
        .select("page_id")
        .eq("page_id", pageId)
        .eq("user_id", user.id)
        .maybeSingle()
    ).data;

    // Allow if caller is admin OR is removing themselves.
    if (!isAdmin && user.id !== userId) {
      throw new HttpError(403, "Only page admins can remove members");
    }

    // Prevent the page owner (admin) from being removed.
    const { data: target } = await supabaseAdmin
      .from("page_members")
      .select("role")
      .eq("page_id", pageId)
      .eq("user_id", userId)
      .maybeSingle();

    if (target?.role === "admin") {
      throw new HttpError(400, "The page admin cannot be removed");
    }

    const { error } = await supabaseAdmin
      .from("page_members")
      .delete()
      .eq("page_id", pageId)
      .eq("user_id", userId);

    if (error) throw new HttpError(502, error.message);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    const http = asHttpError(err);
    return NextResponse.json(
      { error: err?.message || "Failed to remove member" },
      { status: http?.status || 500 },
    );
  }
}
