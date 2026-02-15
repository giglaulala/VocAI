# Facebook/Instagram Messaging Backend Setup (Step 1)

This project uses **Next.js App Router** (`app/api/**`) and **Supabase** for storage.

## 1) Create / configure your Facebook App

In [Meta for Developers](https://developers.facebook.com/):

- Create an app (type: *Business* is typical).
- Add products:
  - **Facebook Login** (for OAuth)
  - **Webhooks**
- If you need Instagram messaging:
  - Ensure your Instagram account is a **Professional account** connected to a Facebook Page.

### App credentials you will need

- **App ID** → `FACEBOOK_APP_ID`
- **App Secret** → `FACEBOOK_APP_SECRET`

## 2) Configure environment variables

Copy the template:

```bash
cp .env.example .env.local
```

Fill in:

- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `FACEBOOK_WEBHOOK_VERIFY_TOKEN` (any random string you choose)
- `FACEBOOK_OAUTH_REDIRECT_URI`

For local dev, `FACEBOOK_OAUTH_REDIRECT_URI` should be:

- `http://localhost:3000/api/facebook/auth/callback`

## 3) Create the Supabase tables

Run the SQL migration in Supabase:

- File: `supabase/migrations/20260215_facebook_messaging.sql`
- Paste into **Supabase Dashboard → SQL Editor → New query → Run**

## 4) Configure the Webhook in Meta

### Webhook URL

For local testing you need a public tunnel (Meta can’t call localhost). Use one:

- `ngrok http 3000`
- `cloudflared tunnel --url http://localhost:3000`

Set the callback URL to:

- `https://<your-tunnel-domain>/api/facebook/webhook`

Set the verify token to exactly your:

- `FACEBOOK_WEBHOOK_VERIFY_TOKEN`

### Webhook fields

Subscribe to messaging fields appropriate for your app (e.g. messages / instagram_messages).

## 5) Test OAuth connect

This repo’s OAuth connect endpoint is:

- `GET /api/facebook/auth/connect`

It expects a **Supabase access token** in the header:

- `Authorization: Bearer <SUPABASE_ACCESS_TOKEN>`

If you call it with `Accept: application/json`, it returns `{ "url": "..." }` so your frontend can do `window.location = url`.

After you approve in Facebook, Meta will redirect to:

- `GET /api/facebook/auth/callback?code=...&state=...`

That callback stores Pages (and Instagram business accounts) into `connected_pages`.

## 6) Test webhook delivery

Once you’ve connected a Page and subscribed, send a message to your Page/IG account.

The webhook will:

- Verify `x-hub-signature-256` using `FACEBOOK_APP_SECRET`
- Find the matching record in `connected_pages`
- Upsert a row in `conversations`
- Insert a row in `messages`

## Routes created (backend)

- Webhooks
  - `GET /api/facebook/webhook`
  - `POST /api/facebook/webhook`
- OAuth
  - `GET /api/facebook/auth/connect`
  - `GET /api/facebook/auth/callback`
- Pages
  - `GET /api/facebook/pages`
  - `POST /api/facebook/pages/disconnect/:pageId`
- Messages
  - `GET /api/messages/conversations`
  - `GET /api/messages/:conversationId`
  - `POST /api/messages/send`

