# CLAUDE.md

This file provides guidance to Claude Code when working with the OpenECU Alliance codebase.

## Project Overview

This is the **OpenECU Alliance** website - a Nuxt 4 application that serves as the public face of the OpenECU Spec initiative.

### Key Terminology

- **OpenECU Alliance** - The open community/organization that maintains the spec and ecosystem
- **OpenECU Spec** - The formal specification published by the Alliance for describing ECU log formats
- **Spec-Compatible Applications** - Apps like UltraLog that implement the OpenECU Spec
- **Adapters** - YAML files that describe ECU log formats using the spec

### This Site's Purpose

1. **Spec Documentation** - The authoritative source for the OpenECU Spec
2. **Adapter Browser** - Discover and browse community-contributed adapters
3. **Ecosystem Hub** - Showcase spec-compatible applications and tools
4. **Contribution Portal** - Guides for creating adapters and donating projects

## Tech Stack

- **Framework**: Nuxt 4 (compatibility version 4)
- **Runtime**: Bun
- **UI**: Nuxt UI v4 + Tailwind CSS
- **Icons**: Heroicons, Lucide, Simple Icons (via @nuxt/icon)
- **Fonts**: @nuxt/fonts
- **Data**: Server API reads YAML from local `specs/` directory (migrated from OECUASpecs repo)

## Repository Structure

```
OpenECUAlliance/
├── app/
│   ├── app.vue                       # Root component (UApp wrapper)
│   ├── assets/
│   │   └── css/
│   │       └── main.css              # Tailwind + Nuxt UI imports, custom theme
│   ├── components/
│   │   ├── AppHeader.vue             # Navigation header with dark mode toggle
│   │   ├── AppFooter.vue             # Footer with links
│   │   └── AdapterCard.vue           # Adapter listing card component
│   ├── composables/
│   │   ├── useAdapters.ts            # Adapter data fetching and filtering
│   │   └── useVendorIcons.ts         # Vendor-to-icon mapping utility
│   ├── pages/
│   │   ├── index.vue                 # Landing page with hero, features, vendors
│   │   ├── adapters/
│   │   │   ├── index.vue             # Adapter marketplace with search/filter
│   │   │   └── [vendor]/
│   │   │       └── [id].vue          # Adapter detail page with channels
│   │   ├── ecosystem.vue             # Spec-compatible apps showcase
│   │   ├── spec.vue                  # Specification docs (placeholder)
│   │   ├── docs.vue                  # Documentation hub (placeholder)
│   │   └── contribute.vue            # Contribution guide
│   └── types/
│       └── adapter.ts                # TypeScript interfaces for adapters
├── server/
│   ├── api/
│   │   ├── adapters.get.ts           # GET /api/adapters - list all adapters
│   │   ├── adapters/
│   │   │   └── [vendor]/
│   │   │       └── [id].get.ts       # GET /api/adapters/:vendor/:id - adapter detail
│   │   ├── protocols.get.ts          # GET /api/protocols - list all protocols
│   │   ├── protocols/
│   │   │   └── [vendor]/
│   │   │       └── [id].get.ts       # GET /api/protocols/:vendor/:id - protocol detail
│   │   ├── specs/
│   │   │   ├── adapters.get.ts       # GET /api/specs/adapters - list with download URLs
│   │   │   ├── adapters/[vendor]/[id]/raw.get.ts  # Raw YAML download
│   │   │   ├── protocols.get.ts      # GET /api/specs/protocols - list with download URLs
│   │   │   └── protocols/[vendor]/[id]/raw.get.ts # Raw YAML download
│   │   └── assets/
│   │       └── [type]/
│   │           └── [filename].get.ts # Asset serving (logos, icons, banners)
│   └── utils/
│       └── filesystem.ts             # Local filesystem utilities for reading specs
├── specs/
│   ├── adapters/                     # Adapter YAML files organized by vendor
│   ├── protocols/                    # Protocol YAML files organized by vendor
│   └── assets/                       # Branding assets (logos, icons, banners)
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── nuxt.config.ts                    # Nuxt configuration
├── package.json
└── tsconfig.json
```

## Related Repositories

The OpenECU Alliance spans multiple repositories:

