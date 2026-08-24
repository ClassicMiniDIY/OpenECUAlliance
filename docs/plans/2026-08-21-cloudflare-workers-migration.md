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
| 3 | Zone prep | **COMPLETE 2026-08-24.** Zones created: oecua.org `6348deded5fd4a4826c54899a6272d09`, openecualliance.org `32972bed26c8a6f1d855fa9383982c2a` (both pending NS; CF nameservers `anita`/`thomas.ns.cloudflare.com`). All 7 records verified byte-exact incl. 5 mail records (dns-only, MX priority 10, DKIM 218 chars). Always Use HTTPS on, HSTS max-age=63072000 matching baseline, SSL strict — both zones. 301 redirect rules staged with preserve_query_string (www.oecua.org → apex; both openecualliance.org hosts → oecua.org). **All four web records set DNS-only so the NS flip is traffic-invisible — see the grey-cloud cutover below.** **HARD GATE (auth uses current origin): Supabase allowlist on project `ljigjawvlwvciqvegptp` must contain `https://oecua.org/**`, `https://www.oecua.org/**`, both openecualliance.org forms, and the workers.dev origin, and SITE_URL must become `https://oecua.org` — BEFORE traffic moves.** |
| 4a | **NS flip at Amazon Registrar** — with all web records DNS-only, this moves DNS authority only; traffic keeps flowing to Vercel on Vercel's TLS, so there is no certificate gap and no user-visible change. | awaiting Cole |
| 4b | **Traffic switch**, once the Universal SSL cert reports Active: attach the Worker custom domain for oecua.org, proxy the redirect hostnames so the 301 rules fire, then run `scripts/verify-cf-deploy.sh` + 1-week soak. Rollback is one record edit back to DNS-only Vercel. | after 4a |
| 5 | Remove domains from Vercel project (C8 gates), update CLAUDE.md, Transferability report | not started |

## Process rules (from the kickoff brief)

- Amendments > master-plan phase text; the kickoff prompt > both for OECUA specifics;
  contradictions become pathfinder-log entries, never silent local fixes.
- Baseline diffs, evidence before green, batch Cole-questions once per phase, never push
  main, stop before opening any PR.
