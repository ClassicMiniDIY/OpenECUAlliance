# OpenECU Alliance

The official website for the **OpenECU Spec** - an open specification for standardizing ECU log data formats across the automotive tuning community.

## What is the OpenECU Alliance?

The OpenECU Alliance is an open community that publishes and maintains:

- **The OpenECU Spec** - A YAML-based specification for describing ECU log file formats and channel mappings
- **Adapter Library** - Community-contributed adapters that map vendor-specific channels to canonical IDs
- **Ecosystem** - Spec-compatible applications and tools that work with any ECU system

## This Repository

This is the Nuxt 4 website that serves as the public face of the OpenECU Alliance. It provides:

- **Adapter Browser** - Search and explore adapters for different ECU systems
- **Specification Documentation** - Reference for the OpenECU Spec format
- **Ecosystem Showcase** - Spec-compatible applications like [UltraLog](https://ultralog.co)
- **Contribution Guide** - How to create and submit new adapters

## Related Repositories

| Repository                                                           | Description                                               |
| -------------------------------------------------------------------- | --------------------------------------------------------- |
| [OECUASpecs](https://github.com/ClassicMiniDIY/OECUASpecs)           | Adapter YAML files, JSON Schema, and formal specification |
| [OpenECUAlliance](https://github.com/ClassicMiniDIY/OpenECUAlliance) | This website                                              |

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

> **Note:** Adapter data is fetched directly from the [OECUASpecs](https://github.com/ClassicMiniDIY/OECUASpecs) GitHub repository at runtime.

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

### Contributing Adapters

1. Fork the [OECUASpecs](https://github.com/ClassicMiniDIY/OECUASpecs) repository
2. Create a YAML adapter following the specification
3. Submit a pull request

See the [Contribution Guide](https://openecualliance.org/contribute) for detailed instructions.

### Contributing to the Website

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[MIT License](LICENSE)
