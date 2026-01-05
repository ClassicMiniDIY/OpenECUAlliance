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
- **Data**: Server API reads YAML from sibling OECUASpecs repo

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
│   └── api/
│       ├── adapters.get.ts           # GET /api/adapters - list all adapters
│       └── adapters/
│           └── [vendor]/
│               └── [id].get.ts       # GET /api/adapters/:vendor/:id - adapter detail
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── nuxt.config.ts                    # Nuxt configuration
├── package.json
└── tsconfig.json
```

## Related Repositories

The OpenECU Alliance spans multiple repositories:

```
../OECUASpecs/               # Single source of truth for adapter YAML files
├── adapters/                # Adapter definitions by vendor
│   ├── haltech/
│   ├── link/
│   ├── aim/
│   └── ...
├── schema/                  # JSON Schema for validation
└── SPECIFICATION.md         # Formal spec document

../OpenECUAlliance/          # This repo - the website
```

The website loads adapters directly from `../OECUASpecs/adapters/` via server API routes.

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

### `GET /api/adapters`
Returns list of all adapters with summary info:

- `id`, `name`, `version`, `vendor`
- `description` (first line only)
- `channelCount`, `categories`, `fileFormat`, `extensions`

### `GET /api/adapters/[vendor]/[id]`
Returns full adapter detail including:

- Complete metadata
- File format details
- All channels with sourceNames

Both routes read YAML files directly from `../OECUASpecs/adapters/`.

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

- Uses Node.js `fs/promises` for file operations
- YAML parsing via `yaml` package
- Transforms snake_case YAML to camelCase responses

### Components

- UCard components used extensively for content blocks
- UBadge for status indicators and metadata tags
- Vendor icons sourced from `useVendorIcons()` composable

## Canonical Channel IDs

Adapters map vendor-specific names to canonical IDs:

| ID | Description | Category |
|----|-------------|----------|
| `rpm` | Engine RPM | engine |
| `tps` | Throttle Position | engine |
| `map` | Manifold Pressure | pressure |
| `afr` | Air-Fuel Ratio | fuel |
| `lambda` | Lambda Value | fuel |
| `coolant_temp` | Coolant Temperature | temperature |
| `iat` | Intake Air Temp | temperature |
| `ignition_advance` | Ignition Timing | ignition |
| `g_lateral` | Lateral G-Force | acceleration |
| `gps_latitude` | GPS Latitude | position |

See `../OECUASpecs/SPECIFICATION.md` for complete reference.

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
