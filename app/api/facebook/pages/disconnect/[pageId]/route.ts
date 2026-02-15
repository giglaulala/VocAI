import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/requireUser";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { asHttpError } from "@/lib/http/httpError";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { pageId: string } },
) {
  try {
    const user = await requireUser(req);
    const pageId = params.pageId;
    if (!pageId) return NextResponse.json({ error: "Missing pageId" }, { status: 400 });

    const supabaseAdmin = getSupabaseAdminClient();
    const { error } = await supabaseAdmin
      .from("connected_pages")
      .delete()
      .eq("user_id", user.id)
      .eq("page_id", pageId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    const http = asHttpError(err);
    return NextResponse.json(
      { error: err?.message || "Failed to disconnect page" },
      { status: http?.status || 500 },
    );
  }
}

