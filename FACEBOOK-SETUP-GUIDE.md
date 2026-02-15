# Facebook Developer Console Setup Guide (Step 3)

This guide configures Meta (Facebook) so your **Next.js + Supabase** messaging integration works end-to-end.

> ⚠️ **Keep secrets secret**
> - ✅ `FACEBOOK_APP_SECRET` must stay server-only (never in browser code).
> - ✅ `FACEBOOK_WEBHOOK_VERIFY_TOKEN` can be any random string.
> - ✅ Your webhook endpoint must be **public HTTPS** (Meta cannot call `localhost`).

---

## Section 1: Prerequisites ✅

### You need these before starting
1. A Facebook account with access to a **Facebook Page** you manage.
2. (Optional) An Instagram Professional account connected to that Page (for Instagram messaging).
3. Your app running locally and/or deployed.
4. Your API endpoints exist (already done in your project):
   - `GET /api/facebook/webhook`
   - `POST /api/facebook/webhook`
   - `GET /api/facebook/auth/connect`
   - `GET /api/facebook/auth/callback`

### Information to gather from your app
Pick a **PUBLIC_URL**:
- Local testing: use a tunnel like `https://YOUR-NGROK-URL.ngrok-free.app`
- Production: `https://yourdomain.com`

Now compute the exact URLs you’ll paste into Meta:
- **Webhook callback URL**: `PUBLIC_URL + /api/facebook/webhook`
- **OAuth redirect URI**: `PUBLIC_URL + /api/facebook/auth/callback`

Copy your verify token from `.env.local`:
- `FACEBOOK_WEBHOOK_VERIFY_TOKEN`

---

## Section 2: Create Facebook App ✅

1. Go to Meta for Developers App dashboard:
   - `https://developers.facebook.com/apps/`
2. Click **Create App**.
3. **App type**:
   - Choose **Business** in most cases (good default for Pages + messaging use cases).
4. You may be asked for **Business portfolio**:
   - If you have one, select it.
   - If not, create one (this helps later with app review / verification).
5. Finish creating the app. You should land on the **App Dashboard**.

You’ll see:
- A left sidebar with products
- A top header with app name
- A “Settings” section somewhere in the sidebar

