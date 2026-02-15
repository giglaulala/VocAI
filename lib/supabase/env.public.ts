export function getSupabaseUrl(): string {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  if (!url) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }
  // Common misconfig: pasting the dashboard URL instead of the API URL.
  if (url.includes("supabase.com/dashboard")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must be the Supabase API URL (https://<project-ref>.supabase.co), not a dashboard URL.",
    );
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must start with http:// or https://");
  }
  if (!url.includes(".supabase.co")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL should look like https://<project-ref>.supabase.co",
    );
  }
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  if (!key) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return key;
}

