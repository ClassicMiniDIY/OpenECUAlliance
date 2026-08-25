# OpenECUAlliance: Vercel → Cloudflare Workers migration (PATHFINDER)

Started 2026-08-21. Branch: `feature/cloudflare-workers-migration`.

## Role

This migration is the **pathfinder for the CMDIY platform migration**. The second
deliverable is knowledge: every phase writes findings back to the master plan's
"Pathfinder log — OpenECUAlliance (live)" section, tagged
`[validates|contradicts|new-gotcha]` and `[transfers-to-cmdiy: yes/no/partial]`.

- **Master plan (anchor, read fully before each phase, amendments are BINDING):**
  `docs/plans/2026-08-06-cloudflare-workers-migration.md` in the sibling
  `ClassicMiniDIY/classicminidiy` repository.
- **Baseline snapshot (Phase 4 battery diffs against this):**
  `docs/baselines/2026-08-21-vercel-baseline/`

## Scope facts (verified 2026-08-21)

- Nuxt 4 (compatibilityVersion 4), @nuxt/ui, @nuxtjs/supabase (cookie SSR auth),
  @nuxtjs/sitemap, @nuxt/icon (serverBundle heroicons+lucide, remote fetch for
  simple-icons/mdi), shiki, zod, yaml. Bun. No vercel.json, no @nuxt/image, no
  nuxt-og-image (static `/og-image.png`), no crons, no BotID.
- `nitro.serverAssets` bundles `../specs` (1.6 MB); `server/utils/filesystem.ts` reads it
  via `useStorage('assets')` — the core product surface; must be spike-verified on workerd.
- Middleware chain: `01.rateLimit` → `02.security` → `03.cors`. `ipDetection.ts` already
  prefers `cf-connecting-ip`; unguarded `event.node.req.socket.remoteAddress` at lines
  20 and 48 (undefined on workerd → Phase 1 fix).
- `runtimeConfig` rateLimit/security blocks read `process.env` in `nuxt.config.ts` —
  values bake at BUILD time. Deliberate decision + log entry required (master plan §2.7).
