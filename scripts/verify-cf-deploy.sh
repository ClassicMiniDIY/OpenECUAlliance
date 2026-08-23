#!/usr/bin/env bash
#
# Cutover verification battery — diffs live behavior against the Vercel
# baseline captured in docs/baselines/2026-08-21-vercel-baseline/.
#
# Usage:
#   scripts/verify-cf-deploy.sh                  # verify production hosts
#   scripts/verify-cf-deploy.sh <origin>         # verify one origin (workers.dev)
#
# Exit code 0 = all checks pass. Every check prints its evidence.
#
# NOTE: the security middleware flags curl user-agents and 404s HEAD requests
# to /api/**, so every probe here uses GET with a browser-ish UA.

set -uo pipefail

PRIMARY="${1:-https://oecua.org}"
UA='Mozilla/5.0 (verify-cf-deploy)'
pass=0
fail=0

ok()   { printf '  ok   %s\n' "$1"; pass=$((pass + 1)); }
bad()  { printf '  FAIL %s\n' "$1"; fail=$((fail + 1)); }
head_() { curl -s -m 30 -A "$UA" -o /dev/null -D - "$@"; }
code_() { curl -s -m 30 -A "$UA" -o /dev/null -w '%{http_code}' "$@"; }
loc_()  { curl -s -m 30 -A "$UA" -o /dev/null -w '%{redirect_url}' "$@"; }

expect_code() { # url expected label
  local got; got=$(code_ "$1")
  [ "$got" = "$2" ] && ok "$3 ($got)" || bad "$3 — got $got, want $2"
}

expect_redirect() { # url expected_status expected_location label
  local got_code got_loc
  got_code=$(code_ "$1"); got_loc=$(loc_ "$1")
  if [ "$got_code" = "$2" ] && [ "$got_loc" = "$3" ]; then
    ok "$4 ($got_code -> $got_loc)"
  else
    bad "$4 — got $got_code -> $got_loc, want $2 -> $3"
  fi
}

expect_header() { # url header-regex label
  if head_ "$1" | grep -qiE "$2"; then ok "$3"; else bad "$3 — header not found: $2"; fi
}

echo "== Core pages (baseline: 200 at no-slash canonical URLs) =="
for p in / /spec /ecosystem /contribute /docs /docs/getting-started /adapters /protocols; do
  expect_code "$PRIMARY$p" 200 "GET $p"
done
expect_code "$PRIMARY/adapters/aim/aim-xrk" 200 "GET adapter detail (SSR)"

echo "== APIs (core product: serverAssets reads on workerd) =="
expect_code "$PRIMARY/api/adapters" 200 "GET /api/adapters"
expect_code "$PRIMARY/api/protocols" 200 "GET /api/protocols"
expect_code "$PRIMARY/api/adapters/aim/aim-xrk" 200 "GET adapter detail JSON"
expect_code "$PRIMARY/api/adapters/aim/aim-xrk?version=1.0.0" 200 "GET versioned detail"
expect_code "$PRIMARY/api/assets/logos/aim-logo.png" 200 "GET binary asset"
expect_header "$PRIMARY/api/specs/adapters/aim/aim-xrk/raw" \
  'content-disposition:.*attachment.*aim-aim-xrk\.adapter\.yaml' "raw YAML download filename"

echo "== CORS (public reads are wildcard; community endpoints are not) =="
if curl -s -m 30 -A "$UA" -H 'Origin: https://third-party.example' -o /dev/null -D - \
   "$PRIMARY/api/adapters" | grep -qi 'access-control-allow-origin: \*'; then
  ok "public API allows third-party origins"
else
  bad "public API missing wildcard ACAO"
fi
expect_header "$PRIMARY/api/adapters" 'x-frame-options: DENY' "security headers on API responses"

echo "== SEO =="
canon=$(curl -s -m 30 -A "$UA" "$PRIMARY/spec" | grep -oE 'rel="canonical" href="[^"]*"' | head -1)
[ "$canon" = 'rel="canonical" href="https://oecua.org/spec"' ] \
  && ok "per-page canonical on /spec" || bad "canonical on /spec — got: $canon"
