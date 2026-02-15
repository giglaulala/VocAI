# Quick Reference (Copy/Paste)

---

## ✅ URLs You Need

Replace `PUBLIC_URL` with:
- local tunnel: `https://YOUR-TUNNEL-DOMAIN`
- prod: `https://yourdomain.com`

### Webhook callback URL
```text
PUBLIC_URL/api/facebook/webhook
```

### OAuth redirect URI (Valid OAuth Redirect URI)
```text
PUBLIC_URL/api/facebook/auth/callback
```

### Privacy policy URL (required for Live / Review)
```text
PUBLIC_URL/privacy
```

### Terms of service URL (required for Live / Review)
```text
PUBLIC_URL/terms
```

### Data deletion callback URL (often required)
```text
PUBLIC_URL/data-deletion
```

---

## ✅ Credentials (and where used)

### In `.env.local`
- `FACEBOOK_APP_ID`
  - Used by OAuth start (`/api/facebook/auth/connect`)
- `FACEBOOK_APP_SECRET`
  - Used by webhook signature verification (`/api/facebook/webhook`)
  - Used by OAuth code exchange (`/api/facebook/auth/callback`)
- `FACEBOOK_WEBHOOK_VERIFY_TOKEN`
  - Used by webhook verification GET (`/api/facebook/webhook`)
- `FACEBOOK_OAUTH_REDIRECT_URI`
  - Must match the “Valid OAuth Redirect URI” in Meta console

---

## 🔁 Rotating secrets safely

### Rotate Facebook App Secret
1. Meta console → **Settings → Basic**
2. Reset **App Secret**
3. Update your hosting environment variables
4. Redeploy / restart server

### Rotate Verify Token
1. Change `FACEBOOK_WEBHOOK_VERIFY_TOKEN` in your env
2. Update the Verify Token in Meta Webhooks config
3. Restart server

---

## ✅ Important Links

- Meta apps dashboard: `https://developers.facebook.com/apps/`
- Webhooks docs: [Messenger Webhooks](https://developers.facebook.com/docs/messenger-platform/webhooks/)
- Webhooks getting started: [Graph API Webhooks](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/)
- Permissions: [Permissions Reference](https://developers.facebook.com/docs/permissions/)
- App review: [App Review submission](https://developers.facebook.com/docs/apps/review%23submit)

