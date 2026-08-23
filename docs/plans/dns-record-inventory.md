# DNS record inventory — source of truth for the Cloudflare zone import

Captured 2026-08-23 from the Route 53 console (openecualliance.org) and `dig`
against the authoritative R53 nameservers (oecua.org). This is the record-for-record
diff target required by master-plan amendment C2.

**Rule: every PRESERVE record below must exist in the Cloudflare zone, byte-identical,
before the NS flip. Mail records are the highest-risk class — losing one silently
breaks magic-link delivery or inbound mail.**

## openecualliance.org — Route 53 zone `Z0414493IDIAZ4XRMQD6` (9 records)

| Name | Type | Value | TTL | Action at cutover |
|---|---|---|---|---|
| `openecualliance.org` | A | `216.198.79.1` (Vercel) | 30 | **REPLACE** — proxied placeholder for the 301 redirect rule |
| `openecualliance.org` | MX | `10 inbound-smtp.us-east-1.amazonaws.com` | 30 | **PRESERVE** — SES inbound mail |
| `openecualliance.org` | NS | 4× awsdns | 172800 | not imported (CF supplies its own) |
| `openecualliance.org` | SOA | awsdns | 900 | not imported (CF supplies its own) |
| `_dmarc.openecualliance.org` | TXT | `"v=DMARC1; p=none;"` | 30 | **PRESERVE** |
| `resend._domainkey.openecualliance.org` | TXT | `"p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDOgn75HXDxezNA/bYJBctc+qwTYgbVdRru9ZMka0suL42JWWvq0FLMaa8ps3nZN5hbHA14O8Z5ypFo1bS9n+rNdyckoQEu8v6GgEEd8LasfmhdwsLzvA4lBiV5lHX2sebS7ywstVre5ThbqjwnG4ua8MR+Ae5zlGbGR6pPb8gwZQIDAQAB"` | 30 | **PRESERVE** — Resend DKIM |
| `send.openecualliance.org` | MX | `10 feedback-smtp.us-east-1.amazonses.com` | 30 | **PRESERVE** — Resend bounce handling |
| `send.openecualliance.org` | TXT | `"v=spf1 include:amazonses.com ~all"` | 30 | **PRESERVE** — Resend SPF |
| `www.openecualliance.org` | CNAME | `d60751f631ce6bfc.vercel-dns-017.com.` | 30 | **REPLACE** — proxied placeholder for the 301 redirect rule |

**Mail is live and load-bearing on this domain.** The site's magic-link emails send
from `no-reply@openecualliance.org` through Resend (verified: spike login emails
arrived from that address). Moving the *web* to oecua.org does not move the mail —
these five mail records stay on openecualliance.org permanently.

## oecua.org — Route 53 (4 records, no mail)

| Name | Type | Value | Action at cutover |
|---|---|---|---|
| `oecua.org` | A | `216.198.79.1` (Vercel) | **REPLACE** — Worker custom domain (this becomes the primary origin) |
| `www.oecua.org` | CNAME | `d60751f631ce6bfc.vercel-dns-017.com.` | **REPLACE** — proxied placeholder for the 301 redirect rule |
| `oecua.org` | NS / SOA | awsdns | not imported |

No MX, no TXT, no DKIM/SPF/DMARC. Nothing sends or receives mail on this domain.
If mail is ever wanted at `@oecua.org`, that is a new Resend domain setup, not a
migration step.

## Verification gate before the NS flip (both zones)

```bash
# every PRESERVE record must return identical values from the CF nameservers
dig +short MX openecualliance.org @<cf-ns>
dig +short TXT _dmarc.openecualliance.org @<cf-ns>
dig +short TXT resend._domainkey.openecualliance.org @<cf-ns>
dig +short MX send.openecualliance.org @<cf-ns>
dig +short TXT send.openecualliance.org @<cf-ns>
```

## Why the console listing was required (amendment C2, strengthened)

The Phase-0 baseline used `dig MX/TXT` at the **apex only** and concluded "no TXT
records, no SPF." That was wrong: DMARC lives at `_dmarc.`, and Resend's SPF and
bounce MX live at `send.` — a subdomain an apex sweep never touches. Four of the
five mail records were invisible to apex-level DNS probing. Cloudflare's automatic
zone scan has the same blind spot, which is exactly what C2 warns about.
