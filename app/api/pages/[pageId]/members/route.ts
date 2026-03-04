import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/requireUser";
import { asHttpError, HttpError } from "@/lib/http/httpError";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── Helpers ──────────────────────────────────────────────────────────────────

async function isPageAdmin(
  supabaseAdmin: ReturnType<typeof getSupabaseAdminClient>,
  pageId: string,
  userId: string,
): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("connected_pages")
    .select("page_id")
    .eq("page_id", pageId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

// ── GET /api/pages/[pageId]/members ──────────────────────────────────────────
// Returns all members of the page. Caller must be admin or member.

export async function GET(
  req: Request,
  { params }: { params: { pageId: string } },
) {
  try {
    const user = await requireUser(req);
    const { pageId } = params;
    if (!pageId) throw new HttpError(400, "Missing pageId");

    const supabaseAdmin = getSupabaseAdminClient();

    // Verify caller has access to this page (owner or member).
    const admin = await isPageAdmin(supabaseAdmin, pageId, user.id);
    if (!admin) {
      const { data: membership } = await supabaseAdmin
        .from("page_members")
        .select("id")
        .eq("page_id", pageId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!membership) throw new HttpError(403, "Access denied");
    }

    const { data: rows, error } = await supabaseAdmin
      .from("page_members")
      .select("id,page_id,user_id,role,invited_by,created_at")
      .eq("page_id", pageId)
      .order("created_at", { ascending: true });

    if (error) throw new HttpError(502, error.message);

    // Enrich with email + display name from auth.users.
    const members = await Promise.all(
      (rows || []).map(async (row) => {
        const { data } = await supabaseAdmin.auth.admin.getUserById(row.user_id);
        return {
          ...row,
          email: data?.user?.email ?? null,
          display_name:
            (data?.user?.user_metadata?.full_name as string | undefined) ??
            (data?.user?.user_metadata?.name as string | undefined) ??
            data?.user?.email ??
            row.user_id,
        };
      }),
    );

    return NextResponse.json({ members }, { status: 200 });
  } catch (err: any) {
    const http = asHttpError(err);
    return NextResponse.json(
      { error: err?.message || "Failed to load members" },
      { status: http?.status || 500 },
    );
  }
}

// ── POST /api/pages/[pageId]/members ─────────────────────────────────────────
// Body: { email: string }  — invites a user by email. Caller must be page admin.

export async function POST(
  req: Request,
  { params }: { params: { pageId: string } },
) {
  try {
    const user = await requireUser(req);
    const { pageId } = params;
    if (!pageId) throw new HttpError(400, "Missing pageId");

    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email) throw new HttpError(400, "email is required");

    const supabaseAdmin = getSupabaseAdminClient();

    // Only page admins (owners) can invite.
    const admin = await isPageAdmin(supabaseAdmin, pageId, user.id);
    if (!admin) throw new HttpError(403, "Only page admins can invite members");

    // Find target user by email.
    const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) throw new HttpError(502, listErr.message);

    const target = (listData?.users ?? []).find(
      (u) => u.email?.toLowerCase() === email,
    );
    if (!target) {
      throw new HttpError(404, "No account found with that email address");
    }
    if (target.id === user.id) {
      throw new HttpError(400, "You are already a member of this page");
    }

    // Upsert member record.
    const { data: member, error: upsertErr } = await supabaseAdmin
      .from("page_members")
      .upsert(
        { page_id: pageId, user_id: target.id, role: "member", invited_by: user.id },
        { onConflict: "page_id,user_id" },
      )
      .select("id,page_id,user_id,role,invited_by,created_at")
      .single();

    if (upsertErr) throw new HttpError(502, upsertErr.message);

    return NextResponse.json(
      {
        member: {
          ...member,
          email: target.email ?? null,
          display_name:
            (target.user_metadata?.full_name as string | undefined) ??
            (target.user_metadata?.name as string | undefined) ??
            target.email ??
            target.id,
        },
      },
      { status: 201 },
    );
  } catch (err: any) {
    const http = asHttpError(err);
    return NextResponse.json(
      { error: err?.message || "Failed to add member" },
      { status: http?.status || 500 },
    );
  }
}