Reference: Meta’s “Create an App” docs: [Create an App](https://developers.facebook.com/docs/development/create-an-app)

---

## Section 3: Add Required Products ✅

### Add Messenger
1. In the left sidebar, look for **Add Products** (or “Add product”).
2. Find **Messenger** and click **Set up**.

You should see Messenger settings pages and (often) Webhooks configuration links.
Reference: [Messenger Platform Overview](https://developers.facebook.com/docs/messenger-platform/overview/)

### Add Facebook Login
1. In **Add Products**, choose **Facebook Login** → **Set up**
2. Select **Web** as the platform (if prompted).

### Add Webhooks
1. In **Add Products**, choose **Webhooks** → **Set up**

Reference: [Webhooks getting started](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/)

### Add Instagram (optional, for IG messaging)
In many setups, Instagram messaging is configured through:
- connected Instagram Professional account + Page
- permissions + webhook subscription fields

Keep going with the webhook and OAuth steps below; those cover IG message events too.

---

## Section 4: Configure Webhooks ✅

### Where to find webhook settings
In the app dashboard sidebar:
- Go to **Webhooks**
  - or **Messenger → Webhooks**

You should see:
- A panel to add a **Callback URL**
- A field for **Verify Token**
- A “Verify and Save” button (or similar)

### Exact callback URL format
Callback URL must be:

```text
https://YOUR_PUBLIC_DOMAIN/api/facebook/webhook
```

Examples:
- `https://abc123.ngrok-free.app/api/facebook/webhook`
- `https://yourdomain.com/api/facebook/webhook`

### What to enter for verify token
Set **Verify Token** to exactly the same value as:
- `.env.local` → `FACEBOOK_WEBHOOK_VERIFY_TOKEN`

> 💡 Tip: Use a random string. It’s not a password, but it prevents random endpoints from “verifying” as yours.

### Which webhook fields to subscribe to
For Messenger (recommended):
- ✅ `messages`
- ✅ `messaging_postbacks`
- ✅ `message_deliveries`
- ✅ `message_reads`

References:
- [messages webhooks](https://developers.facebook.com/docs/messenger-platform/webhooks/)
- [messaging_postbacks](https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messaging_postbacks/)
- [message_deliveries](https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/message-deliveries/)
- [message_reads](https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/message-reads/)

For Instagram messaging, Meta may show fields like:
- ✅ `instagram_messages`

### How webhook verification works (what Meta calls your server with)
Meta sends:

```text
GET /api/facebook/webhook?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
```

Your server must:
1. Check `hub.verify_token` matches your verify token
2. Respond with the raw `hub.challenge` string

### Test webhook verification (copy/paste)

```bash
curl -i "https://YOUR_APP_URL/api/facebook/webhook?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=test123"
```

✅ Expected response body:

```text
test123
```

### Troubleshooting common webhook errors
- ❌ **“Webhook verification failed”**
  - Your endpoint didn’t return the exact challenge string
  - Verify token mismatch
  - Your URL isn’t publicly reachable (no HTTPS / tunnel down)
- ❌ **403/Forbidden**
  - Verify token mismatch
- ❌ **Timeout**
  - Your server didn’t respond quickly enough
  - Tunnel is sleeping or blocked

---

## Section 5: Configure OAuth Settings ✅

### Where to configure OAuth
In the app dashboard sidebar:
- **Facebook Login → Settings**

You should see a section containing:
- “Valid OAuth Redirect URIs”
- Possibly “Client OAuth Settings”

### Exact redirect URI format
Add this as a **Valid OAuth Redirect URI**:

```text
https://YOUR_PUBLIC_DOMAIN/api/facebook/auth/callback
```

Local (tunnel) example:
- `https://abc123.ngrok-free.app/api/facebook/auth/callback`

### App domains to add
In **Settings → Basic** (or similar), there is usually an **App Domains** field.

Add the domain **without** protocol:
- `abc123.ngrok-free.app`
- `yourdomain.com`

Reference: [Basic Settings](https://developers.facebook.com/docs/development/create-an-app/app-dashboard/basic-settings/)

### Required URLs (Privacy Policy, Terms)
Meta often requires these before switching to Live or requesting permissions:
- Privacy Policy URL
- Terms of Service URL

If you don’t have them yet:
- Create simple pages in your app or host on a site builder
- Use stable HTTPS URLs (no `localhost`)

---

## Section 6: Get Credentials ✅

### Where to find App ID / App Secret
In the app dashboard sidebar:
- Go to **Settings → Basic**

You’ll see:
- **App ID**
- **App Secret** (click “Show”)

Set in `.env.local`:
- `FACEBOOK_APP_ID=...`
- `FACEBOOK_APP_SECRET=...`

> ⚠️ If you pasted App Secret anywhere public, rotate it in **Settings → Basic**.

### Test users and roles (for Development Mode)
In the sidebar:
- Go to **Roles** (or “App Roles” / “Users”)

Add:
- yourself as **Admin/Developer**
- optional **Testers** (people who can connect in Dev Mode)

---

## Section 7: Testing with Development Mode ✅

### How development mode works
In **Development mode**:
- Only **admins/developers/testers** can use your app for OAuth + permissions
- The app won’t be publicly usable

### Who can test
✅ Can test:
- Admins
- Developers
- Testers
- Test users you create

❌ Cannot test:
- random public users (until app is Live + permissions approved)

---

## Section 8: Permissions & App Review ✅

Your integration requests permissions like:
- `pages_messaging`
- `pages_manage_metadata`
- `pages_read_engagement`
- `pages_show_list`
- `instagram_basic`
- `instagram_manage_messages`

### Which permissions need App Review (typical)
⚠️ In most real-world cases, **Advanced Access** + App Review is needed when:
- you serve multiple businesses (tech provider scenario)
- you need messaging permissions in production for users/pages you don’t own

Reference:
- [Permissions reference](https://developers.facebook.com/docs/permissions/)
- [App Review submission](https://developers.facebook.com/docs/apps/review%23submit)
- [Page Messaging feature review](https://developers.facebook.com/docs/graph-api/reference/page/messaging_feature_review/)

### What Meta typically wants for review
✅ You should prepare:
- A screencast showing OAuth connect + messages flowing
- Test credentials (test user / test page) for reviewers
- Privacy policy + terms
- Clear explanation of why each permission is needed

---

## Section 9: Production Checklist ✅

Before going Live:
1. ✅ App has Privacy Policy + Terms URLs
2. ✅ App domains correct
3. ✅ Valid OAuth redirect URIs set for production domain
4. ✅ Webhook URL is production HTTPS endpoint
5. ✅ Verify token matches prod environment variable
6. ✅ You can see webhook deliveries in Meta dashboard
7. ✅ (Likely) Business verification completed for Advanced Access
8. ✅ App Review approved for required permissions

