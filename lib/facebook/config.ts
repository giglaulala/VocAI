import { requiredEnv } from "@/lib/supabase/env.server";

export function getFacebookAppId(): string {
  return requiredEnv("FACEBOOK_APP_ID");
}

export function getFacebookAppSecret(): string {
  return requiredEnv("FACEBOOK_APP_SECRET");
}

export function getFacebookWebhookVerifyToken(): string {
  return requiredEnv("FACEBOOK_WEBHOOK_VERIFY_TOKEN");
}

export function getFacebookOAuthRedirectUri(): string {
  return requiredEnv("FACEBOOK_OAUTH_REDIRECT_URI");
}

export const FACEBOOK_GRAPH_VERSION = "v21.0";
