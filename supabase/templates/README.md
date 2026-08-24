# Supabase Auth Email Templates

These are the canonical source for the transactional auth emails sent by the
OECUA Supabase project (`ljigjawvlwvciqvegptp`) through Resend.

**They are not deployed by CI.** Supabase stores auth email templates in project
config, not in the repo, so the dashboard is still the deploy target. These files
exist so the templates are reviewable, diffable, and not invisible.

## Deploying a change

1. Edit the file here and commit it.
2. Supabase Dashboard -> Project `Open ECU Alliance` -> Authentication ->
   Emails -> the matching template.
3. Paste the file contents into the Message body field and save.
4. Send yourself a real magic link from https://oecua.org/login and confirm the
   logo renders in Gmail.

| File | Dashboard template |
| --- | --- |
| `magic-link.html` | Magic Link |
| `confirm-signup.html` | Confirm signup |
| `email-change.html` | Change Email Address |
| `reset-password.html` | Reset Password |
| `invite.html` | Invite user |

Only Magic Link is exercised today — `/login` offers passwordless email sign-in
only. The others are kept in sync so a future flow does not ship the old broken
header.

## The logo rule (load-bearing)

The header image must be **a PNG served from `https://oecua.org`**. Both halves
matter:

- **PNG, not SVG.** Gmail and Outlook do not render SVG in email. The previous
  templates used `logo.svg`, which is a broken image for most recipients even
  when the file exists.
- **`oecua.org`, not `openecualliance.org`.** The legacy domain 301s to the
  primary at the Cloudflare zone edge. Email assets point at the primary
  directly.

The asset itself lives at `public/email-logo.png` (96x96, displayed at 48x48 for
retina) and is generated from `public/logo.svg`:

```bash
rsvg-convert -w 96 -h 96 public/logo.svg -o public/email-logo.png
```

## Why the old bug was silent

`https://oecua.org/logo.svg` did not 404. Any path that is not a real static
asset falls through to the Nuxt router, where `@nuxtjs/supabase` is configured
deny-by-default (`redirectOptions.exclude` in `nuxt.config.ts`), so it **302s to
`/login` and serves a 200 HTML page**. A missing image URL therefore looks alive
to curl. Verify email assets by content type, not status code:

```bash
curl -sI https://oecua.org/email-logo.png | grep -i content-type
```
