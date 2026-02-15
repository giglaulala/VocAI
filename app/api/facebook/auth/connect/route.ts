import { NextResponse } from "next/server";
import crypto from "crypto";

import {
  getFacebookAppId,
  getFacebookAppSecret,
  getFacebookOAuthRedirectUri,
} from "@/lib/facebook/config";
import { createSignedOAuthState } from "@/lib/facebook/crypto";
import { requireUser } from "@/lib/auth/requireUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Meta may show "Invalid Scopes" for some permissions depending on your app setup,
// login product type (Facebook Login vs Facebook Login for Business), and access level.
// Keep a minimal default to avoid blocking the OAuth screen; you can override via env.
const DEFAULT_SCOPES = ["pages_messaging", "pages_manage_metadata", "pages_show_list"].join(",");

function getScopes(): string {
  return (process.env.FACEBOOK_OAUTH_SCOPES || DEFAULT_SCOPES).trim();
}

export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    const nonce = crypto.randomBytes(16).toString("hex");
    const payload = `${user.id}:${nonce}`;
    const state = createSignedOAuthState(getFacebookAppSecret(), payload);

    const redirectUri = getFacebookOAuthRedirectUri();
    const url = new URL("https://www.facebook.com/v21.0/dialog/oauth");
    url.searchParams.set("client_id", getFacebookAppId());
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("scope", getScopes());
    url.searchParams.set("response_type", "code");

    const acceptsJson = (req.headers.get("accept") || "").includes("application/json");
    if (acceptsJson) {
      return NextResponse.json({ url: url.toString() }, { status: 200 });
    }

    return NextResponse.redirect(url.toString(), { status: 302 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to start Facebook OAuth" },
      { status: 500 },
    );
  }
}

