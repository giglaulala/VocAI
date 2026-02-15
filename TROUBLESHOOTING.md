# Troubleshooting (Facebook/Instagram Messaging)

---

## ✅ Webhook Issues

### “Webhook verification failed”
**Symptoms**
- Meta shows verification failed when saving Callback URL
- Your endpoint returns anything other than the challenge string

**Fix (step-by-step)**
1. Confirm your webhook URL is public HTTPS:
   - ✅ `https://YOUR_APP_URL/api/facebook/webhook`
   - ❌ `http://localhost:3000/api/facebook/webhook`
2. Confirm verify token matches:
   - Meta “Verify Token” field must equal `.env.local` `FACEBOOK_WEBHOOK_VERIFY_TOKEN`
3. Run this manual test:

```bash
curl -i "https://YOUR_APP_URL/api/facebook/webhook?hub.mode=subscribe&hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=test123"
```

Expected: body is `test123`.

### “Invalid signature” / 401 from webhook POST
**Cause**
- Your server rejects `x-hub-signature-256`

**Fix checklist**
- ✅ Ensure `FACEBOOK_APP_SECRET` matches the app you’re testing
- ✅ Ensure your tunnel/proxy does **not** modify the request body
- ✅ Confirm your server verifies **raw** request bytes (your backend does)

Docs: [Messenger webhooks](https://developers.facebook.com/docs/messenger-platform/webhooks/)

### “Callback URL not working”
**Fix checklist**
- ✅ URL returns **200** and is reachable from the internet
- ✅ HTTPS certificate is valid
- ✅ No auth wall (basic auth / cloudflare block / login page)
- ✅ Your server is running and listening

### “Not receiving webhook events”
**Fix checklist**
- ✅ Webhook subscribed to correct fields (`messages`, `message_reads`, etc.)
- ✅ The Page is connected and your app is **subscribed/installed** on the Page
- ✅ You can see deliveries in Meta Webhooks logs
- ✅ You are messaging the correct Page/IG business account

---

## ✅ OAuth Issues

### “Redirect URI mismatch”
**Cause**
- Meta requires the redirect URI to match exactly

**Fix**
1. In Meta console:
   - Facebook Login → Settings
   - Add “Valid OAuth Redirect URIs”
2. Add the exact URI:

```text
https://YOUR_APP_URL/api/facebook/auth/callback
```

Common mistakes:
- missing `https://`
- missing `/api/facebook/auth/callback`
- using `localhost` instead of tunnel/prod

### “Invalid OAuth token”
**Fix checklist**
- ✅ App ID/Secret correct
- ✅ Server clock correct (rare, but can affect tokens)
- ✅ You’re using the same app in Meta and `.env.local`
- ✅ Try rotating/refreshing by reconnecting the account

### “Permission denied”
**Fix checklist**
- ✅ Your user is an admin/developer/tester in Dev Mode
- ✅ Requested permissions exist and are allowed for your app
- ✅ App review / advanced access approved if required

### “Can’t connect page”
**Fix checklist**
- ✅ You have admin role on the Page
- ✅ You accepted all requested permissions in the consent screen
- ✅ Page is not restricted by business settings

---

## ✅ Message Sending Issues

### “Page not found”
**Fix**
- Ensure the connected page exists in `connected_pages`
- Ensure you’re using the correct platform (facebook vs instagram)

### “Invalid access token”
**Fix**
- Reconnect via OAuth (gets fresh tokens)
- Ensure tokens are stored (check `connected_pages.page_access_token`)
- If token was revoked, you must re-authorize

### “Message not delivered”
**Fix checklist**
- ✅ Messaging is allowed for the Page/IG account
- ✅ You are replying within the allowed window (Meta policy)
- ✅ Webhook is receiving messages (so you know IDs are correct)

### “Rate limit exceeded” (429)
**Fix**
- Implement retry with backoff
- Avoid polling the Graph API excessively (webhooks are preferred)

---

## ✅ General Issues

### Dev mode vs Live mode confusion
- In Dev Mode, only roles/testers can authorize
- In Live Mode, the public can authorize (assuming permissions approved)

### Test users not working
Checklist:
- Ensure test user is added under Roles/Test Users
- Ensure test user has access to the Page/IG business account (or use a test Page)

### Business verification stuck / App review rejected
Common causes:
- Missing Privacy Policy / Terms URLs
- Asking for permissions not used in product
- No screencast or unclear reproduction steps for reviewers

Helpful docs:
- [Permissions reference](https://developers.facebook.com/docs/permissions/)
- [App Review submission](https://developers.facebook.com/docs/apps/review%23submit)
- [Page Messaging feature review](https://developers.facebook.com/docs/graph-api/reference/page/messaging_feature_review/)

