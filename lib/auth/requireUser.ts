import { HttpError } from "@/lib/http/httpError";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type AuthenticatedUser = {
  id: string;
  email?: string;
};

export async function requireUser(req: Request): Promise<AuthenticatedUser> {
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();

  if (!token) {
    throw new HttpError(401, "Missing Authorization header (Bearer token)");
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    throw new HttpError(401, "Invalid or expired access token");
  }

  return { id: data.user.id, email: data.user.email ?? undefined };
}
