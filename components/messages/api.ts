import type { ApiError } from "./types";

export async function apiFetchJson<T>(
  path: string,
  opts: {
    token: string;
    method?: "GET" | "POST";
    body?: unknown;
    acceptJson?: boolean;
  },
): Promise<T> {
  const res = await fetch(path, {
    method: opts.method || "GET",
    headers: {
      authorization: `Bearer ${opts.token}`,
      ...(opts.acceptJson ? { accept: "application/json" } : {}),
      ...(opts.body ? { "content-type": "application/json" } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const text = await res.text().catch(() => "");
  const json = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const apiError =
      json && typeof json === "object" && "error" in (json as any) && typeof (json as any).error === "string"
        ? ((json as ApiError).error as string)
        : null;
    const msg = String(apiError || text || `Request failed (${res.status})`);
    const err = new Error(msg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  // Some endpoints might respond with empty body (shouldn’t, but be safe)
  return (json ?? ({} as any)) as T;
}

function safeJsonParse(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

