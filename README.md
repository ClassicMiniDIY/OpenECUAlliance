# OpenECU Alliance

The official website for the **OpenECU Spec** - an open specification for standardizing ECU log data formats across the automotive tuning community, with a **public REST API** for programmatic access.

## What is the OpenECU Alliance?

The OpenECU Alliance is an open community that publishes and maintains:

- **The OpenECU Spec** - A YAML-based specification for describing ECU log file formats and channel mappings
- **Public API** - REST endpoints for fetching adapter and protocol specs programmatically
- **Adapter Library** - Community-contributed adapters that map vendor-specific channels to canonical IDs
- **Ecosystem** - Applications and tools that integrate with the OpenECU API

## This Repository

This is the Nuxt 4 website that serves as the public face of the OpenECU Alliance. It provides:

- **Public API** - REST endpoints to fetch specs programmatically (both parsed JSON and raw YAML)
- **Adapter Browser** - Search and explore adapters for different ECU systems
- **Specification Documentation** - Reference for the OpenECU Spec format and API endpoints
- **Ecosystem Showcase** - Applications that integrate with the API like [UltraLog](https://ultralog.co)
- **Contribution Guide** - How to create and submit new adapters

## Public API

All specs are available via public REST API endpoints:

### Adapters

```bash
# List all adapters
GET /api/specs/adapters

# Get specific adapter (parsed JSON)
GET /api/specs/adapters/:vendor/:id

# Download raw YAML
GET /api/specs/adapters-raw/:vendor/:id
```

### Protocols

```bash
# List all protocols
GET /api/specs/protocols

# Get specific protocol (parsed JSON)
GET /api/specs/protocols/:vendor/:id

# Download raw YAML
GET /api/specs/protocols-raw/:vendor/:id
```

### Example Usage

```javascript
// Fetch all adapters
const response = await fetch('https://openecualliance.org/api/specs/adapters');
const adapters = await response.json();

// Fetch specific adapter
const adapter = await fetch('https://openecualliance.org/api/specs/adapters/haltech/haltech-nsp');
const haltechSpec = await adapter.json();
```

See the [full API documentation](https://openecualliance.org/spec#api-endpoints) for details.

## Related Repositories

| Repository                                                           | Description                                               | Status   |
| -------------------------------------------------------------------- | --------------------------------------------------------- | -------- |
| [OECUASpecs](https://github.com/ClassicMiniDIY/OECUASpecs)           | Adapter YAML files, JSON Schema, and formal specification | Archived |
| [OpenECUAlliance](https://github.com/ClassicMiniDIY/OpenECUAlliance) | This website, public API, and all specs                  | Active   |

**Note:** As of January 2026, all specs have been migrated to this repository. The OECUASpecs repository is now archived. Contributions should be made directly to this repository.

## Supported ECU Systems

Adapters are available for:

- Haltech (CSV)
- Link ECU (LLG binary)
- AiM (XRK/DRK binary)
- ECUMaster (CSV)
- Speeduino (MLG binary)
- rusEFI (MLG binary)
- RomRaider/Subaru (CSV)

**Planned:** MoTeC, AEM, Holley, FuelTech

## Development

### Prerequisites

- [Bun](https://bun.sh) runtime
- Node.js 18+

### Setup

```bash
# Clone the repository
git clone https://github.com/ClassicMiniDIY/OpenECUAlliance.git
cd OpenECUAlliance

# Install dependencies
bun install
```

> **Note:** Specs are stored locally in the `specs/` directory and served via API routes. Contributions are made directly to this repository.

### Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
# Production build
bun run build

# Preview production build
bun preview
```

## Tech Stack

- **Framework:** [Nuxt 4](https://nuxt.com)
- **Runtime:** [Bun](https://bun.sh)
- **UI:** [Nuxt UI v4](https://ui.nuxt.com) + Tailwind CSS
- **Icons:** Heroicons, Simple Icons

## Contributing

We welcome contributions! Here's how you can help:

### Contributing Adapters & Protocols

When you contribute adapters or protocols, they become instantly available via the public API:

1. Fork this repository (OpenECUAlliance)
2. Add your YAML file to `specs/adapters/[vendor]/` or `specs/protocols/[vendor]/`
3. Validate your spec against the JSON Schema
4. Submit a pull request
5. Once merged, your spec is instantly available via the API!

See the [Contribution Guide](https://openecualliance.org/contribute) for detailed instructions.

### Contributing to the Website

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[MIT License](LICENSE)
