import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseHealthcheckToken } from "@/lib/supabase/env.server";

export async function GET(req: Request) {
  const expectedToken = getSupabaseHealthcheckToken();
  if (!expectedToken) {
    return NextResponse.json(
      { ok: false, error: "SUPABASE_HEALTHCHECK_TOKEN is not configured" },
      { status: 500 },
    );
  }

  const providedToken = req.headers.get("x-health-token");
  if (providedToken !== expectedToken) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    sampleSize: data.users?.length ?? 0,
  });
}
