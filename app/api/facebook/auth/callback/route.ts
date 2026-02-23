import { NextResponse } from "next/server";

import {
  getFacebookAppId,
  getFacebookAppSecret,
  getFacebookOAuthRedirectUri,
} from "@/lib/facebook/config";
import { verifySignedOAuthState } from "@/lib/facebook/crypto";
import { graphGet, graphPost } from "@/lib/facebook/graph";
import type {
  GraphMeAccountsResponse,
  GraphOAuthTokenResponse,
} from "@/lib/facebook/types";
import { asHttpError } from "@/lib/http/httpError";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state") || "";
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    if (error) {
      return NextResponse.json(
        { error: errorDescription || error },
        { status: 400 },
      );
    }

    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    const verified = verifySignedOAuthState(getFacebookAppSecret(), state);
    if (!verified.ok) {
      return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    }

    const [userId] = verified.payload.split(":");
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid state payload" },
        { status: 400 },
      );
    }

    // Exchange code for short-lived token.
    const short = await graphGet<GraphOAuthTokenResponse>(
      "/oauth/access_token",
      {
        client_id: getFacebookAppId(),
        client_secret: getFacebookAppSecret(),
        redirect_uri: getFacebookOAuthRedirectUri(),
        code,
      },
    );

    // Exchange for long-lived token.
    const long = await graphGet<GraphOAuthTokenResponse>(
      "/oauth/access_token",
      {
        grant_type: "fb_exchange_token",
        client_id: getFacebookAppId(),
        client_secret: getFacebookAppSecret(),
        fb_exchange_token: short.access_token,
      },
    );

    const userAccessToken = long.access_token;

    // Fetch Pages (+ IG business accounts).
    const accounts = await graphGet<GraphMeAccountsResponse>("/me/accounts", {
      access_token: userAccessToken,
      fields: "id,name,access_token,instagram_business_account{id,username}",
    });

    const supabaseAdmin = getSupabaseAdminClient();

    const connected: Array<{
      page_id: string;
      platform: string;
      page_name?: string;
    }> = [];

    for (const p of accounts.data || []) {
      if (!p?.id || !p?.access_token) continue;

      // Store Facebook Page.
      await supabaseAdmin.from("connected_pages").upsert(
        {
          user_id: userId,
          page_id: p.id,
          page_name: p.name || null,
          page_access_token: p.access_token,
          platform: "facebook",
        },
        { onConflict: "page_id" },
      );
      connected.push({
        page_id: p.id,
        platform: "facebook",
        page_name: p.name,
      });

      // After saving page to database...
      //
      // Subscribe to page webhooks
      try {
        await fetch(`https://graph.facebook.com/v21.0/${p.id}/subscribed_apps`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subscribed_fields:
              "messages,messaging_postbacks,message_deliveries,message_reads",
            access_token: p.access_token, // Use the page's access token
          }),
        });

        // eslint-disable-next-line no-console
        console.log(`✅ Subscribed to webhooks for page: ${p.name}`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(
          `❌ Failed to subscribe to webhooks for ${p.name}:`,
          error,
        );
        // Don't fail the whole flow - just log it
      }

      // Store Instagram Business Account (if present) using the same page token.
      if (p.instagram_business_account?.id) {
        const ig = p.instagram_business_account;
        await supabaseAdmin.from("connected_pages").upsert(
          {
            user_id: userId,
            page_id: ig.id,
            page_name: ig.username || p.name || null,
            page_access_token: p.access_token,
            platform: "instagram",
          },
          { onConflict: "page_id" },
        );
        connected.push({
          page_id: ig.id,
          platform: "instagram",
          page_name: ig.username,
        });
      }
    }

    // Redirect to a simple success page (or return JSON if you prefer).
    return NextResponse.json({ ok: true, connected }, { status: 200 });
  } catch (err: any) {
    const http = asHttpError(err);
    return NextResponse.json(
      { error: err?.message || "Facebook OAuth callback failed" },
      { status: http?.status || 500 },
    );
  }
}