canon_slash=$(curl -s -m 30 -A "$UA" "$PRIMARY/adapters/aim/aim-xrk/" | grep -oE 'rel="canonical" href="[^"]*"' | head -1)
[ "$canon_slash" = 'rel="canonical" href="https://oecua.org/adapters/aim/aim-xrk"' ] \
  && ok "slash variant canonicalizes to no-slash" || bad "slash canonical — got: $canon_slash"
curl -s -m 30 -A "$UA" "$PRIMARY/sitemap.xml" | grep -q '<loc>https://oecua.org/</loc>' \
  && ok "sitemap uses primary domain" || bad "sitemap URLs wrong"
curl -s -m 30 -A "$UA" "$PRIMARY/robots.txt" | grep -q 'Sitemap: https://oecua.org/sitemap.xml' \
  && ok "robots.txt sitemap pointer" || bad "robots.txt sitemap pointer"
curl -s -m 30 -A "$UA" "$PRIMARY/" | grep -q '"@type":"Organization"' \
  && ok "JSON-LD present and non-empty" || bad "JSON-LD missing"

echo "== Assets =="
expect_header "$PRIMARY/og-image.png" 'content-type: image/png' "og-image serves"
asset=$(curl -s -m 30 -A "$UA" "$PRIMARY/" | grep -oE '/_nuxt/[A-Za-z0-9._-]+\.js' | head -1)
if [ -n "$asset" ]; then
  expect_header "$PRIMARY$asset" 'cache-control:.*immutable' "immutable caching on /_nuxt/*"
else
  bad "could not find a /_nuxt/ asset in the homepage HTML"
fi

# Everything below is production-only: it needs the Cloudflare zone live.
if [ "$PRIMARY" != "https://oecua.org" ]; then
  echo
  echo "Skipping zone-level checks (target is not the production origin)."
  echo "passed=$pass failed=$fail"
  [ "$fail" -eq 0 ] || exit 1
  exit 0
fi

echo "== Redirects (baseline had 308 http->https and 307 apex->www; we emit 301) =="
expect_redirect "http://oecua.org/" 301 "https://oecua.org/" "http apex -> https"
expect_redirect "https://www.oecua.org/" 301 "https://oecua.org/" "www -> apex"
expect_redirect "https://openecualliance.org/" 301 "https://oecua.org/" "legacy apex -> primary"
expect_redirect "https://www.openecualliance.org/" 301 "https://oecua.org/" "legacy www -> primary"
expect_redirect "https://www.oecua.org/spec?a=b" 301 "https://oecua.org/spec?a=b" "path + query preserved"
expect_redirect "https://openecualliance.org/adapters?vendor=haltech" 301 \
  "https://oecua.org/adapters?vendor=haltech" "legacy deep link + query preserved"

echo "== TLS / HSTS (baseline: strict-transport-security max-age=63072000) =="
expect_header "https://oecua.org/" 'strict-transport-security: max-age=63072000' "HSTS on 200"
expect_header "https://www.oecua.org/" 'strict-transport-security' "HSTS on redirect"

echo "== Mail records survived the zone import (amendment C2) =="
check_dns() { # name type expected-substring label
  local got; got=$(dig +short "$2" "$1" 2>/dev/null)
  echo "$got" | grep -q "$3" && ok "$4" || bad "$4 — got: ${got:-<empty>}"
}
check_dns openecualliance.org MX 'inbound-smtp.us-east-1.amazonaws.com' "SES inbound MX"
check_dns _dmarc.openecualliance.org TXT 'v=DMARC1' "DMARC"
check_dns resend._domainkey.openecualliance.org TXT 'p=MIGfMA0GCSqGSIb3' "Resend DKIM"
check_dns send.openecualliance.org MX 'feedback-smtp.us-east-1.amazonses.com' "Resend bounce MX"
check_dns send.openecualliance.org TXT 'v=spf1 include:amazonses.com' "Resend SPF"

echo
echo "passed=$pass failed=$fail"
[ "$fail" -eq 0 ] || exit 1
