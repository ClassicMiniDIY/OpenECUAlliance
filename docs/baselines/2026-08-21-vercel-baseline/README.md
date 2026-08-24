# Vercel platform baseline — 2026-08-21

Snapshot of production behavior on Vercel BEFORE any Cloudflare migration change.
The Phase 4 verification battery (`scripts/verify-cf-deploy.sh`) diffs against this.
Raw captures live in this directory:

- `hostname-headers.txt` — http/https × all 4 hostnames
- `redirect-behavior.txt` — path + query preservation through redirects
- `endpoints.txt`, `endpoints2.txt` — sitemap, API, assets, raw spec download, og-image, robots
- `pages-assets.txt` — canonical tags, `/_nuxt/` asset headers
- `dns-baseline.txt` — NS, A/CNAME, MX, TXT for both domains

## Hostname behavior matrix (must match after cutover, except where noted)

| Request | Status | Target / notes |
|---|---|---|
| `http://openecualliance.org/` | **308** | `https://openecualliance.org/` (http→https, Vercel platform) |
| `https://openecualliance.org/` | **307** | `https://www.openecualliance.org/` — apex→www is TEMPORARY (307), path + query preserved |
| `http://www.openecualliance.org/` | **308** | `https://www.openecualliance.org/` |
| `https://www.openecualliance.org/` | **200** | serves the site (`x-powered-by: Nuxt`) |
| `http://oecua.org/` | **308** | `https://oecua.org/` |
| `https://oecua.org/` | **307** | `https://www.oecua.org/` — NOT to openecualliance.org |
| `http://www.oecua.org/` | **308** | `https://www.oecua.org/` |
| `https://www.oecua.org/` | **200** | **full duplicate-content mirror of the site** |

- `strict-transport-security: max-age=63072000` on every https response (Vercel platform,
  set nowhere in the repo) — validates master-plan amendment C3 for this repo.
- Query strings ARE preserved through apex→www (verified: `/adapters?vendor=haltech&x=1`
  and `/spec?a=b`) and through http→https 308s — validates C4's preserve_query_string.
- Effective serving host is **www**; apex only redirects.

## SEO state (inconsistent today — canonical-fix input)

- **Every** page emits `<link rel="canonical" href="https://openecualliance.org">` — the
  bare apex homepage URL, on the homepage, adapter detail pages, AND the oecua.org mirror.
  The canonical target itself 307s to www. (The known global-canonical bug, live.)
- `sitemap.xml` lists **apex** URLs (`https://openecualliance.org/...`), 6 URLs, served
  from `site.url` which is the apex — while the site actually serves from www.
- `robots.txt`: `Disallow: /api/` + `/_nuxt/`, sitemap pointer to apex.
- Net: site serves at www, but canonicals + sitemap + site.url all say apex, joined only
  by a 307 (temporary) redirect. The primary-host question must be decided deliberately at
  cutover (see design doc).

## Header/caching baseline

| Path | cache-control | Notes |
|---|---|---|
| `/` (www, 200) | `public, max-age=0, must-revalidate` | `x-vercel-cache: MISS` |
| `/api/adapters` | `max-age=900` | no `s-maxage` → Vercel CDN does NOT cache (MISS); `defineCachedEventHandler` does the real 15-min caching in-process. ETag + last-modified present. |
| `/api/assets/logos/*.png` | `max-age=86400` | image/png |
| `/api/specs/adapters/[v]/[id]/raw` | `max-age=900` | `content-disposition: attachment; filename="aim-aim-xrk.adapter.yaml"` |
| `/og-image.png` | `public, max-age=0, must-revalidate` | static, `x-vercel-cache: HIT`, 377,986 bytes |
| `/robots.txt` | `public, max-age=0, must-revalidate` | HIT, age 366212 |
| `/_nuxt/*.js` | `public, max-age=31536000, immutable` | HIT |
| `/sitemap.xml` | `public, max-age=600` | `x-sitemap-*` debug headers from @nuxtjs/sitemap |

- API responses carry the middleware stack's headers: `x-ratelimit-*` (per-category
  limits), CORS `access-control-allow-origin: *` + `vary: Origin`, security headers
  (`x-frame-options`, `x-content-type-options`, `x-xss-protection`, CSP on errors).
- Quirk: `HEAD /api/adapters` → **404** with `x-security-warning: Suspicious pattern
  detected`; `GET` (same UA) → 200 with the same warning header but not blocked. The
  security middleware flags curl/HEAD; battery scripts must use GET and expect the
  warning header.

## DNS baseline

- NS: both domains on Route 53 (awsdns). Registered at Amazon Registrar.
- `openecualliance.org` apex A → `216.198.79.1` (Vercel); www CNAME →
  `d60751f631ce6bfc.vercel-dns-017.com` → 216.150.1.193 / 216.150.16.193.
- `oecua.org` apex A → `216.198.79.1`; www CNAME → same Vercel target.
- **MX on openecualliance.org: `10 inbound-smtp.us-east-1.amazonaws.com` (SES inbound
  email receiving) — must survive the zone import record-for-record (amendment C2).**
- No TXT records visible at either apex (no SPF — nothing sends mail from these domains).
- oecua.org: no MX, no TXT.