| Repository                                                           | Description                                               | Status   |
| -------------------------------------------------------------------- | --------------------------------------------------------- | -------- |
| [OECUASpecs](https://github.com/ClassicMiniDIY/OECUASpecs)           | Adapter YAML files, JSON Schema, and formal specification | Archived |
| [OpenECUAlliance](https://github.com/ClassicMiniDIY/OpenECUAlliance) | This website (includes specs in `specs/` directory)       | Active   |

**Migration Note (2026-01-21):** Specs were migrated from the external OECUASpecs repository to this repository's local filesystem. The website now serves specs directly from the `specs/` directory instead of fetching from GitHub API. See `MIGRATION.md` for details.

## Key Pages

### `/` - Landing Page

- Hero section introducing OpenECU Spec
- "What is OpenECU Alliance?" explainer (Alliance vs Spec vs Ecosystem)
- Feature highlights (Spec, Adapters, Language Agnostic, Community)
- Spec-compatible applications showcase
- Supported vendors grid with ready/planned status
- Developer sections for using and contributing

### `/adapters` - Adapter Marketplace

- Grid of adapter cards with search input
- Filter by vendor, category, file format
- Results count and empty state handling
- Links to individual adapter detail pages
- CTA for contributing missing adapters

### `/adapters/[vendor]/[id]` - Adapter Detail

- Breadcrumb navigation
- Header with icon, name, version, description
- File format details card (type, extensions, delimiter)
- Channel listing grouped by category
- Source name mappings via popover
- Metadata section (tested with, known issues)

### `/ecosystem` - Ecosystem Page

- How the ecosystem works (Spec -> Adapters -> Apps)
- Compatible applications (currently UltraLog)
- Libraries & SDKs section (planned)
- Project donation information

### `/spec` - Specification Page

- Links to raw spec files on GitHub
- Quick overview cards (structure, format, channels, validation)
- Placeholder for interactive viewer

### `/docs` - Documentation Page

- Guides section (Getting Started, Creating Adapters, etc.)
- Reference section (Channels, Units, Categories)
- Links to GitHub and spec
- All guides marked "Coming Soon"

### `/contribute` - Contribution Guide

- Why contribute section
- 4-step contribution process
- Example adapter YAML snippet
- Links to GitHub and spec

## API Routes

### Main Endpoints (Parsed Data)

#### `GET /api/adapters`

Returns list of all adapters with summary info:

- `id`, `name`, `version`, `vendor`
- `description` (first line only)
- `channelCount`, `categories`, `fileFormat`, `extensions`
- `branding` with local API URLs

#### `GET /api/adapters/[vendor]/[id]`

Returns full adapter detail including:

- Complete metadata
- File format details
- All channels with sourceNames
- Supports `?version=X.Y.Z` query parameter

#### `GET /api/protocols`

Returns list of all protocols with summary info:

- `id`, `name`, `version`, `vendor`
- `protocolType`, `baudrate`, `messageCount`, `signalCount`

#### `GET /api/protocols/[vendor]/[id]`

Returns full protocol detail including messages and signals

- Supports `?version=X.Y.Z` query parameter

All main endpoints cache responses for **15 minutes**.

### Raw Spec Endpoints (YAML Files)

#### `GET /api/specs/adapters`

Lists all adapters with download URLs for raw YAML files

#### `GET /api/specs/adapters/[vendor]/[id]/raw`

Downloads raw adapter YAML file

- Supports `?version=X.Y.Z` query parameter
- Sets `Content-Disposition: attachment` header

#### `GET /api/specs/protocols`

Lists all protocols with download URLs for raw YAML files

#### `GET /api/specs/protocols/[vendor]/[id]/raw`

Downloads raw protocol YAML file

- Supports `?version=X.Y.Z` query parameter

### Asset Endpoints

#### `GET /api/assets/[type]/[filename]`

Serves branding assets (logos, icons, banners)

- Proper MIME type detection
- Cached for 24 hours
- Types: `logos`, `icons`, `banners`

## Build Commands

```bash
# Install dependencies
bun install

# Development server (http://localhost:3000)
bun dev

# Build for production
bun run build

# Preview production build
bun preview
```

## Design Guidelines

- Clean, professional aesthetic for automotive/motorsport audience
- Dark mode support via `useColorMode()` (many users prefer dark)
- Mobile-responsive for pit lane/trackside access
- Fast - leverage Nuxt SSR, minimal client JS
- Consistent use of Nuxt UI components
- Icons: Heroicons for UI, Simple Icons for brands

## Code Patterns

### Composables

- `useAdapters()` - Fetches adapter list, provides filtering functions and computed properties for vendors/categories/formats
- `useVendorIcons()` - Maps vendor names to Heroicons for consistent icon display

### Server API

- Reads adapter/protocol data from local filesystem via `server/utils/filesystem.ts`
- Uses `defineCachedEventHandler` for 15-minute response caching
- YAML parsing via `yaml` package
- Transforms snake_case YAML to camelCase responses
- Multi-version support with semantic versioning
- Path traversal protection and input validation

### Components

- UCard components used extensively for content blocks
- UBadge for status indicators and metadata tags
- Vendor icons sourced from `useVendorIcons()` composable

## Canonical Channel IDs

Adapters map vendor-specific names to canonical IDs:

| ID                 | Description         | Category     |
| ------------------ | ------------------- | ------------ |
| `rpm`              | Engine RPM          | engine       |
| `tps`              | Throttle Position   | engine       |
| `map`              | Manifold Pressure   | pressure     |
| `afr`              | Air-Fuel Ratio      | fuel         |
| `lambda`           | Lambda Value        | fuel         |
| `coolant_temp`     | Coolant Temperature | temperature  |
| `iat`              | Intake Air Temp     | temperature  |
| `ignition_advance` | Ignition Timing     | ignition     |
| `g_lateral`        | Lateral G-Force     | acceleration |
| `gps_latitude`     | GPS Latitude        | position     |

See `specs/SPECIFICATION.md` for complete reference.

## Supported Vendors

Ready adapters exist for:

- Haltech (CSV)
- ECUMaster (CSV)
- RomRaider/Subaru (CSV)
- Speeduino (MLG binary)
- rusEFI (MLG binary)
- AiM (XRK/DRK binary)
- Link (LLG binary)

Planned: MoTeC, AEM, Holley, FuelTech

## Future Considerations

- **Spec Page**: Interactive specification viewer with examples
- **Docs**: Complete documentation for spec implementers
- **Validation Tool**: Paste YAML, validate against schema
- **GitHub App**: Auto-validate adapter PRs
- **API Keys**: For third-party adapter discovery
- **Analytics**: Download counts, popular adapters

## Domain Contract (2026-08-23 — load-bearing, do not "clean up")

- **Primary domain: `https://oecua.org`** (apex). `site.url`, canonicals, sitemap,
  JSON-LD, and robots all declare it. Decision recorded in
  `docs/plans/2026-08-21-cloudflare-workers-migration.md`.
- **openecualliance.org (and www of both domains) 301 to oecua.org** at the
  Cloudflare zone edge from migration Phase 4. Until those 301s have soaked, the
  legacy origins in `server/middleware/03.cors.ts` are INTENTIONAL — do not remove.
- **Email stays on openecualliance.org** (`@openecualliance.org` addresses, SES
  inbound MX on the apex). The web 301s must never touch MX records.
- **Canonical/og:url are per-page**, computed in `app/app.vue` from `site.url` +
  route path. Never add a static canonical or og:url to `nuxt.config.ts` head —
  that reintroduces the homepage-canonical-on-every-page bug.
- **Auth redirects use the current origin** (`app/composables/useAuth.ts`). Every
  origin that serves the site (oecua.org, www, legacy domains until retired,
  workers.dev previews) must be in the Supabase redirect-URL allowlist of the
  OECUA Supabase project (`ljigjawvlwvciqvegptp` — its OWN project, NOT the shared
  CMDIY auth instance). If an origin is missing, GoTrue silently falls back to
  SITE_URL and login breaks on that origin.
- **Cloudflare builds**: `bun run build:cf` (`NITRO_PRESET=cloudflare_module`);
  a plain `bun run build` produces a node-server artifact that must never be
  deployed with wrangler. wrangler is pinned in devDependencies — bump wrangler
  first, `compatibility_date` in wrangler.jsonc second (amendment E5).
