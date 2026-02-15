import crypto from "crypto";

export function verifyFacebookSignature256(
  appSecret: string,
  rawBody: Buffer,
  signatureHeader: string | null,
): boolean {
  // Header format: "sha256=<hex>"
  if (!signatureHeader) return false;
  const match = signatureHeader.match(/^sha256=([a-f0-9]{64})$/i);
  if (!match) return false;

  const expected = Buffer.from(match[1], "hex");
  const computedHex = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");
  const computed = Buffer.from(computedHex, "hex");

  // Timing-safe compare (length must match).
  if (expected.length !== computed.length) return false;
  return crypto.timingSafeEqual(expected, computed);
}

export function createSignedOAuthState(appSecret: string, payload: string): string {
  // payload should include userId + nonce; keep it small.
  const sig = crypto.createHmac("sha256", appSecret).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifySignedOAuthState(
  appSecret: string,
  state: string,
): { ok: true; payload: string } | { ok: false } {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const idx = decoded.lastIndexOf(".");
    if (idx <= 0) return { ok: false };
    const payload = decoded.slice(0, idx);
    const sig = decoded.slice(idx + 1);
    if (!/^[a-f0-9]{64}$/i.test(sig)) return { ok: false };

    const expected = crypto.createHmac("sha256", appSecret).update(payload).digest("hex");
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return { ok: false };
    if (!crypto.timingSafeEqual(a, b)) return { ok: false };
    return { ok: true, payload };
  } catch {
    return { ok: false };
  }
}

