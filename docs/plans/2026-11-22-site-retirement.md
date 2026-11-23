# OpenECU Alliance retirement and teardown

**Date:** 2026-11-22
**Decision:** retire oecua.org, the OpenECU Alliance brand, and every integration it offered.
**Status:** plan approved, not started.

---

## 1. Why

The site launched 2026-01-05. Measured 2026-11-22:

| Signal | Value |
|---|---|
| Auth signups | 13 |
| Signups that signed in more than once | 3 (one of them is Cole) |
| Completed profiles | 3 |
| Community 3D model uploads | 0 (`model_files` = 0 rows) |
| 3D models in the library | 8, all MakerWorld links Cole seeded himself on 2026-01-07 |
| Likes / comments / ratings / downloads / reports | 0 / 0 / 0 / 0 / 0 |
| GitHub stars / forks / watchers | 6 / 1 / 0 |
| GitHub issues (all time) | 0 |
| External pull requests | 0 (17 by Cole, 2 by Dependabot) |
| External contributors | 0 |
| Search Console property | none — the site was never added |

**No user-generated content exists.** Every row in the database was written by Cole or is an
empty counter. Nothing a third party created is lost by deleting the project, and nothing was
paid for, so there is no refund or data-portability obligation.

The community layer — accounts, profiles, the 3D model library, comments, likes, ratings,
moderation queue, reports — was built and used by nobody. That is the part being deleted.

### What is actually worth keeping

The spec corpus. 10 log adapters, 12 CAN broadcast protocols, 466 canonical channels in
`specs/channels.yaml` (2951 lines), the generated `specs/SPECIFICATION.md` (756 lines), and
the validator that gates them. This includes the BMW reverse-engineering work (MS42, MS43,
MS4x, E8x/E9x) with its `disputed:` annotations. It is the only artefact here with standing
value, and UltraLog already consumes it.

---

## 2. Decisions taken

| Question | Decision |
|---|---|
| Spec corpus | **Move into the UltraLog repository** as the single source of truth. Delete the API tier. |
| Domains | **301 every web hostname on both zones to ultralog.co**, keep them until they expire. Auto-renew off at the registrar. |
| The 13 signups | **Silent delete.** No notice. No content exists and nothing was paid for. |
| OECUA Supabase project (`ljigjawvlwvciqvegptp`) | **Dump to `_archive/`, then delete the project.** |

---

## 3. What exists today (teardown inventory)

### Cloudflare
- Worker script `open-ecu-alliance` (account `CLOUDFLARE_ACCOUNT_ID` in `.env`).
- Worker **route** `oecua.org/*` — not a custom domain. The apex A record is a proxied
  placeholder that exists only so the route can intercept; the origin is never reached.
- Single Redirects at the zone edge: `openecualliance.org` → `oecua.org`, `www` of both → apex.
- Zones: `oecua.org` and `openecualliance.org`, both on Cloudflare nameservers
  (`anita`/`thomas.ns.cloudflare.com`), verified by `dig` 2026-11-22.

### DNS — live state
```
oecua.org            A 104.21.80.4 / 172.67.172.85 (proxied)   www → 301 apex
                     no MX, no TXT, no DKIM, no DMARC
openecualliance.org  A 104.21.89.220 / 172.67.165.54 (proxied) www → 301 oecua.org
                     MX 10 inbound-smtp.us-east-1.amazonaws.com   ← SES inbound, LIVE
                     _dmarc TXT "v=DMARC1; p=none;"               ← LIVE
                     resend._domainkey TXT p=MIGf...              ← Resend DKIM, LIVE
                     send. MX 10 feedback-smtp.us-east-1.amazonses.com
                     send. TXT "v=spf1 include:amazonses.com ~all"
```

**`openecualliance.org` carries live mail.** Five records (apex MX, `_dmarc`, Resend DKIM,
`send.` MX, `send.` SPF) are mail, not web. The web teardown must not touch them. They can
stay in place at zero cost until the domain expires — see step 7.

