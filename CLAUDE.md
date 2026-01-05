# CLAUDE.md

This file provides guidance to Claude Code when working with the OpenECU Alliance codebase.

## Project Overview

OpenECU Alliance is a community-driven initiative to standardize ECU (Engine Control Unit) log data formats. This Nuxt 4 application serves as:

1. **Specification Host** - The authoritative source for the OpenECU Alliance adapter specification
2. **Adapter Marketplace** - A registry where users can discover, browse, and download community-contributed adapters
3. **Documentation Hub** - Guides for creating adapters, integrating with the spec, and contributing

## Tech Stack

- **Framework**: Nuxt 4
- **Runtime**: Bun
- **Styling**: TBD (likely Tailwind CSS + shadcn-vue)
- **Database**: TBD (likely Supabase or similar for adapter registry)

## Repository Structure

```
OpenECUAlliance/
├── app/                    # Nuxt application
│   ├── components/         # Vue components
│   ├── pages/              # Route pages
│   ├── layouts/            # Page layouts
│   └── app.vue             # Root component
├── spec/                   # OpenECU Alliance Specification
│   ├── README.md           # Spec overview
│   ├── SPECIFICATION.md    # Formal specification document
│   ├── schema/             # JSON Schema for validation
│   │   └── adapter.schema.json
│   └── examples/           # Example adapter files
│       └── haltech-nsp.adapter.yaml
├── public/                 # Static assets
├── nuxt.config.ts          # Nuxt configuration
└── package.json
```

## Site Structure (Planned)

### Pages

- `/` - Landing page explaining OpenECU Alliance mission
- `/spec` - Interactive specification documentation
- `/adapters` - Marketplace/registry of available adapters
- `/adapters/[vendor]` - Adapters filtered by vendor
- `/adapters/[vendor]/[id]` - Individual adapter detail page
- `/docs` - Documentation for creating adapters
- `/docs/getting-started` - Quick start guide
- `/docs/creating-adapters` - How to create an adapter
- `/docs/integrating` - How applications can integrate the spec
- `/contribute` - How to contribute adapters to the registry

### Features to Build

1. **Spec Viewer**
   - Render SPECIFICATION.md as interactive documentation
   - Syntax highlighting for YAML examples
   - JSON Schema explorer

2. **Adapter Registry**
   - Browse adapters by vendor, category, popularity
   - Search functionality
   - Adapter detail pages with:
     - Channel list
     - Download/copy YAML
     - Version history
     - Compatibility info

3. **Adapter Submission**
   - GitHub-based submission (PRs to adapter repo)
   - Or direct submission with validation
   - JSON Schema validation before acceptance

4. **Validation Tool**
   - Paste/upload adapter YAML
   - Validate against JSON Schema
   - Show errors and suggestions

## Key Concepts

### Adapters

An adapter is a YAML file that describes how to parse ECU log files and map vendor-specific channel names to canonical identifiers. See `spec/SPECIFICATION.md` for the full format.

### Canonical Channel IDs

Standardized identifiers (snake_case) that all adapters map to:
- `rpm` - Engine RPM
- `coolant_temp` - Coolant temperature
- `afr` - Air-fuel ratio
- `tps` - Throttle position
- etc.

### Vendors

ECU manufacturers whose log formats can have adapters:
- Haltech
- Link
- AiM
- ECUMaster
- MoTeC
- AEM
- Holley
- FuelTech
- MegaSquirt
- Speeduino
- rusEFI

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

- Clean, professional aesthetic suitable for automotive/motorsport audience
- Dark mode support (many users in garage/shop environments)
- Mobile-responsive for pit lane/trackside access
- Fast - minimal JavaScript, leverage Nuxt SSR/SSG

## Integration Points

### UltraLog

The primary consumer of OpenECU Alliance adapters. UltraLog can:
- Ship with built-in adapters (compiled at build time)
- Load community adapters at runtime from `~/.ultralog/adapters/`
- Link to marketplace for discovering new adapters

### Other Tools

Any ECU analysis tool can adopt the spec:
- Dyno software
- Tuning suites
- Data overlay tools
- Telemetry systems

## Future Considerations

- **API**: REST/GraphQL API for programmatic adapter discovery
- **CLI Tool**: `openecualliance validate adapter.yaml`
- **GitHub App**: Auto-validate adapter PRs
- **Versioning**: Track adapter versions, show changelogs
- **Analytics**: Popular adapters, download counts
- **Comments/Ratings**: Community feedback on adapters
