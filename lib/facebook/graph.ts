import { HttpError } from "@/lib/http/httpError";
import { FACEBOOK_GRAPH_VERSION } from "./config";

type GraphError = {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
};

function graphUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`https://graph.facebook.com/${FACEBOOK_GRAPH_VERSION}${cleanPath}`);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined) return;
    url.searchParams.set(k, String(v));
  });
  return url.toString();
}

async function parseGraphError(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  try {
    const json = JSON.parse(text) as GraphError;
    const msg = json?.error?.message;
    return msg || text || `Facebook API error (${res.status})`;
  } catch {
    return text || `Facebook API error (${res.status})`;
  }
}

export async function graphGet<T>(
  path: string,
  params: Record<string, string | number | undefined>,
): Promise<T> {
  const url = graphUrl(path, params);
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    const msg = await parseGraphError(res);
    throw new HttpError(res.status === 429 ? 429 : 502, msg, "FACEBOOK_GRAPH_ERROR");
  }
  return (await res.json()) as T;
}

export async function graphPost<T>(
  path: string,
  params: Record<string, string | number | undefined>,
  body?: unknown,
): Promise<T> {
  const url = graphUrl(path, params);
  const res = await fetch(url, {
    method: "POST",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const msg = await parseGraphError(res);
    throw new HttpError(res.status === 429 ? 429 : 502, msg, "FACEBOOK_GRAPH_ERROR");
  }
  return (await res.json()) as T;
}