### Supabase (project `ljigjawvlwvciqvegptp`, OECUA's own project, NOT the shared CMDIY instance)
- 10 public tables: `profiles`, `models`, `model_files`, `model_images`, `model_likes`,
  `model_comments`, `model_ratings`, `model_downloads`, `moderation_queue`, `model_reports`.
- 3 storage buckets, all public: `model-images` (10 MB limit), `avatars` (5 MB),
  `model-files` (50 MB).
- 13 `auth.users`. Magic-link only. No edge functions (`supabase/functions` does not exist).
- Auth email templates live in project config, not the repo; the repo copies are in
  `supabase/templates/`. They die with the project.
- `supabase/migrations/20260107192804_remote_schema.sql` is **0 bytes** — the schema was
  never captured in the repo. The dump in step 4 is the only record there will be.

### GitHub
- `ClassicMiniDIY/OpenECUAlliance`, public, 4.9 MB, not archived.
- Ruleset 21418103 "main protection" (PR required, 0 approvals, `update` rule — only Cole can
  merge, via `gh pr merge --admin`). Ruleset 27169820 "main: CI must pass" requires the
  `build` check.
- Workflows: `ci.yml`, `deploy-cloudflare.yml`. Repo secrets `CLOUDFLARE_API_TOKEN`,
  `CLOUDFLARE_ACCOUNT_ID`, `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SECRET_KEY`.
- An inert `copilot-pull-request-reviewer` dynamic workflow (cannot be deleted via API; last
  ran 2026-09-07).
- `ClassicMiniDIY/OECUASpecs` — already archived, read-only, and **still load-bearing**: see
  the UltraLog finding below.

### Downstream consumers
1. **`ultralog-site`** — `server/utils/ecus.ts` fetches `https://oecua.org/api/adapters` and
   links ECU pages to `https://oecua.org/adapters/<vendor>/<id>`. The fetch runs at build.
   `reportMiss(..., { failInCi: false })` means an OECUA outage **warns and continues** — so
   killing the API does not fail the deploy, it silently drops the adapter channel section
   from every ECU page. This must be cut *before* the site goes down (step 2), not after.
2. **`UltraLog`** — `src/adapters/api.rs` hits `https://openecualliance.org/api/*` at runtime
   on a background refresh. `src/adapters/registry.rs` falls back API → disk cache → embedded,
   and the embedded tier is always available, so the app keeps working. Only log noise.
3. **`UltraLog` build** — `build.rs` downloads 18 YAML files from
   `raw.githubusercontent.com/ClassicMiniDIY/OECUASpecs/main/` into `spec/OECUASpecs/`, which
   is **gitignored and untracked**. `registry.rs` then `include_str!`s them. A clean clone of
   UltraLog cannot build without network access to an archived repo. UltraLog embeds 9
   adapters and 9 protocols; OpenECUAlliance has 10 and 12. UltraLog is already a release
   behind. Step 1 fixes all of this.

### Nothing to clean up
No social accounts, no Discord, no Search Console property, no analytics (PostHog is not
installed on this site), no S3 bucket, no newsletter, no paid integrations, no edge functions.

---

## 4. Teardown order

The gates matter. Specs are rescued before anything is deleted; consumers are cut before the
origin dies; the database is dumped before the project is deleted.

---

### Step 1 — Move the specs into UltraLog — **DONE 2026-11-22**

Branch `feature/own-the-spec-corpus` in `UltraLog`, off `origin/main`. What landed:

- `spec/openecu/` is vendored and tracked: 10 adapters, 12 protocols, `channels.yaml`
  (466 channels), `SPECIFICATION.md`, 26 branding assets. 2.0 MB.
- `build.rs` downloads nothing. `spec/OECUASpecs/` is out of `.gitignore`.
- `registry.rs` embeds all 22 specs from `spec/openecu`, including the BMW adapter and
  the three BMW protocols UltraLog was missing — it was a release behind at 9 and 9.
- `tests/spec_corpus.rs` ports the validator: 4 tests, **0 errors, 27 warnings**. Both
  the baud-rate check and the registry-category check were mutation-tested to confirm
  they actually fail on a broken spec.
- The Channel Registry Contract and the BMW provenance note are in `UltraLog/CLAUDE.md`
  under "OpenECU spec corpus".