- Prerender: `crawlLinks: false`, 13 explicit routes. No host redirects in-app →
  `run_worker_first` not needed (validates amendment B1's reasoning).
- Domains: openecualliance.org + oecua.org (+www), Vercel project `open-ecu-alliance`,
  DNS Route 53, registrar Amazon (NS change only). MX (SES inbound) on
  openecualliance.org apex.
- Known bug fixed in Phase 1: global hardcoded `rel=canonical` → apex homepage on every
  page (`nuxt.config.ts` app.head).

## Decisions (Cole, 2026-08-23)

1. **Primary domain: `https://oecua.org` (apex).** Full domain change — all forms of
   openecualliance.org and www.oecua.org 301 to oecua.org at the zone edge from Phase 4.
   Accepted re-index risk: site traffic is minimal and auth was effectively broken.
2. **CMDIY constraint recorded:** no registrar transfers ever; NS changes are fine.
3. Workers Paid active. OECUA auth = its OWN Supabase project (`ljigjawvlwvciqvegptp`),
   email magic link only — NOT the shared CMDIY auth instance (ecosystem docs are wrong).

## Phase status

| Phase | Description | Status |
|---|---|---|
| Baseline | Vercel behavior snapshot committed to docs/baselines | **DONE 2026-08-21** |
| 0 | Go/no-go spike on workers.dev (bundle, serverAssets, shiki, supabase auth, sitemap, rate limiter, env timing) | **COMPLETE 2026-08-23 — GO.** All gates passed on the deployed worker incl. full magic-link PKCE login + SSR cookie session. Fixes found: module-scope setInterval (boot blocker), app-pinned auth redirect, html_handling. Bundle 3.54 MB gzip (Workers Paid). |
| 1 | Platform-neutral fixes on main via Vercel (canonical bug, remoteAddress guard, spike findings) | **COMPLETE 2026-08-23**, merged in PR #1. Per-page canonicals + oecua.org primary domain, current-origin auth redirects, CORS exact-match + public-read wildcard, remoteAddress guard, doc/route corrections. |
| 2 | wrangler.jsonc + GH Actions deploy + secrets + `wrangler dev` recipe (E4) + pinned wrangler/compat_date (E5) | **COMPLETE 2026-08-23.** `.github/workflows/deploy-cloudflare.yml` (build:cf → wrangler deploy → smoke), all 5 repo secrets set, wrangler pinned 4.125.0, `scripts/verify-cf-deploy.sh` green 24/24 on the deployed worker. Local recipe: `bun run build:cf && bunx wrangler dev` (wrangler auto-loads `.env`, no `.dev.vars` needed). |
| 3 | Zone prep | **COMPLETE 2026-08-24.** Zones created: oecua.org and openecualliance.org (both pending NS; CF nameservers `anita`/`thomas.ns.cloudflare.com`). All 7 records verified byte-exact incl. 5 mail records (dns-only, MX priority 10, DKIM 218 chars). Always Use HTTPS on, HSTS max-age=63072000 matching baseline, SSL strict — both zones. 301 redirect rules staged with preserve_query_string (www.oecua.org → apex; both openecualliance.org hosts → oecua.org). **All four web records set DNS-only so the NS flip is traffic-invisible — see the grey-cloud cutover below.** **HARD GATE (auth uses current origin): Supabase allowlist on project `ljigjawvlwvciqvegptp` must contain `https://oecua.org/**`, `https://www.oecua.org/**`, both openecualliance.org forms, and the workers.dev origin, and SITE_URL must become `https://oecua.org` — BEFORE traffic moves.** |
| 4a | NS flip at Amazon Registrar (DNS authority only, no traffic change) | **COMPLETE 2026-08-24 00:52-00:53 UTC.** Both zones active. Propagation ~1 h (registry delegation TTL 3600, not the assumed 48 h). Zero downtime, zero user-visible change. |
| 4b | Traffic switch to the Worker | **COMPLETE 2026-08-24.** Cert verified valid (`CN=oecua.org`, Google Trust Services, exp. Nov 22) before switching. Worker **route** `oecua.org/*` used instead of a custom domain — non-destructive (keeps the Vercel A record as origin fallback) and reversible by toggling `proxied`. Redirect hostnames proxied; all 301s verified with query preservation. Battery **36/37** (the one failure was a stale local resolver cache, disproved by forcing the edge IP). |
| 4c | Soak | **SKIPPED** by Cole's decision 2026-08-24 — C8 preconditions (NS on Cloudflare + battery green) were already met. |
| 5 | Decommission Vercel + docs | **COMPLETE 2026-08-24.** Vercel project deleted entirely; battery 37/37 after deletion; CI is Cloudflare-only. Done: Vercel origin dependency removed (apex origin is now a dummy; battery 37/37 with no Vercel fallback possible), CLAUDE.md rewritten with the Cloudflare deployment model and workerd constraints, Transferability report written into the master plan. Vercel project and all 4 domain attachments removed by Cole. |

## MIGRATION COMPLETE — 2026-08-24

`oecua.org` runs on Cloudflare Workers. Vercel is fully decommissioned for this repo.

- **Zero downtime** across the entire cutover; no rollback used.
- Battery **37/37** against production after Vercel deletion.
- Mail intact and proven by Google's own `Authentication-Results` (dkim/spf/dmarc all pass)
  on a message delivered after the nameserver change.
- Deploys: push to `main` → GitHub Actions → Workers. No other CI remains.
- **Rollback is no longer available via Vercel** — the project is deleted. Recovery from a
  bad deploy is `wrangler rollback` or reverting the commit; recovery from a Cloudflare-level
  problem means standing up a new origin.
- Findings written back to the CMDIY master plan as a Transferability report; the five that
  change cmdiy's plan are listed there, ranked by cost.

## Process rules (from the kickoff brief)

- Amendments > master-plan phase text; the kickoff prompt > both for OECUA specifics;
  contradictions become pathfinder-log entries, never silent local fixes.
- Baseline diffs, evidence before green, batch Cole-questions once per phase, never push
  main, stop before opening any PR.

## Verification status (2026-08-24 cutover)

**Verified with evidence:**
- Battery 36/37 against production; the single failure was local DNS cache, disproved by `curl --resolve` against the edge and by 1.1.1.1/8.8.8.8 both returning Cloudflare IPs.
- Mail fully intact — Google's own `Authentication-Results` on a message delivered *after* the NS change show `dkim=pass header.i=@openecualliance.org header.s=resend`, `spf=pass`, `dmarc=pass`. Strongest possible proof the Resend/SES records survived.
- TLS: `CN=oecua.org`, Google Trust Services, valid through 2026-11-22, verified before any traffic moved.
- Supabase redirect allowlist accepts `https://oecua.org/auth/callback` with the path intact (no silent SITE_URL fallback).
- Full magic-link PKCE login + SSR cookie session verified on the same Worker build via workers.dev (Phase 0).

**Production auth — delivery confirmed, one click outstanding:**
- Magic-link emails from `https://oecua.org` **are delivered**. Cole confirmed receiving three. An earlier draft of this doc claimed they were not — that was wrong, and worth recording as a methodology lesson: the Gmail MCP search index lagged far behind reality (it never surfaced messages Cole had already received and deleted, even minutes later, and even with `includeTrash`). **Do not use mailbox search as a delivery oracle.** Trust the SMTP/provider path and the `Authentication-Results` headers on a message actually in hand.
- `/login` and `/auth/callback` both serve 200 from the Worker on the production hostname; Supabase accepts `https://oecua.org/auth/callback` with the path intact; the identical magic-link PKCE flow and SSR cookie session were verified end-to-end on the same Worker build during Phase 0. The only untested variable is the hostname itself.
- Remaining: one human click of a delivered link to confirm the callback establishes a session on the production hostname.
