import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/requireUser";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { asHttpError } from "@/lib/http/httpError";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    const supabaseAdmin = getSupabaseAdminClient();

    const { data, error } = await supabaseAdmin
      .from("connected_pages")
      .select("id,page_id,page_name,platform,created_at,updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json({ pages: data || [] }, { status: 200 });
  } catch (err: any) {
    const http = asHttpError(err);
    return NextResponse.json(
      { error: err?.message || "Failed to load pages" },
      { status: http?.status || 500 },
    );
  }
}