- `cargo fmt`, `cargo clippy -- -D warnings`, 1335 tests: clean.

Three things turned up that were not in the original plan:

1. **`to_canonical` was being silently dropped.** 36 channels declare it; UltraLog's
   `ChannelSpec` had no such field, so serde discarded it. `conversion` and
   `source_unit` have never been read either — **UltraLog applies no unit conversion at
   all** and displays raw log units. The field now deserializes and a test guards it,
   but nothing applies it. This is exactly the failure the Channel Registry Contract
   warns about. Needs its own change, verified against real logs.
2. **Source-name collisions resolve by array order.** `build_normalization_map` and
   `build_metadata_map` key one flat map on the lowercased `source_names` entry, so a
   name two adapters both claim resolves to whichever is LAST in `EMBEDDED_ADAPTERS`.
   54 source names get conflicting display names and **43 resolve to different canonical
   ids**: `"boost"` is `boost` or `mgp`; `"knock"` is `knock_level`, `knock_level_db` or
   `knock_retard`; `"fuel flow"` is `fuel_flow` (l/h) or `fuel_flow_mass` (g/s) — the two
   pairs the contract says must never be unified. Pre-existing; adding BMW exposed it by
   breaking `test_normalize_rpm`, the only test covering any of the 54. BMW is ordered
   first so the integration changed no existing mapping. The real fix is a per-adapter
   namespace. Documented in `UltraLog/CLAUDE.md`.
3. **`generate-spec-doc.ts` was not ported.** 214 lines of Bun that renders
   `SPECIFICATION.md` from `channels.yaml`, much of it hand-written prose — transcribing
   it into Rust risked silent divergence for a corpus that now changes rarely. Instead
   `SPECIFICATION.md`'s header says it can no longer be regenerated, and a test fails if
   its channel count, category count, or any canonical ID falls out of step with the
   registry. Mutation-tested.

The original step 1 instructions follow, for the record.

Branch: `feature/own-the-spec-corpus` in `UltraLog`, off `origin/main`.

1. Copy the corpus in, tracked this time:
   ```bash
   cd ~/Development/UltraLog
   git fetch origin && git checkout -b feature/own-the-spec-corpus origin/main
   rm -rf spec/OECUASpecs
   mkdir -p spec
   cp -R ~/Development/OpenECUAlliance/specs spec/openecu
   git add -f spec/openecu
   ```
   That is 10 adapters, 12 protocols, `channels.yaml`, `SPECIFICATION.md`, 26 branding assets.
   Drop the branding assets if the app does not render them.
2. Remove `spec/OECUASpecs/` from `.gitignore` (line 59) and its comment (line 58).
3. Delete from `build.rs`: the `ADAPTER_SPECS` and `PROTOCOL_SPECS` tables, `ensure_adapter_specs`,
   `ensure_protocol_specs`, `download_adapter_specs`, `download_specs`, and their calls. Keep the
   Windows resource block. Add `cargo:rerun-if-changed=spec/openecu`.
4. Repoint every `include_str!` in `src/adapters/registry.rs` from
   `../../spec/OECUASpecs/{adapters,protocols}/…` to `../../spec/openecu/{adapters,protocols}/…`.
