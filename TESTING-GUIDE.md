# Testing Guide (Webhook + OAuth + Messaging)

Use this after you’ve configured Meta (Facebook Developer Console).

---

## ✅ How to Test Webhook

### 1) Test webhook verification (no Meta required)

```bash
curl -i "https://YOUR_APP_URL/api/facebook/webhook?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=test123"
```

✅ Expected: response body is `test123`

If you see **403**, your verify token doesn’t match `.env.local`.

### 2) Test with Meta “Webhook” UI
In Meta App Dashboard:
- Go to **Webhooks**
- Pick the relevant object (Page/Messenger)
- Click **Edit** (or “Manage”)
- Use “Test” / “Send test” (labels vary)

You should see a log entry for your callback.

### 3) Check your server logs
If your dev server is running:
- Watch the terminal logs when Meta sends events

### 4) Confirm signature validation is working
Your backend verifies the header:
- `x-hub-signature-256: sha256=<hex>`

If Meta events are rejected with **401**, that means signature validation failed.

Reference: [Messenger webhooks](https://developers.facebook.com/docs/messenger-platform/webhooks/)

---

## ✅ How to Test OAuth Flow

### 1) Make sure these are set
In `.env.local`:
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `FACEBOOK_OAUTH_REDIRECT_URI`

And in Meta console:
- “Valid OAuth Redirect URIs” includes:
  - `https://YOUR_APP_URL/api/facebook/auth/callback`

### 2) Sign into your app
Go to:
- `/sign-in`

Then open:
- `/messages`

### 3) Click “Connect Facebook/Instagram”
This:
- calls `GET /api/facebook/auth/connect`
- redirects you to Facebook OAuth consent screen

✅ After approval, you should land on `/api/facebook/auth/callback` and see JSON like:
- `{ "ok": true, "connected": [...] }`

### 4) Verify pages stored
Back on `/messages`, click **Refresh** under “Connected pages”.

✅ You should see connected pages listed.

### Common OAuth test errors
- ❌ “Redirect URI mismatch”
  - Your Meta console redirect URI must match **exactly** (including https + path)
- ❌ “App not active” / “App in development mode”
  - Only admins/developers/testers can connect in Dev Mode

---

## ✅ How to Test Message Flow (end-to-end)

### 1) Ensure webhook is subscribed
Meta must call your webhook endpoint:
- `POST https://YOUR_APP_URL/api/facebook/webhook`

### 2) Send a test message
Send a message to:
- your Facebook Page (Messenger), or
- your Instagram business account (if connected)

### 3) Verify it appears in the dashboard
Open:
- `/messages`

✅ Expected:
- Conversation appears on the left (auto-refresh ~10s)
- Selecting it shows messages on the right

### 4) Reply from dashboard
Type a message and hit Enter or click Send.

✅ Expected:
- Your reply shows instantly (optimistic update)
- Customer receives it on Messenger/Instagram

### 5) Check Supabase data (quick SQL)
In Supabase SQL editor:

```sql
select * from connected_pages order by created_at desc limit 20;
select * from conversations order by last_message_at desc nulls last limit 20;
select * from messages order by created_at desc limit 50;
```

✅ Expected:
- `connected_pages` has the Page + tokens
- `conversations` has one row per (page_id, sender_id)
- `messages` has rows for inbound + outbound messages

