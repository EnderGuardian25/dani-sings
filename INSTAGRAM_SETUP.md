# Instagram Live Follower Count — Setup

The About section shows a live Instagram follower count via the official
**Instagram Graph API**. This needs two secrets: `IG_USER_ID` and
`IG_GRAPH_TOKEN`. Here's how to get them (~15 minutes, all free).

> If you skip this, the site still works — it falls back to an unofficial
> scraper, then to a static "10K+" number. Nothing breaks.

---

## Prerequisites (one-time)

1. **Creator/Business account** — `@danella.decruz` must be a Creator or
   Business account (it is). In the IG app: _Settings → Account type → Switch
   to professional account_.
2. **Link to a Facebook Page** — the Graph API requires the IG account to be
   connected to a Facebook Page.
   - Create a free Page at <https://www.facebook.com/pages/create> if you
     don't have one.
   - In the IG app: _Settings → Business tools and controls → connect a
     Facebook Page_.

---

## Step 1 — Create a Meta app

1. Go to <https://developers.facebook.com/apps/> → **Create app**.
2. Use case: **Other** → Type: **Business** → name it (e.g. "Danella Site").
3. In the app dashboard, add the **Instagram Graph API** product.

## Step 2 — Get an access token

1. Open the **Graph API Explorer**:
   <https://developers.facebook.com/tools/explorer/>
2. Top-right: select your app.
3. Click **Generate Access Token** and grant these permissions:
   - `instagram_basic`
   - `pages_show_list`
   - `business_management`
4. Copy the token it generates (this is a *short-lived* 1-hour token — we
   make it long-lived in Step 4).

## Step 3 — Find your Instagram account ID

In the Graph API Explorer, run these GET requests (paste each in the URL bar
after the `?`, with your token):

1. `me/accounts` → copy the Facebook Page `id` from the result.
2. `{page-id}?fields=instagram_business_account` → returns your
   **Instagram account id**. This is your `IG_USER_ID`.

Quick sanity check — this should return the follower count:

```
{IG_USER_ID}?fields=followers_count
```

## Step 4 — Make the token long-lived (60 days)

Short-lived tokens expire in 1 hour. Exchange it for a 60-day token:

```bash
curl "https://graph.facebook.com/v21.0/oauth/access_token\
?grant_type=fb_exchange_token\
&client_id=APP_ID\
&client_secret=APP_SECRET\
&fb_exchange_token=SHORT_LIVED_TOKEN"
```

`APP_ID` / `APP_SECRET` are in your app's _Settings → Basic_. The response's
`access_token` is your `IG_GRAPH_TOKEN`.

> **For a never-expiring token**, create a **System User** in
> [Business Settings](https://business.facebook.com/settings) → Users →
> System users → assign the app + Page → generate a token. System-user tokens
> don't expire, which is ideal for an always-on site.

---

## Step 5 — Add the secrets

**Local dev:** copy `.env.local.example` to `.env.local` and fill in:

```
IG_USER_ID=17841400000000000
IG_GRAPH_TOKEN=EAAG...your-long-token...
```

Restart the dev server so it picks them up.

**Production (Vercel):** Project → _Settings → Environment Variables_ → add
`IG_USER_ID` and `IG_GRAPH_TOKEN`, then redeploy.

---

## How it refreshes

The count is fetched server-side and cached for 24 hours
(`revalidate: 86400`), so it updates roughly once a day with no cron job. If
you used a 60-day token, set a calendar reminder to regenerate it — or use the
System User token below to avoid that entirely.

---

# Recommended: Non-expiring System User token

A **System User token** belongs to your business (not to your personal
Facebook login), so it **never expires** as long as the app and Page stay
assigned. This is the best choice for an always-on site — set it once and
forget it. It replaces Steps 2 & 4 above; you still need the Meta app (Step 1)
and your `IG_USER_ID` (Step 3).

> You need a **Meta Business Portfolio** (formerly "Business Manager"). If you
> don't have one, create it free at <https://business.facebook.com/> →
> _Create account_ before starting.

### A. Attach your app and Page to the business

1. Go to **Business Settings**: <https://business.facebook.com/settings>
2. Left sidebar → **Accounts → Apps**. Click **Add → Connect an app ID**, and
   enter the App ID from your Meta app (Step 1). _(If "Add" is greyed out, make
   sure you're an admin of the business.)_
3. Left sidebar → **Accounts → Pages**. Confirm your Facebook Page (the one
   linked to `@danella.decruz`) is listed. If not, **Add → Add a Page**.

### B. Create the System User

1. Left sidebar → **Users → System users**.
2. Click **Add**.
3. Name it something clear, e.g. `danella-site-token`.
4. Role: **Admin** (simplest) or **Employee** — either works for read-only
   follower data. Click **Create system user**.

### C. Give the System User access to the Page + App

1. With the new system user selected, click **Assign assets**.
2. Choose **Pages** → select your Facebook Page → toggle on **Full control**
   (or at minimum _View performance_). Click **Save changes**.
3. Click **Assign assets** again → choose **Apps** → select your Meta app →
   toggle on **Full control** (or _Manage app_). **Save changes**.

> If a needed asset doesn't appear, it isn't connected to the business yet —
> go back to section **A** and add it.

### D. Generate the token

1. Still on the system user, click **Generate new token**.
2. Select your **app** from the dropdown.
3. **Token expiration: Never** (this is the key setting).
4. Tick these permissions:
   - `instagram_basic`
   - `pages_show_list`
   - `pages_read_engagement`
   - `business_management`
5. Click **Generate token** → **copy it immediately** (it's shown only once).
   This is your `IG_GRAPH_TOKEN`.

### E. Verify it works

Paste this into the Graph API Explorer (or a browser), swapping in your values:

```
https://graph.facebook.com/v21.0/{IG_USER_ID}?fields=followers_count&access_token={IG_GRAPH_TOKEN}
```

A response like `{"followers_count": 12345, "id": "..."}` means you're done.

### F. Save the secrets

Same as Step 5 above — put `IG_USER_ID` and the new `IG_GRAPH_TOKEN` into
`.env.local` (local) or Vercel env vars (production), then restart / redeploy.

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| `followers_count` missing from response | IG account isn't Creator/Business, or isn't linked to the Page. Re-check Prerequisites. |
| `(#100) … nonexisting field` | You queried a Facebook Page ID, not the **Instagram** account ID. Use the `instagram_business_account` id from Step 3. |
| `(#190) access token … expired` | A user token expired. Use the System User token (above) — it won't. |
| `(#10) requires permission` | Missing scope. Regenerate the token with `instagram_basic` + `pages_read_engagement`. |
| Count shows but never changes | Working as intended — it's cached 24h. Force a redeploy to refresh sooner. |
| Site shows static `10K+` | Env vars not loaded. Confirm names are exactly `IG_USER_ID` / `IG_GRAPH_TOKEN` and the server was restarted. |