5. Add the three adapters and protocols UltraLog does not yet embed (OECUA has 10 adapters and
   12 protocols against UltraLog's 9 and 9) to `EMBEDDED_ADAPTERS` / `EMBEDDED_PROTOCOLS`.
   The `registry.rs` embedded-spec tests assert every one deserializes — run them.
6. Port the validator. `scripts/validate-specs.ts` and `scripts/generate-spec-doc.ts` are Bun +
   zod; UltraLog has no Bun toolchain. Two options, in order of preference:
   - **Port to a Rust integration test** (`tests/spec_corpus.rs`) that walks `spec/openecu`,
     parses every file through the existing `AdapterSpec`/`ProtocolSpec` types, and asserts the
     registry checks: unknown channel IDs, category mismatches, missing `to_canonical`, duplicate
     or out-of-range CAN IDs, overlapping signals, signals that overflow their frame. This is the
     right home — the types are already there and `cargo test` already gates CI.
   - Copy the Bun scripts in as-is and add a Bun step to UltraLog's CI. Faster, but puts a JS
     toolchain in a Rust repo.

   The validator is not decoration: on its first run it found a signal overflowing the rusEFI
   status frame and an overlap in Haltech `0x477`. Do not drop it.
7. Carry the two load-bearing contracts from `OpenECUAlliance/CLAUDE.md` into
   `UltraLog/CLAUDE.md`, verbatim in substance:
   - **Channel Registry Contract** — `channels.yaml` is the source of truth; `SPECIFICATION.md`
     is generated, never hand-edited; `unit` describes the log file, not the ideal;
     `to_canonical` carries the conversion; `fuel_flow`/`fuel_flow_mass` and
     `knock_level`/`knock_level_db` were split, not converted, and must never be unified;
     20 aliases resolve but are deprecated; `disputed:` records a conflict in the vendor's own
     documentation and must never be used to silence one you could resolve.
   - The BMW provenance note: those specs come from community reverse engineering, not a
     manufacturer document, which is why several signals carry `disputed:`.
8. Verify, then open the PR:
   ```bash
   cargo fmt --all -- --check
   cargo clippy -- -D warnings
   cargo test
   git clone . /tmp/ultralog-clean-clone && cd /tmp/ultralog-clean-clone && cargo build   # must build offline
   ```

**Gate: this PR is merged and a clean clone builds with no network before step 2 begins.**

---

### Step 2 — Cut `ultralog-site` off the OECUA API

Branch: `fix/drop-oecua-dependency` in `ultralog-site`, off `origin/main`.

The channel data on `/ecus/<slug>` currently comes from `oecua.org/api/adapters` at build
time. Replace the source, do not delete the section — these pages are public and indexed.

1. In `server/utils/ecus.ts`: delete `OECUA_API` and `OECUA_SITE` and the fetch. Read the
   adapter YAML instead. Either vendor the handful of files the ECU pages need into
   `ultralog-site/data/adapters/`, or (better) have UltraLog's release publish the corpus as a
   release asset and fetch that — a tagged artefact, not a live site.
2. In `app/pages/ecus/[slug].vue:49`: the `<a :href="data.adapter.url">OpenECU Alliance … adapter</a>`
   link points at a site that will 301 to `ultralog.co`. Remove the link, or retarget it at
   the UltraLog repo's spec directory. Decide the user-facing wording: "OpenECU Alliance"
   should probably stop appearing on ultralog.co.
3. Keep `reportMiss` but flip the adapter source to `failInCi: true`. A vendored or
   release-asset source that goes missing is a build bug, not an upstream outage, and should
   fail loudly rather than ship blank sections.
4. Verify locally that every `/ecus/<slug>` page still renders its channel section, then deploy.

**Gate: `ultralog.co` is deployed and every ECU page shows its channels before step 5.**

---

### Step 3 — Remove UltraLog's runtime API tier

Branch: `chore/remove-oecua-api-tier` in `UltraLog`.

The fallback chain means this is not urgent for correctness, but leaving a background task
hammering a dead host is sloppy.

1. Delete `src/adapters/api.rs` and the `OECUA_API_BASE` constant.
2. Collapse the chain in `src/adapters/registry.rs` from API → cache → embedded to embedded
   only. Delete the background refresh, `RefreshStatus::` variants that only existed for it,
   and the disk cache in `src/adapters/cache.rs` (`oecua_specs` cache dir) if nothing else
   writes it.
3. Remove any UI that surfaces "checking for adapter updates" / refresh state.
4. Drop the HTTP dependency from `Cargo.toml` if nothing else uses it.
5. `cargo fmt --all -- --check && cargo clippy -- -D warnings && cargo test`.

Cheap alternative if you want to defer the refactor: keep the chain and point
`OECUA_API_BASE` at nothing, letting it fail fast. Not recommended — dead code with a dead
URL is worse than no code.

---

### Step 4 — Back up the Supabase project

Nothing is deleted in this step. The repo migration is 0 bytes, so this dump is the only
record of the schema that will exist.

```bash
mkdir -p ~/Development/_archive/oecua-supabase-2026-11-22
cd ~/Development/_archive/oecua-supabase-2026-11-22

# Schema + data. Get the connection string from the Supabase dashboard
# (Project Settings -> Database -> Connection string -> URI, session pooler).
pg_dump "$OECUA_DB_URL" --schema-only --no-owner --no-privileges > schema.sql
pg_dump "$OECUA_DB_URL" --data-only  --no-owner --no-privileges > data.sql

# Auth users (13 rows) — not in the public schema, so pg_dump above misses them.
curl -s "$SUPABASE_URL/auth/v1/admin/users?per_page=100" \
  -H "apikey: $SUPABASE_SECRET_KEY" -H "Authorization: Bearer $SUPABASE_SECRET_KEY" \
  > auth-users.json

# Storage buckets. All three are public, so a recursive fetch works; the Supabase CLI
# or `supabase storage cp -r` is cleaner if it is configured for this project.
supabase storage cp -r --project-ref ljigjawvlwvciqvegptp ss:///model-images ./model-images
supabase storage cp -r --project-ref ljigjawvlwvciqvegptp ss:///model-files  ./model-files
supabase storage cp -r --project-ref ljigjawvlwvciqvegptp ss:///avatars      ./avatars
```

Also save `supabase/templates/*.html` (they are already in the repo, which is being archived,
not deleted — so no extra copy needed) and note that `model-files` has 0 rows, so that bucket
is expected to be empty.

Verify `schema.sql` is non-trivial (it should contain all 10 tables and their RLS policies) and
`auth-users.json` has 13 entries. **Gate: both files exist and are non-empty before step 6.**

Per `Development/CLAUDE.md`, `_archive/` holds only git bundles and the DynamoDB backup today.
This adds a third kind; note it in that file's `_archive/` description in step 10.

---

### Step 5 — Shut the web down

Redirect Rules run at the zone edge, **before** Workers. So adding the redirect turns the site
off immediately and reversibly, which is the right order: redirect first, verify, then delete
the Worker.

The local `CLOUDFLARE_API_TOKEN` in `OpenECUAlliance/.env` is **invalid** (verified
2026-11-22: `{"success":false,"errors":[{"code":1000,"message":"Invalid API Token"}]}`). Mint a
fresh one with Zone:Edit and Workers:Edit, or do this in the dashboard.

1. **`oecua.org` zone** — replace the existing redirect rules with one rule:
   `(http.host eq "oecua.org" or http.host eq "www.oecua.org")` → `https://ultralog.co/`,
   301, preserve query string off (the paths do not exist on the target).
2. **`openecualliance.org` zone** — change the existing `→ oecua.org` rule's target to
   `https://ultralog.co/`. Same hostnames, same 301. **Touch nothing but the redirect rule in
   this zone** — the apex MX, `_dmarc`, `resend._domainkey`, `send.` MX and `send.` TXT stay.
3. Verify at the edge, not through a local resolver. A negative result from a cached resolver
   is not a result:
   ```bash
   for h in oecua.org www.oecua.org openecualliance.org www.openecualliance.org; do
     curl -sS -o /dev/null -w "$h -> %{http_code} %{redirect_url}\n" "https://$h/"
   done
   # expect: 301 https://ultralog.co/ on all four
   curl -sS -o /dev/null -w "api -> %{http_code} %{redirect_url}\n" https://oecua.org/api/adapters
   # expect: 301, not 200
   ```
   Confirm the mail records survived:
   ```bash
   dig +short MX openecualliance.org
   dig +short TXT _dmarc.openecualliance.org
   dig +short TXT resend._domainkey.openecualliance.org
   dig +short MX send.openecualliance.org
   dig +short TXT send.openecualliance.org
   ```
4. Delete the Worker route `oecua.org/*`, then delete the Worker script `open-ecu-alliance`.
5. **Keep the proxied placeholder A records** on both apexes and both `www` names. Redirect
   Rules only fire on proxied hostnames — grey-clouding or deleting a record silently
   disables that hostname's redirect. They stay until the zones are deleted at expiry.

**Rollback at any point before the Worker script is deleted:** delete the redirect rule. The
Worker route takes over again. After the script is deleted, rollback is a redeploy from the
archived repo with a fresh Cloudflare token.

---

### Step 6 — Delete the Supabase project

Only after step 4's dump is verified.

Supabase dashboard → project `ljigjawvlwvciqvegptp` → Settings → General → Delete project.
This removes the database, the three storage buckets, the 13 auth users and the auth email
template config in one action. It cannot be undone.

This is also the silent delete of the 13 signups. No notice is sent.

Then revoke what pointed at it:
- Delete the GitHub repo secrets `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SECRET_KEY`
  (`gh secret delete <name> --repo ClassicMiniDIY/OpenECUAlliance`).
- Delete the local `OpenECUAlliance/.env` and `.env.test` — they hold a service key for a
  project that no longer exists, plus the stale Cloudflare token.

---

### Step 7 — DNS and registrar

Decision taken: 301 to `ultralog.co` until the domains expire, auto-renew off.

1. Registrar: turn **auto-renew off** on `oecua.org` and `openecualliance.org`. Note both
   expiry dates in this document when you do.
2. Leave both Cloudflare zones in place with the redirect rules from step 5. They cost nothing
   and keep the 301 alive until expiry.
3. **Open question, decide separately:** `@openecualliance.org` mail dies when that domain
   expires. The SES inbound rule set behind the apex MX could not be inspected — the AWS
   credentials available here are S3-only (`arn:aws:iam::938808401967:user/cmdiy-s3`), and
   there is no OECUA mail bucket among the 8 S3 buckets in that account. Before the expiry
   date, check in the SES console what the inbound rule set does with mail to that domain and
   whether any address there is still in use anywhere. If it is, either keep renewing that one
   domain or migrate the address.
4. After expiry, delete both zones from Cloudflare.

---

### Step 8 — Archive the GitHub repository

Do not delete it. The 81 commits are the provenance record for the spec corpus that now lives
in UltraLog, and the Cloudflare migration plan in `docs/plans/` is the pathfinder log that
`classicminidiy`'s own migration references.

1. Merge this plan and a final README rewrite: a short notice at the top saying the site is
   retired, the spec corpus now lives in `ClassicMiniDIY/UltraLog` under `spec/openecu`, and
   the API is gone. Strip "Live site: oecua.org".
2. Delete the workflows (`ci.yml`, `deploy-cloudflare.yml`) — a scheduled or dispatchable
   workflow in an archived repo is noise, and `deploy-cloudflare.yml` targets a Worker that no
   longer exists.
3. Delete the repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (the Supabase
   three went in step 6).
4. Delete rulesets 21418103 and 27169820 — they reference a `build` check that no longer runs.
5. Remove `.github/dependabot.yml` so an archived repo stops opening PRs.
6. `gh repo archive ClassicMiniDIY/OpenECUAlliance --yes`.
7. `ClassicMiniDIY/OECUASpecs` is already archived and, after step 1, nothing references it.
   Leave it archived.

---

### Step 9 — Local workspace

1. Remove this worktree once its PR merges: `git worktree remove .claude/worktrees/site-retirement-plan-b4e056`.
   Also remove `UltraLog/.claude/worktrees/own-spec-corpus` once step 1's PR merges — a
   Rust worktree's `target/` runs to several GB.
   **Before deleting the `OpenECUAlliance` checkout, rescue `specs/assets/banners/`.** Eight
   banner PNGs sit untracked in the `fix/duplicate-vendor-chips` working tree and exist in no
   commit on any branch. Eight adapter specs reference them (`banner: haltech-banner.png`
   and so on), so those references dangle today and will dangle permanently once the
   checkout goes. Either copy them into `UltraLog/spec/openecu/assets/banners/` or drop the
   `banner:` keys from the specs.
2. `git bundle create ~/Development/_archive/cmdiy-openecualliance-retired-2026-11-22.bundle --all`
   from the main checkout, then delete `~/Development/OpenECUAlliance/`. This matches the
   pre-monorepo pattern already in `_archive/`.
3. Remove the OECUA entry from any local MCP or editor config that points at it.

---

### Step 10 — Documentation

1. `~/Development/CLAUDE.md`: remove `OpenECUAlliance/` from the workspace map. Add a line to
   the `_archive/` description for the retired-repo bundle and the Supabase dump.
2. `~/.claude/CLAUDE.md`: remove `OpenECUAlliance/` from the workspace map; remove
   "OpenECUAlliance = Nuxt UI v4" from the component-library row and "Nuxt UI remote" from the
   MCP list if nothing else uses it.
3. `UltraLog/CLAUDE.md`: already updated in step 1 with the Channel Registry Contract. Add that
   UltraLog now owns the corpus and there is no upstream.
4. `ultralog-site/CLAUDE.md`: remove the OECUA API as a data source; record where adapter data
   comes from now.
5. `UltraLog/ULTRALOG_INTEGRATION.md`: this document describes integrating with the OpenECU
   Alliance ecosystem. Rewrite or delete it.
6. `classicminidiy/backend/docs/plans/2026-10-01-dmarc-enforcement-and-bimi.md` names
   `oecua.org` and `openecualliance.org` in the DMARC ladder. Add a dated note that both are
   retired and their ladder is moot.
7. `classicminidiy/docs/plans/2026-11-12-github-team-adoption.md` lists OpenECUAlliance's
   rulesets and required checks. Add a dated note.
8. Historical plan documents that reference the OECUA pathfinder migration
   (`classicminidiy/apps/web/docs/plans/2026-08-06-cloudflare-workers-migration.md` and
   `CMDIY-MIGRATION-KICKOFF-PROMPT.md`) are **history and stay as written**. Do not rewrite
   them.

---

## 5. Final verification

Run after step 8, record the output here:

```bash
# Web is off, everything lands on ultralog.co
for h in oecua.org www.oecua.org openecualliance.org www.openecualliance.org; do
  curl -sS -o /dev/null -w "$h -> %{http_code} %{redirect_url}\n" "https://$h/"
done
curl -sS -o /dev/null -w "api -> %{http_code}\n" https://oecua.org/api/adapters

# Mail on openecualliance.org is intact
dig +short MX openecualliance.org; dig +short TXT _dmarc.openecualliance.org
dig +short MX send.openecualliance.org; dig +short TXT send.openecualliance.org

# Supabase is gone
curl -s -o /dev/null -w "supabase -> %{http_code}\n" https://ljigjawvlwvciqvegptp.supabase.co/rest/v1/

# UltraLog builds offline from a clean clone
git clone https://github.com/ClassicMiniDIY/UltraLog /tmp/ul-verify && cd /tmp/ul-verify && cargo test

# ultralog.co ECU pages still show their channel sections
curl -s https://ultralog.co/ecus/haltech-nsp | grep -c 'rpm'   # expect > 0
```

---

## 6. Ordering invariants

Five things must not happen out of order.

1. **Specs are in UltraLog and a clean clone builds offline** before the OECUA repo is
   archived or the API dies. UltraLog's `spec/OECUASpecs/` is gitignored today; without step 1
   a fresh clone cannot build.
2. **`ultralog-site` is cut off the API** before the site 301s. Its OECUA fetch only *warns*
   on failure, so a dead API ships ECU pages with the channel section silently missing.
3. **The Supabase dump is verified** before the project is deleted. The repo's migration file
   is 0 bytes; the dump is the only schema record there will be.
4. **The redirect rule goes in before the Worker is deleted.** Redirect Rules run before
   Workers, so the redirect is the reversible off switch; deleting the Worker first leaves a
   gap where the hostname resolves to nothing.
5. **Mail records on `openecualliance.org` are never touched by a web step.** Verify them with
   `dig` after every DNS or zone change.

## 7. What this does not do

- Does not delete the OpenECUAlliance GitHub repository. It is archived, public, read-only.
- Does not delete `ClassicMiniDIY/OECUASpecs`. Already archived; left alone.
- Does not rewrite historical plan documents in other repos.
- Does not notify the 13 signups.
- Does not resolve the `@openecualliance.org` mail question. That is step 7.3, due before the
  domain's expiry date.
