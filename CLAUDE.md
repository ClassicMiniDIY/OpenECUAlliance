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

## Architecture

### Related Repositories

The OpenECU Alliance spans multiple repositories:

```
../OECUASpecs/           # Single source of truth for adapter YAML files
├── adapters/            # Adapter definitions by vendor
│   ├── haltech/
│   ├── link/
│   ├── aim/
│   └── ...
├── schema/              # JSON Schema for validation
└── SPECIFICATION.md     # Formal spec document

../OpenECUAlliance/      # This repo - the website
├── app/                 # Nuxt application
├── server/              # Server API (loads adapters from OECUASpecs)
└── ...
```

The website loads adapters directly from `../OECUASpecs/adapters/` via server API routes.

## Tech Stack

- **Framework**: Nuxt 4
- **Runtime**: Bun
- **UI**: Nuxt UI v4 + Tailwind CSS
- **Icons**: Heroicons, Simple Icons (via @nuxt/icon)
- **Data**: Server API reads YAML from OECUASpecs repo

## Repository Structure

```
OpenECUAlliance/
├── app/
│   ├── components/
│   │   ├── AppHeader.vue       # Navigation with dark mode toggle
│   │   ├── AppFooter.vue       # Footer links
│   │   └── AdapterCard.vue     # Adapter listing card
│   ├── composables/
│   │   └── useAdapters.ts      # Adapter data composable
│   ├── pages/
│   │   ├── index.vue           # Landing page
│   │   ├── adapters/
│   │   │   ├── index.vue       # Adapter marketplace
│   │   │   └── [vendor]/
│   │   │       └── [id].vue    # Adapter detail
│   │   ├── ecosystem.vue       # Spec-compatible apps
│   │   ├── spec.vue            # Specification docs
│   │   ├── docs.vue            # Documentation
│   │   └── contribute.vue      # Contribution guide
│   ├── types/
│   │   └── adapter.ts          # TypeScript interfaces
│   └── app.vue                 # Root component
├── server/
│   └── api/
│       ├── adapters.get.ts     # List all adapters
│       └── adapters/
│           └── [vendor]/
│               └── [id].get.ts # Get adapter detail
├── nuxt.config.ts
└── package.json
```

## Key Pages

### `/` - Landing Page
- Hero section introducing OpenECU Spec
- "What is OpenECU Alliance?" explainer (Alliance vs Spec vs Ecosystem)
- Spec-compatible applications showcase
- Supported vendors with ready/planned status
- Developer sections for using and contributing

### `/adapters` - Adapter Marketplace
- Grid of adapter cards with search/filter
- Filter by vendor, category, file format
- Links to individual adapter detail pages

### `/adapters/[vendor]/[id]` - Adapter Detail
- Full channel listing grouped by category
- File format details
- Source name mappings (popover)
- Metadata and known issues

### `/ecosystem` - Ecosystem Page
- Spec-compatible applications
- Libraries and SDKs
- Project donation information

## API Routes

### `GET /api/adapters`
Returns list of all adapters with summary info (id, name, version, vendor, channelCount, etc.)

### `GET /api/adapters/[vendor]/[id]`
Returns full adapter detail including all channels and metadata.

Both routes read YAML files directly from `../OECUASpecs/adapters/`.

## Build Commands

```bash
# Install dependencies
bun install

# Development server
bun dev

# Build for production
bun run build

# Preview production build
bun preview
```

## Design Guidelines

- Clean, professional aesthetic for automotive/motorsport audience
- Dark mode support (default for many users)
- Mobile-responsive for pit lane/trackside access
- Fast - leverage Nuxt SSR, minimal client JS
- Consistent use of Nuxt UI components
- Icons from Heroicons for UI, Simple Icons for brands

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
