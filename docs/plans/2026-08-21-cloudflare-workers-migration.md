# OpenECUAlliance: Vercel → Cloudflare Workers migration (PATHFINDER)

Started 2026-08-21. Branch: `feature/cloudflare-workers-migration`.

## Role

This migration is the **pathfinder for the CMDIY platform migration**. The second
deliverable is knowledge: every phase writes findings back to the master plan's
"Pathfinder log — OpenECUAlliance (live)" section, tagged
`[validates|contradicts|new-gotcha]` and `[transfers-to-cmdiy: yes/no/partial]`.

- **Master plan (anchor, read fully before each phase, amendments are BINDING):**
  `/Users/colegentry/Development/classicminidiy/.claude/worktrees/trusting-franklin-942536/docs/plans/2026-08-06-cloudflare-workers-migration.md`
  (fallback: `classicminidiy/docs/plans/2026-08-06-cloudflare-workers-migration.md`)
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

## Open decisions (Cole)

1. **Primary host: apex vs www.** Today: serves at www; canonical/sitemap/site.url say
   apex; joined by a 307. Must be made consistent at cutover.
2. **oecua.org disposition.** Today `www.oecua.org` is a full 200 duplicate-content
   mirror. Redirect to primary at the zone edge, or keep mirroring?

## Phase status

| Phase | Description | Status |
|---|---|---|
| Baseline | Vercel behavior snapshot committed to docs/baselines | **DONE 2026-08-21** |
| 0 | Go/no-go spike on workers.dev (bundle, serverAssets, shiki, supabase auth, sitemap, rate limiter, env timing) | not started — awaiting Cole batch (CF account/token) |
| 1 | Platform-neutral fixes on main via Vercel (canonical bug, remoteAddress guard, spike findings) | not started |
| 2 | wrangler.jsonc + GH Actions deploy + secrets + `wrangler dev` recipe (E4) + pinned wrangler/compat_date (E5) | not started |
| 3 | Zone prep: BIND import from R53 (C2), record diff, DCV cert pre-provisioning (C1), Always Use HTTPS + HSTS (C3), proxied apex + preserve_query_string (C4), Supabase redirect-URL allowlist + workers.dev origin | not started |
| 4 | NS flip at Amazon Registrar + scripted battery (`scripts/verify-cf-deploy.sh`) + 1-week soak (C6: expect ~48 h dual-serve) | not started |
| 5 | Remove domains from Vercel project (C8 gates), update CLAUDE.md, Transferability report | not started |

## Process rules (from the kickoff brief)

- Amendments > master-plan phase text; the kickoff prompt > both for OECUA specifics;
  contradictions become pathfinder-log entries, never silent local fixes.
- Baseline diffs, evidence before green, batch Cole-questions once per phase, never push
  main, stop before opening any PR.
