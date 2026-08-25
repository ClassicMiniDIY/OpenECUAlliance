# OpenECU Alliance

The official website for the **OpenECU Spec** - an open specification for standardizing ECU log data formats and CAN broadcast protocols across the automotive tuning community, with a **public REST API** for programmatic access.

**Live site:** [oecua.org](https://oecua.org)

## What is the OpenECU Alliance?

The OpenECU Alliance is an open community that publishes and maintains:

- **The OpenECU Spec** - A YAML-based specification for describing ECU log file formats, CAN broadcast protocols, and channel mappings
- **Canonical Channel Registry** - 466 canonical channel IDs across 20 categories (`specs/channels.yaml`), the shared vocabulary every adapter and protocol maps onto
- **Public API** - REST endpoints for fetching adapter and protocol specs programmatically
- **Adapter Library** - Community-contributed adapters that map vendor-specific channels to canonical IDs
- **Protocol Library** - CAN broadcast definitions (message IDs, signal bit layouts, scaling)
- **3D Model Library** - Community-contributed printable ECU mounts, enclosures, brackets, and accessories
- **Ecosystem** - Applications and tools that integrate with the OpenECU API, like [UltraLog](https://ultralog.co)

## This Repository

This is the Nuxt 4 website that serves as the public face of the OpenECU Alliance. It provides:

- **Public API** - REST endpoints to fetch specs programmatically (parsed JSON and raw YAML)
- **Adapter & Protocol Browsers** - Search and explore specs with fuzzy channel/signal search
- **Specification & Docs** - The full spec reference at `/spec` and guides at `/docs`
- **3D Model Sharing** - Upload models or link them from Printables, Thingiverse, MakerWorld, and Cults3D, with comments, likes, and ratings
- **Ecosystem Showcase** - Applications that integrate with the API
- **Contribution Guide** - How to create and submit new adapters and protocols

The specs themselves live in this repository under `specs/` and are validated on every deploy.

## Public API

### Parsed JSON

```bash
# List all adapters / protocols (summary info)
GET /api/adapters
GET /api/protocols

# Full detail (channels, signals, sourceNames; supports ?version=X.Y.Z)
GET /api/adapters/:vendor/:id
GET /api/protocols/:vendor/:id
```

### Raw YAML

```bash
# Lists with download URLs
GET /api/specs/adapters
GET /api/specs/protocols

# Download the raw YAML file (supports ?version=X.Y.Z)
GET /api/specs/adapters/:vendor/:id/raw
GET /api/specs/protocols/:vendor/:id/raw
```

### Example Usage

```javascript
// Fetch all adapters
const response = await fetch('https://oecua.org/api/adapters');
const adapters = await response.json();

// Fetch specific adapter
const adapter = await fetch('https://oecua.org/api/adapters/haltech/haltech-nsp');
const haltechSpec = await adapter.json();
```

See the [full API documentation](https://oecua.org/spec#api-endpoints) for details.

## Related Repositories

| Repository                                                           | Description                                               | Status   |
| -------------------------------------------------------------------- | --------------------------------------------------------- | -------- |
| [OECUASpecs](https://github.com/ClassicMiniDIY/OECUASpecs)           | Former home of the adapter YAML files                     | Archived |
| [OpenECUAlliance](https://github.com/ClassicMiniDIY/OpenECUAlliance) | This website, public API, and all specs                   | Active   |

**Note:** As of January 2026, all specs live in this repository. The OECUASpecs repository is archived; contribute directly here.

## Supported ECU Systems

### Log Adapters

- Haltech (NSP CSV)
- Link ECU (LLG binary)
- AiM (XRK/DRK binary)
- ECUMaster EMU (CSV)
- Speeduino (MLG binary)
- rusEFI (MLG binary)
- RomRaider / Subaru (CSV)
- MegaSquirt (TunerStudio CSV)
- Emerald K6/M3D (binary)

### CAN Broadcast Protocols

- Haltech Elite
- AEM Infinity
- ECUMaster EMU
- Emtron
- MaxxECU
- MegaSquirt
- rusEFI
- Speeduino
- Syvecs S7

**Planned log adapters:** MoTeC, AEM, Holley, FuelTech — see `specs/protocols/PROTOCOL_ROADMAP.md` for the protocol roadmap.

## Development

### Prerequisites

- [Bun](https://bun.sh) runtime

### Setup

```bash
git clone https://github.com/ClassicMiniDIY/OpenECUAlliance.git
cd OpenECUAlliance
bun install
```

### Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Deploy

Production runs on **Cloudflare Workers**:

```bash
# Cloudflare Workers bundle (what production runs)
bun run build:cf

# Run the worker locally on workerd
bun run build:cf && bunx wrangler dev

# Node build — local preview only, NOT deployable to Workers
bun run build
bun preview
```

Deploys happen automatically from `main` via GitHub Actions.

### Validating Specs

```bash
# Validate every adapter and protocol against the canonical registry
bun run validate:specs

# Regenerate specs/SPECIFICATION.md from specs/channels.yaml
bun run generate:spec-doc
```

`validate:specs` gates the deploy workflow — it checks channel IDs, categories, unit conversions, CAN IDs, signal overlaps, and frame overflows.

## Tech Stack

- **Framework:** [Nuxt 4](https://nuxt.com)
- **Runtime:** [Bun](https://bun.sh)
- **UI:** [Nuxt UI v4](https://ui.nuxt.com) + Tailwind CSS
- **Icons:** Heroicons, Lucide, Simple Icons
- **Auth & Community Data:** [Supabase](https://supabase.com) (magic-link auth, models, comments, likes, ratings)
- **Hosting:** Cloudflare Workers

## Contributing

### Contributing Adapters & Protocols

When you contribute adapters or protocols, they become available via the public API shortly after merge:

1. Fork this repository
2. Add your YAML file to `specs/adapters/[vendor]/` or `specs/protocols/[vendor]/`
3. Run `bun run validate:specs` and fix anything it flags
4. Submit a pull request

See the [Contribution Guide](https://oecua.org/contribute) for detailed instructions.

### Contributing to the Website

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[GPL-3.0](LICENSE)
