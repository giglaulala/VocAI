# Messaging Dashboard Frontend Setup (Step 2)

## Route

- Open: `/messages`

## Authentication (important)

Your backend routes require:

- `Authorization: Bearer <SUPABASE_ACCESS_TOKEN>`

Right now, your project’s `/sign-in` page is **demo-only** (it doesn’t create a Supabase session).  
So the Messages UI supports two modes:

1) **Supabase session mode** (recommended, once you add real Supabase Auth later)  
2) **Manual token mode** (for immediate testing): paste a Supabase access token into the UI; it’s stored in browser `localStorage`.

## OAuth connect flow (Facebook/Instagram)

When you click **Connect Facebook/Instagram**:

- UI calls `GET /api/facebook/auth/connect` with `Accept: application/json`
- Backend returns `{ "url": "https://facebook.com/..." }`
- UI redirects to that URL
- Facebook redirects to your configured `FACEBOOK_OAUTH_REDIRECT_URI`
- Backend stores connected pages in Supabase

After connecting, come back to `/messages` and click **Refresh** under Connected pages.

## How to test

1) Ensure your Step 1 backend + env vars are configured.
2) Make sure Supabase tables exist (`supabase/migrations/20260215_facebook_messaging.sql`).
3) Run the app:

```bash
npm run dev
```

4) Open `/messages`
5) Paste a Supabase access token (until you add real sign-in) and click Connect.
6) Send a test message to your Page/IG and confirm it appears in Conversations.

## Customizing styling

All UI uses Tailwind classes consistent with the rest of the app:

- Components live in `components/messages/*`
- The main page is `app/messages/page.tsx`

