# OpenECU Alliance retirement and teardown

**Date:** 2026-11-22
**Decision:** retire oecua.org, the OpenECU Alliance brand, and every integration it offered.
**Status:** steps 1-6 done (2026-11-22/23). **The web is off and the backend is gone**:
oecua.org and openecualliance.org 301 to ultralog.co, the Worker is deleted, and the Supabase
project is deleted after its backup was restore-rehearsed. Mail on openecualliance.org is
untouched. What remains is housekeeping: step 7 (two registrar/SES clicks in the AWS console,
Cole's to make — both domains expire 2027-01-05, so there is no deadline pressure), step 8
(archive the repo), steps 9-10 (local workspace and docs).

**Step 4 corrected section 1 of this document.** A real third-party 3D model upload exists in
storage with no database row. See the amendment under section 1 and the step 4 record.

---

## 1. Why

The site launched 2026-01-05. Measured 2026-11-22:

| Signal | Value |
|---|---|
| Auth signups | 13 |
| Signups that signed in more than once | 3 (one of them is Cole) |
| Completed profiles | 3 |
| Community 3D model uploads | `model_files` = 0 rows, **but 3 objects in the `model-files` bucket** — see the amendment below |
| 3D models in the library | 8, all MakerWorld links Cole seeded himself on 2026-01-07 |
| Likes / comments / ratings / downloads / reports | 0 / 0 / 0 / 0 / 0 |
| GitHub stars / forks / watchers | 6 / 1 / 0 |
| GitHub issues (all time) | 0 |
| External pull requests | 0 (17 by Cole, 2 by Dependabot) |
| External contributors | 0 |
| Search Console property | none — the site was never added |

**No user-generated content exists in the database.** Every row was written by Cole or is an
empty counter. Nothing was paid for, so there is no refund or data-portability obligation.

The community layer — accounts, profiles, the 3D model library, comments, likes, ratings,
moderation queue, reports — was built and used by nobody. That is the part being deleted.

#### Amendment 2026-11-23 — storage contradicts the tables

The numbers above were read off the ten public tables. Step 4's backup read object storage
too, and found content the database has no record of.

A single non-Cole account (`12e9ec52-…`; the address is in the backup README, not in this
public repo) — the project's first signup, 2026-01-06, a session lasting 12 seconds, never
returned, and with no `profiles` row — uploaded a BambuStudio
`.3mf` plus two 5712×4284 photos under three separate model UUIDs (`698f7b01-…`,
`6e865807-…`, `fa6a8a91-…`). SHA-256 confirms it is **one model uploaded three times,
byte-identical**. None of the three UUIDs appears in `models`. The files reached storage and
the `models` row was never written: three retries of an upload flow that failed, by a real
user who then left. They set an avatar too, which also has no profile row behind it.

So "nothing a third party created is lost by deleting the project" was wrong as written. It
is true now only because the backup exists:
`_archive/oecua-supabase-2026-11-22/model-files/` and `model-images/`.

This does not change the decision to retire. It is one model from one user whose upload the
product dropped on the floor nearly two years ago. It does change two things:

1. **Step 6 must not run before the step 4 backup is confirmed in place** — that was already
   the gate, and this is the content it turns out to protect.
2. **Whether that user hears anything is an open decision.** Nobody was charged and the
   upload never became a published model, so there is no obligation. Recorded here so the
   choice is deliberate rather than forgotten. Their address is in the backup README; it is
   deliberately not written into this public repository.

The 4 other orphaned image folders (`2ea8195b-…`, `df727974-…`, `385a3b41-…`,
`bdb67582-…`) are Cole's own abandoned seeding attempts and carry nothing unique.

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

### Step 2 — Cut `ultralog-site` off the OECUA API — **DONE 2026-11-23**

`ClassicMiniDIY/ultralog-site#10`, merged and deployed to `ultralog.co`.

The 9 adapters the ECU pages need are committed as trimmed JSON in
`data/openecu/adapters.json` (547 channels), generated by a new `scripts/sync-adapters.ts`
and pinned to UltraLog `81b87de`, with all 9 digests verified against that commit
byte-for-byte. Regenerating is deliberately NOT part of `build`: the wiki clone that
`sync-wiki.ts` does at build is prose whose absence is obvious, whereas a missing adapter
makes the channel section vanish behind its `v-if`. A missing adapter now throws
unconditionally.

Verified on live `ultralog.co`: all 9 pages serve their exact channel counts with no channel
missing source names, and the 9 non-adapter pages still return 200. **Step 2's gate is
satisfied, so step 5 is unblocked.**

Two things worth carrying forward:

- **The casing trap was real.** The spec is snake_case (`source_names`); the retired API
  served the same data camelCased. The generator converts, and a test asserts no channel
  lacks source names, because the failure mode is an empty list and no error.
- **A pre-existing fix rode along.** `UNIT_LABELS` had a `kmh` key matching zero channels
  while `kph` — 18 channels — rendered raw, along with 25 other unmapped units. Fixed.

The original step 2 instructions follow, for the record.

### Step 2 (as planned) — Cut `ultralog-site` off the OECUA API

Branch: `fix/drop-oecua-dependency` in `ultralog-site`, off `origin/main`.

The channel data on `/ecus/<slug>` currently comes from `oecua.org/api/adapters` at build
time. Replace the source, do not delete the section — these pages are public and indexed.

0. **Gate: `ClassicMiniDIY/UltraLog#120` must be merged first.** This step needs the final
   committed layout of `spec/openecu/` on UltraLog's `main`; vendoring from an unmerged
   branch invites a second round of churn.
1. In `server/utils/ecus.ts`: delete `OECUA_API` and `OECUA_SITE` and the fetch. Read the
   adapter YAML instead. Either vendor the handful of files the ECU pages need into
   `ultralog-site/data/adapters/`, or (better) have UltraLog's release publish the corpus as a
   release asset and fetch that — a tagged artefact, not a live site.
   **Watch the casing.** The current code consumes the API's camelCase JSON
   (`sourceNames`); the YAML is snake_case (`source_names`). The transform has to change
   with the source, and the symptom of getting it wrong is an empty channel list rather
   than an error — the same silent failure this whole step exists to remove.
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

### Step 3 — Remove UltraLog's runtime API tier — **DONE 2026-11-23**

Branch `chore/remove-oecua-api-tier` in `UltraLog`. 1056 net lines removed.

`api.rs` (270 lines) and `cache.rs` (374) are deleted, along with `RefreshResult`,
`refresh_specs_from_api`, `specs_refreshed`, `spec_generation`, `get_spec_source`, the
`SPECS_REFRESHED`/`SPEC_GENERATION` atomics, the startup refresh thread in `app.rs`, and
`thiserror` from `Cargo.toml` (those two files were its only users). `ureq` and `dirs` stay —
tiles, updater, analytics and settings use them.

Because nothing can replace the specs at runtime any more, the `RwLock`s went too:
`ADAPTER_SPECS`, `PROTOCOL_SPECS` and the two derived maps are now plain
`LazyLock<Vec<_>>` / `LazyLock<HashMap<_, _>>`, and the read helpers return borrows. That
makes `EMBEDDED_ADAPTERS` order the *only* order, so `test_normalize_rpm` now asserts what
actually ships rather than what ships on a machine with no cache.

`GpsChannelCache` dropped its `spec_generation` field — it existed solely to invalidate a GPS
channel lookup when a background refresh swapped the metadata mid-session.

**The reason this was not merely tidy-up.** The original note below called it "not urgent for
correctness". That was wrong, and step 1 is what showed why: the fetch was unconditional at
startup, and any response that deserialized into `Vec<AdapterSpec>` was written to the disk
cache and then shadowed the embedded corpus for 24 hours on every start. Once
`openecualliance.org` lapses — which step 7 arranges — whoever registered the name next could
have overridden the specs on users' machines. It had to land before step 7, not after.

**A leftover accepted on purpose:** installs that ran an older build keep
`{app_data_dir}/UltraLog/oecua_specs/`. Nothing reads or writes it and no code removes it;
it is a few hundred KB of orphaned JSON, recorded in `UltraLog/CLAUDE.md`.

The original step 3 instructions follow, for the record.

### Step 3 (as planned) — Remove UltraLog's runtime API tier

The fallback chain means this is not urgent for correctness, but leaving a background task
hammering a dead host is sloppy.

1. Delete `src/adapters/api.rs` and the `OECUA_API_BASE` constant.
2. Collapse the chain in `src/adapters/registry.rs` from API → cache → embedded to embedded
   only. Delete the background refresh, `RefreshStatus::` variants that only existed for it,
   and the disk cache in `src/adapters/cache.rs` (`oecua_specs` cache dir) if nothing else
   writes it.
3. Remove any UI that surfaces "checking for adapter updates" / refresh state.
4. Drop the HTTP dependency from `Cargo.toml` if nothing else uses it.
5. **Do not reorder `EMBEDDED_ADAPTERS`.** Its order decides which adapter wins a
   contested `source_names` entry (step 1, finding 2), and 43 names resolve to different
   canonical ids depending on it. Removing the API and cache tiers is an improvement here
   — they could replace the spec list at runtime in whatever order the API returned, so
   after this step the embedded order is the only order and normalization becomes
   deterministic. Say so in `CLAUDE.md` when it lands.
6. `cargo fmt --all -- --check && cargo clippy -- -D warnings && cargo test`.

Cheap alternative if you want to defer the refactor: keep the chain and point
`OECUA_API_BASE` at nothing, letting it fail fast. Not recommended — dead code with a dead
URL is worse than no code.

---

### Step 4 — Back up the Supabase project — **DONE 2026-11-23**

Backup at `~/Development/_archive/oecua-supabase-2026-11-22/`, 21 MB, with its own
`README.md` recording provenance and counts. Nothing was deleted or altered in the project;
every call was a read. **Step 4's gate is satisfied, so step 6 is unblocked.**

No database password was needed. `supabase db dump --linked` provisions a login role through
the Management API, so the dashboard trip the instructions below assumed never happened. Two
obstacles worth recording:

- **`pg_dump` is not installed on this machine** and there is no Homebrew postgres. The
  Supabase CLI runs it in a container instead; Docker was already up.
- **`supabase/config.toml` blocks the CLI.** It still has an `[inbucket]` section, which CLI
  3.1.0 rejects outright (`DbConfigLoadError … use [local_smtp] instead`). Rather than edit a
  repo that is being archived, the dump ran from a throwaway project directory containing
  nothing but `project_id`. Anyone re-running this needs the same workaround.

What landed:

| File | Contents |
|---|---|
| `schema.sql` | 41 KB — all 10 tables, 10× RLS enabled, **65 policies**, 8 functions, 9 triggers, 26 indexes |
| `schema-auth-storage.sql` | 173 KB — `auth` and `storage` DDL |
| `data.sql` | 60 KB — `public`, `auth` **and** `storage` rows |
| `roles.sql` | the three `statement_timeout` overrides |
| `auth-users.json` | 13 users with emails and sign-in timestamps |
| `data/*.json` | each public table from PostgREST, as a cross-check on `data.sql` |
| `storage-manifest.json` + 3 bucket dirs | all 23 objects, 21.8 MB, at their storage paths |

The schema came out far better than this plan expected — the 0-byte repo migration implied the
DDL might be unrecoverable, but the dump carries the full policy set.

Row counts agree across all three sources (`data.sql`, the PostgREST JSON, and the admin API):
`auth.users` 13, `profiles` 3, `models` 8, `model_images` 8, `moderation_queue` 8,
`storage.objects` 23, and 0 for `model_files`, `model_likes`, `model_comments`,
`model_ratings`, `model_downloads`, `model_reports`. All 23 downloaded files were verified
with `file` — 8 JPEG, 12 WebP, 3 OOXML (the `.3mf`) — so none is a disguised error payload.

**The finding that matters:** the `model-files` bucket is *not* empty. It holds one real
third-party model uploaded three times, byte-identical, with no `models` row. The instruction
below saying the bucket "is expected to be empty" was wrong, and so was section 1's claim that
no third-party content exists. Full detail in the section 1 amendment and the backup README.

`storage-manifest.json` is the reconciliation: 8 of the 15 `model-images` folders match a
`models` row; the other 7, all 3 `model-files` objects and both avatars do not.

The original step 4 instructions follow, for the record. Note that the `pg_dump` and
connection-string steps are superseded by the CLI method above.

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
is expected to be empty. **Wrong — see the step 4 record above: the bucket holds 3 objects.**
The table being empty is exactly why the bucket was nearly skipped, and it is the one place
third-party content turned out to live.

Verify `schema.sql` is non-trivial (it should contain all 10 tables and their RLS policies) and
`auth-users.json` has 13 entries. **Gate: both files exist and are non-empty before step 6.**

Per `Development/CLAUDE.md`, `_archive/` holds only git bundles and the DynamoDB backup today.
This adds a third kind; note it in that file's `_archive/` description in step 10.

---

### Step 5 — Shut the web down — **DONE 2026-11-23**

`oecua.org` and `openecualliance.org` are off. All four hostnames and every path 301 to
`https://ultralog.co/`; the Worker route and the `open-ecu-alliance` script are deleted. Mail
on `openecualliance.org` is untouched. Verified at each edge IP with `--resolve`, through
1.1.1.1 and 8.8.8.8, and on `/`, `/adapters`, `/adapters/haltech/nsp-csv`, `/api/adapters`,
`/api/protocols`, `/models` and `/spec` — all 301. `ultralog.co` itself serves 200.

Done with `scratchpad/step5-shut-the-web-down.sh`, two-phase (`redirect`, verify, then
`delete-worker`, which refuses to run unless `oecua.org` already returns 301).

**Pre-change state saved to** `_archive/oecua-supabase-2026-11-22/cloudflare-pre-teardown/`:
both zones' dynamic-redirect rulesets, worker routes and full DNS, plus the Worker source
(`worker-open-ecu-alliance.js`, 17 MB — note it is the API's **multipart** response bundling
`index.js` and its modules, not a plain script).

#### The token

The plan said to mint one with Zone:Edit and Workers:Edit. What the API actually needs, and
what worked, is six permission groups: Zone → **Single Redirect** Edit, **Zone** Read,
**Workers Routes** Edit, **DNS** Read, **Page Rules** Read, and Account → **Workers Scripts**
Edit, scoped to both zones.

A trap worth recording: a token whose TTL has not started yet reports `status: active` from
`/user/tokens/verify` while every real call fails `9109 Invalid access token`. The dashboard's
TTL picker sets a **start** date as well as an end date, so "expires tomorrow" silently
produced a token that did not begin until tomorrow. Verify tokens with a real request, not
`/tokens/verify`.

#### Two corrections to section 3's inventory

1. **Both zones used Single Redirects and had zero Page Rules**, so replacing the
   dynamic-redirect entrypoint was sufficient. The old rules both targeted
   `concat("https://oecua.org", http.request.uri.path)` with `preserve_query_string: true`;
   the new ones use a static `https://ultralog.co/` with it off, since no path exists on the
   target.
2. **`openecualliance.org`'s apex A record is not a placeholder.** Section 3 describes a
   proxied RFC 5737 dummy, which is true of `oecua.org` (`192.0.2.1`) but not of
   `openecualliance.org`, whose apex is `216.198.79.1` — a real Vercel address left from
   before the Workers migration. Both `www` names are also still `CNAME`s to
   `d60751f631ce6bfc.vercel-dns-017.com`.

   This is harmless **only because all four records are proxied**: the redirect fires at the
   edge and the origin is never reached. It raises the stakes on step 5's rule 5 and step 7's
   decision to leave the zones up — grey-clouding any of those records would both disable its
   redirect and start sending real traffic at stale Vercel infrastructure. Leave them
   orange-clouded until the zones are deleted at expiry.

**Rollback** is `step5-shut-the-web-down.sh rollback`, which restores both saved rulesets. The
Worker itself is gone, so returning the site to service now means redeploying from the
archived repo with a fresh token.

### Step 5 (as planned) — Shut the web down

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

### Step 6 — Delete the Supabase project — **DONE 2026-11-23**

Project `ljigjawvlwvciqvegptp` is deleted. `supabase projects delete ljigjawvlwvciqvegptp
--yes` returned `{"name":"Open ECU Alliance","message":"Deleted project"}`; the REST, auth and
storage endpoints all return **410 Gone** and the ref is absent from `supabase projects list`.
The shared CMDIY project `psoqirvbujwohemmwplv` was untouched and remains ACTIVE_HEALTHY.

**The backup was restore-rehearsed first, not just verified by size.** `schema.sql`,
`schema-auth-storage.sql` and `data.sql` were replayed into a throwaway `postgres:17`
container and the results compared with the live project: **10 tables, 65 policies, 9
triggers, 10 RLS-enabled — exact**, and every row count as expected (`auth.users` 13,
`profiles` 3, `models` 8, `model_images` 8, `moderation_queue` 8, `storage.buckets` 3,
`storage.objects` 23). `data.sql` applied with **zero** errors. `schema.sql` produced exactly
one, `extension "supabase_vault" is not available`, a platform extension nothing depends on.
Reproducing it needs a harness of Supabase roles, the `auth`/`storage`/`extensions` schemas,
`supabase_realtime`, and stubs for `auth.uid()` and friends — 54 of the 65 policies call
`auth.uid()`. Full detail in the backup README.

Two traps found while verifying, recorded so nobody mistakes either for damage:

- **The dumps have no `-- PostgreSQL database dump complete` marker.** The Supabase CLI
  strips comment lines. Absence of the marker is not truncation; check `$$` balance and that
  the file ends on a complete statement instead.
- **`data.sql` sets `session_replication_role = replica`**, so FKs and triggers are suppressed
  during load by design.

Also revoked:

- GitHub repo secrets `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SECRET_KEY` deleted.
  `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` remain for step 8.
- Local `OpenECUAlliance/.env` and `.env.test` deleted. Both were gitignored, so this is
  unrecoverable — deliberately. Before deleting, the 22 non-secret `RATE_LIMIT_*` /
  `SECURITY_*` values, which existed nowhere else, were saved to
  `_archive/oecua-supabase-2026-11-22/retired-site-runtime-config.env`. No credential was
  copied out.

**Consequence worth knowing:** `.env` was where `step5-shut-the-web-down.sh rollback` read its
Cloudflare token, so that one-command rollback no longer runs without a fresh token. This is
acceptable — the Worker was already deleted in step 5, so restoring the site already meant a
redeploy, and the redirects are verified working at the edge.

### Step 6 (as planned) — Delete the Supabase project

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

### Step 7 — DNS and registrar — **FACTS GATHERED 2026-11-23, registrar action still Cole's**

Decision taken: 301 to `ultralog.co` until the domains expire, auto-renew off.

**Both domains are at Amazon Registrar and both expire `2027-01-05`** (`oecua.org`
03:01:44Z, `openecualliance.org` 03:01:43Z — registered in the same minute). That is
**13 months away**, so nothing here is urgent. Manage them in the AWS console under
Route 53 -> Registered domains, not in Cloudflare — Cloudflare is DNS only; both zones
use `anita`/`thomas.ns.cloudflare.com`.

Auto-renew state could not be read, and neither could SES. Three local AWS profiles exist
(`default`, `cmdiy-dynamo`, `cmdiy-route53`); the `cmdiy-route53` user
`arn:aws:iam::938808401967:user/cmdiy-route53` has Route 53 **hosted-zone** read access but is
denied `route53domains:*` (both `ListDomains` and `GetDomainDetail`) and every `ses:*` call,
exactly as the S3-only user is. **No credential on this machine can read the registrar or the
SES rule set.** Both remain console work. If a future task needs them from the CLI, the policy
on `cmdiy-route53` would need `route53domains:GetDomainDetail` and
`ses:DescribeActiveReceiptRuleSet`.

#### Finding: two inert Route 53 hosted zones are still billing

The `cmdiy-route53` profile turned up something this plan never knew about. **Both domains
also have Route 53 hosted zones**, created automatically by the Route 53 Registrar at
registration and never deleted:

| Zone | Id | Records |
|---|---|---|
| `openecualliance.org` | `Z0414493IDIAZ4XRMQD6` | 9 |
| `oecua.org` | `Z08574592I9ZAEUXQALKG` | 4 |

**They are not authoritative and never have been.** The registry delegates both domains to
`anita`/`thomas.ns.cloudflare.com` only; the AWS NS sets in these zones are not in the
delegation. Verified by querying both sides directly — Cloudflare's own nameservers answer
`openecualliance.org MX` and `_dmarc` from the Cloudflare zone, so the live mail records do
not depend on Route 53 at all.

Their contents prove how stale they are: both still point at **Vercel**
(`A 216.198.79.1`, `www CNAME d60751f631ce6bfc.vercel-dns-017.com`) from before the
2026-08-24 Cloudflare Workers migration. They were never updated. The
`openecualliance.org` zone does carry a duplicate copy of all five mail records, which is why
it looks load-bearing and is not.

Both zones are **safe to delete** and doing so saves roughly $1/month (standard Route 53
pricing is $0.50 per hosted zone per month) — about $12 across the 13 months to expiry.
Captured first to `_archive/oecua-supabase-2026-11-22/route53-pre-teardown/` (zone + record
JSON for each), so the SES and Resend record values survive the deletion.

**Emptied 2026-11-23, but NOT deleted — the last step needs the console.** Cole approved the
deletion and `cmdiy-route53` can write records but is denied `route53:DeleteHostedZone` on
both zone ARNs. So the records were removed (7 from `openecualliance.org`, 2 from `oecua.org`;
changes `C10245783NY68NPJBY7FV` and `C05367092JBDMSAJEUTGD`) and each zone now holds only its
apex `NS` and `SOA`, which Route 53 removes with the zone itself.

**Both zones still exist and still bill**, so this saved nothing yet. Finish it in
Route 53 -> Hosted zones: delete `Z0414493IDIAZ4XRMQD6` and `Z08574592I9ZAEUXQALKG`. They are
empty, so the console will not object.

Verified after emptying: all five live mail records still answer from the public resolver and
from Cloudflare's own nameservers, and both apexes still return `301 https://ultralog.co/`.
Deleting records from the inert duplicate could not affect them, and did not. If the zones are
kept after all, the records replay from the backup with
`aws route53 change-resource-record-sets` using an `UPSERT` batch built from
`<name>-records.json`.

**Mail records verified intact after the web teardown** (public resolver, 1.1.1.1):

| Record | Value |
|---|---|
| `openecualliance.org` MX | `10 inbound-smtp.us-east-1.amazonaws.com` |
| `_dmarc` TXT | `v=DMARC1; p=none;` |
| `resend._domainkey` TXT | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDOgn75...` |
| `send.` MX | `10 feedback-smtp.us-east-1.amazonses.com` |
| `send.` TXT | `v=spf1 include:amazonses.com ~all` |

Step 5 touched none of them, as intended. Both apexes still answer `301 https://ultralog.co/`.

**The open question is now much smaller than when it was written.** Every
`@openecualliance.org` address referenced anywhere in `~/Development` is accounted for:

| Address | Where it lives | Status after retirement |
|---|---|---|
| `no-reply@` | magic-link sender, via Resend, for the OECUA Supabase project | **dead** — that project was deleted in step 6; nothing sends from it |
| `info@`, `projects@` | `app/pages/docs/project-charter.vue` | dead — page is offline |
| `branding@`, `legal@` | `app/pages/docs/branding.vue` | dead — page is offline |

No address appears in `UltraLog`, `ultralog-site`, or the spec corpus, so nothing that
outlives this teardown prints one. **Outbound** mail on this domain is therefore already
finished. What remains unknown is only **inbound**: what the SES receipt rule set does with
mail to these four addresses, and whether anyone outside these repos has one (a GitHub
profile, a forum post, a printed card). That is a console question, not a code question.

#### What Cole still has to do

1. **Route 53 -> Registered domains**, for `oecua.org` and `openecualliance.org`: turn
   **auto-renew off**. Expiry is already recorded above, so nothing to note.
2. **SES console, us-east-1 -> Email receiving -> Rule sets**: look at the active rule set
   and see what it does with `openecualliance.org` mail — which recipients it matches and
   what the actions are (S3? SNS? Lambda? a forward?). There is no OECUA mail bucket among
   the 8 S3 buckets in this account, so if it writes to S3 it writes somewhere shared.
   - If the rule only serves the four dead addresses above: nothing to do, it dies with the
     domain on 2027-01-05.
   - If it forwards an address still worth having: either keep renewing
     `openecualliance.org` alone (and still let `oecua.org` lapse), or move the address.
   - Deleting the rule is optional either way. It costs nothing and breaks nothing.
3. Leave both **Cloudflare** zones and their redirect rules in place. They cost nothing and
   keep the 301 alive until expiry.
4. **Route 53 -> Hosted zones**: delete `Z0414493IDIAZ4XRMQD6` (`openecualliance.org`) and
   `Z08574592I9ZAEUXQALKG` (`oecua.org`). Both were emptied on 2026-11-23 and hold only `NS`
   and `SOA`; the CLI user cannot do the final delete. This is the only part of step 7 that
   costs money.
5. **After 2027-01-05**, delete both zones from Cloudflare.

**Do not touch the five mail records before expiry**, and do not let a zone cleanup take the
MX with it. The `_dmarc`, `resend._domainkey`, `send.` MX and `send.` SPF records sit on
subdomains, so an apex-only sweep will not show them — that exact mistake is recorded in
`classicminidiy/apps/web/docs/plans/2026-08-06-cloudflare-workers-migration.md`.

#### Step 7 (as planned)

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

### Step 8 — Archive the GitHub repository — **IN PROGRESS 2026-11-23**

Items 1, 2 and 5 are committed on this branch. Items 3, 4, 6 and the two findings below are
API actions that must wait until this branch merges, because **archiving makes the repository
read-only** and nothing can be committed afterwards.

**Ordering trap: ruleset 27169820 requires the `build` check, and this branch deletes
`ci.yml`.** The required check will therefore never report, so the PR cannot satisfy it. Delete
ruleset 27169820 *before* merging, or merge with `gh pr merge --admin`. Do not re-add the
workflow to get a green check.

**Finding: three of the five rulesets are organization-level, not this repo's.** The plan's
two ids are correct, but verify `source_type` before deleting anything:

| Id | Scope | Name | Action |
|---|---|---|---|
| 21418103 | Repository | main protection | delete |
| 27169820 | Repository | main: CI must pass | **deleted 2026-11-23** |
| 27166947 | **Organization** | baseline: no delete or force-push | **leave** |
| 27166949 | **Organization** | baseline: PR required | **leave** |
| 27166950 | **Organization** | release tags: no move or delete | **leave** |

Deleting an org ruleset would weaken every other `ClassicMiniDIY` repository.

**Finding: two open Dependabot PRs** (#18 bun group, #19 github-actions group, both from
2026-11-13). Archiving leaves them open and permanently unmergeable. Close them before
archiving. Removing `.github/dependabot.yml` stops new ones but does not close these.

**Verified before writing the README notice:** `spec/openecu` is on UltraLog's `main` with 51
files and `spec/OECUASpecs` is gone from it, so step 1 really did land and the notice points
somewhere real. (The local `~/Development/UltraLog` checkout sits on a stale `dev` branch, 35
commits behind `origin/main`, which makes it look as though the move never happened. Step 9
territory, not a problem with the move.)

**PR #22 opened 2026-11-23**, Auto-fix on. Ruleset 27169820 was deleted straight away, so the
unreportable `build` check no longer blocks it.

**The PR still reads `BLOCKED`, and that is the normal state for this repository.** Two things
hold it, neither of them CI:
- repo ruleset 21418103 `main protection` has a `pull_request` rule with a single **User
  bypass actor in `always` mode** — Cole. Nobody else can merge to `main` here, by design.
- org ruleset 27166949 `baseline: PR required` sets
  `require_extra_approval_for_unattributed_changes: true`.

So the merge is `gh pr merge 22 --repo ClassicMiniDIY/OpenECUAlliance --admin`, exactly as
section 3 recorded. Do not weaken either ruleset to get a green merge button.

Two **CodeQL** checks (`Analyze (actions)`, `Analyze (javascript-typescript)`) run on the PR.
They come from GitHub default code scanning, not from the deleted `ci.yml`, and are not
required. They stop when the repository is archived.

#### What is left, in order

1. Merge PR #22 with `--admin`.
2. Close PRs #18 and #19.
3. `gh secret delete CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. **After this the
   redirect rollback in step 5 has no credential at all** — the Worker is already deleted, so
   restoring the site was a redeploy anyway.
4. Delete ruleset 21418103.
5. `gh repo archive ClassicMiniDIY/OpenECUAlliance --yes`.

#### Step 8 (as planned)

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
