<script setup lang="ts">
useSeoMeta({
  title: "Specification - OpenECU Alliance",
  description:
    "The formal OpenECU Spec adapter specification document. Version 1.0",
});

const sections = [
  { id: "introduction", label: "Introduction" },
  { id: "file-format", label: "File Format" },
  { id: "root-structure", label: "Root Structure" },
  { id: "file-format-spec", label: "File Format Spec" },
  { id: "channels", label: "Channel Definitions" },
  { id: "channel-ids", label: "Canonical Channel IDs" },
  { id: "units", label: "Units Reference" },
  { id: "metadata", label: "Metadata" },
  { id: "validation", label: "Validation" },
  { id: "conversions", label: "Unit Conversions" },
];

const activeSection = ref("introduction");

const canonicalChannels = [
  { id: "rpm", name: "Engine RPM", category: "engine" },
  { id: "tps", name: "Throttle Position", category: "engine" },
  { id: "map", name: "Manifold Absolute Pressure", category: "pressure" },
  { id: "maf", name: "Mass Air Flow", category: "engine" },
  { id: "ignition_advance", name: "Ignition Timing", category: "ignition" },
  { id: "duty_cycle", name: "Injector Duty Cycle", category: "fuel" },
  { id: "pulse_width", name: "Injector Pulse Width", category: "fuel" },
  {
    id: "coolant_temp",
    name: "Coolant Temperature",
    category: "temperature",
  },
  { id: "iat", name: "Intake Air Temperature", category: "temperature" },
  { id: "oil_temp", name: "Oil Temperature", category: "temperature" },
  { id: "egt", name: "Exhaust Gas Temperature", category: "temperature" },
  { id: "afr", name: "Air-Fuel Ratio", category: "fuel" },
  { id: "afr_target", name: "Target AFR", category: "fuel" },
  { id: "lambda", name: "Lambda", category: "fuel" },
  { id: "fuel_pressure", name: "Fuel Pressure", category: "pressure" },
  { id: "boost", name: "Boost Pressure", category: "pressure" },
  { id: "oil_pressure", name: "Oil Pressure", category: "pressure" },
  { id: "barometric", name: "Barometric Pressure", category: "pressure" },
  { id: "battery_voltage", name: "Battery Voltage", category: "electrical" },
  { id: "vehicle_speed", name: "Vehicle Speed", category: "speed" },
  { id: "gear", name: "Current Gear", category: "drivetrain" },
  { id: "knock_retard", name: "Knock Retard", category: "correction" },
  { id: "knock_level", name: "Knock Level", category: "correction" },
  { id: "ego_correction", name: "EGO Correction", category: "correction" },
  { id: "g_lateral", name: "Lateral G-Force", category: "acceleration" },
  {
    id: "g_longitudinal",
    name: "Longitudinal G-Force",
    category: "acceleration",
  },
  { id: "gps_latitude", name: "GPS Latitude", category: "position" },
  { id: "gps_longitude", name: "GPS Longitude", category: "position" },
  { id: "lap_time", name: "Lap Time", category: "timing" },
  { id: "steering_angle", name: "Steering Angle", category: "driver_input" },
];

const categories = [
  {
    id: "engine",
    name: "Engine",
    description: "Core engine parameters (RPM, TPS, MAP, VVT)",
  },
  {
    id: "fuel",
    name: "Fuel",
    description: "Fuel system (AFR, injector data, fuel pressure)",
  },
  {
    id: "ignition",
    name: "Ignition",
    description: "Ignition system (timing, dwell, knock)",
  },
  {
    id: "temperature",
    name: "Temperature",
    description: "Temperature sensors",
  },
  { id: "pressure", name: "Pressure", description: "Pressure sensors" },
  {
    id: "electrical",
    name: "Electrical",
    description: "Electrical system (voltage, current)",
  },
  {
    id: "speed",
    name: "Speed",
    description: "Speed measurements (vehicle, wheel)",
  },
  {
    id: "drivetrain",
    name: "Drivetrain",
    description: "Transmission and drivetrain",
  },
  {
    id: "correction",
    name: "Correction",
    description: "ECU corrections and trims",
  },
  {
    id: "acceleration",
    name: "Acceleration",
    description: "G-force measurements",
  },
  { id: "position", name: "Position", description: "GPS and position data" },
  {
    id: "timing",
    name: "Timing",
    description: "Lap timing and session data",
  },
  {
    id: "driver_input",
    name: "Driver Input",
    description: "Steering, brake, throttle inputs",
  },
  { id: "custom", name: "Custom", description: "ECU-specific channels" },
];

const unitCategories = [
  {
    category: "Temperature",
    units: ["celsius", "fahrenheit", "kelvin"],
  },
  {
    category: "Pressure",
    units: ["kpa", "psi", "bar", "mbar", "inhg"],
  },
  {
    category: "Speed",
    units: ["rpm", "kph", "mph", "m/s"],
  },
  {
    category: "Volume",
    units: ["liters", "gallons", "cc"],
  },
  {
    category: "Flow",
    units: ["cc/min", "lb/hr", "kg/hr"],
  },
  {
    category: "Ratio",
    units: ["afr", "lambda", "percent"],
  },
  {
    category: "Time",
    units: ["seconds", "milliseconds", "microseconds"],
  },
  {
    category: "Electrical",
    units: ["volts", "millivolts", "amps", "milliamps"],
  },
  {
    category: "Distance",
    units: ["meters", "kilometers", "miles", "feet"],
  },
  {
    category: "Angle",
    units: ["degrees", "radians"],
  },
];

const conversions = [
  { from: "fahrenheit", to: "celsius", formula: "(x - 32) * 5/9" },
  { from: "celsius", to: "fahrenheit", formula: "x * 9/5 + 32" },
  { from: "psi", to: "kpa", formula: "x * 6.89476" },
  { from: "kpa", to: "psi", formula: "x * 0.145038" },
  { from: "bar", to: "kpa", formula: "x * 100" },
  { from: "kpa", to: "bar", formula: "x / 100" },
  { from: "inhg", to: "kpa", formula: "x * 3.38639" },
  { from: "mph", to: "kph", formula: "x * 1.60934" },
  { from: "kph", to: "mph", formula: "x * 0.621371" },
  { from: "gallons", to: "liters", formula: "x * 3.78541" },
  { from: "lambda", to: "afr", formula: "x * 14.7" },
  { from: "afr", to: "lambda", formula: "x / 14.7" },
];

// Code examples for syntax highlighting
const codeExamples = {
  rootStructure: `openecualliance: "1.0"        # Required: Spec version
id: string                     # Required: Unique adapter identifier
name: string                   # Required: Human-readable name
version: string                # Required: Adapter version (semver)
vendor: string                 # Required: ECU vendor/manufacturer
description: string            # Optional: Detailed description
website: string                # Optional: URL for more information
branding: object               # Optional: Brand assets
file_format: object            # Required: File format specification
channels: array                # Required: Channel definitions
metadata: object               # Optional: Additional metadata`,

  branding: `branding:
  logo: haltech-logo.svg           # Full logo
  icon: haltech-icon.svg           # Square icon
  color_primary: "#FFBE1A"         # Primary brand color
  color_secondary: "#1A1A1A"       # Secondary brand color`,

  csvFormat: `file_format:
  type: csv
  extensions: [".csv", ".log"]
  encoding: utf-8                    # Optional, default: utf-8
  delimiter: ","                     # Required for CSV
  quote_char: "\\""                   # Optional, default: "
  header_row: 0                      # Required: 0-indexed row number
  unit_row: 1                        # Optional: Row containing units
  data_start_row: 2                  # Required: First data row
  comment_prefix: "#"                # Optional: Lines to ignore
  timestamp_column: "Time"           # Optional: Time column name
  timestamp_unit: seconds            # Optional: seconds, milliseconds`,

  binaryFormat: `file_format:
  type: binary
  extensions: [".llg", ".mlg"]
  endianness: little                 # Required: little or big
  magic_bytes: [0x4D, 0x4C, 0x47]   # Optional: File signature
  header_size: 512                   # Optional: Header size in bytes
  record_size: variable              # Optional: fixed or variable
  specification_url: "https://..."   # Optional: Link to format docs`,

  channelDefinitions: `channels:
  - id: rpm                          # Required: Canonical identifier
    name: "Engine RPM"               # Required: Display name
    description: "Engine speed"      # Optional: Detailed description
    category: engine                 # Required: Channel category
    data_type: float                 # Required: Data type
    unit: rpm                        # Required: Canonical unit
    min: 0                           # Optional: Minimum valid value
    max: 20000                       # Optional: Maximum valid value
    precision: 0                     # Optional: Decimal places
    source_names:                    # Required: Vendor-specific names
      - "Engine RPM"
      - "RPM"
      - "Engine Speed"
    source_unit: null                # Optional: If different from canonical
    conversion: null                 # Optional: Unit conversion formula
    tags: ["critical", "primary"]    # Optional: Searchable tags`,

  conversion: `conversion: "(x - 32) * 5/9"  # Fahrenheit to Celsius`,

  metadata: `metadata:
  author: "OpenECU Alliance"
  license: "MIT"
  repository: "https://github.com/openecualliance/adapters"
  tested_with:
    - "Haltech Elite 2500"
    - "Haltech Nexus R5"
  known_issues:
    - "Time column may be missing on older NSP versions"
  changelog:
    - version: "1.0.0"
      date: "2024-01-15"
      changes:
        - "Initial release"`,

  validation: `# Using ajv-cli (Node.js)
npm install -g ajv-cli
ajv validate -s schema/adapter.schema.json -d your-adapter.yaml

# Using check-jsonschema (Python)
pip install check-jsonschema
check-jsonschema --schemafile schema/adapter.schema.json your-adapter.yaml`,
};
</script>

<template>
  <div class="py-8 px-4">
    <UContainer>
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar Navigation -->
        <aside class="lg:w-56 shrink-0">
          <div class="lg:sticky lg:top-20">
            <h3 class="font-semibold text-sm text-muted mb-3">On this page</h3>
            <nav class="space-y-1">
              <a
                v-for="section in sections"
                :key="section.id"
                :href="`#${section.id}`"
                class="block text-sm py-1.5 px-2 rounded-md transition-colors"
                :class="
                  activeSection === section.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted hover:text-default hover:bg-muted/50'
                "
                @click="activeSection = section.id"
              >
                {{ section.label }}
              </a>
            </nav>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 min-w-0">
          <div class="mb-8">
            <UBadge color="primary" variant="subtle" class="mb-4">
              Version 1.0.0-draft
            </UBadge>
            <h1 class="text-3xl sm:text-4xl font-bold mb-2">
              OpenECU Spec Specification
            </h1>
            <p class="text-lg text-muted">
              The formal specification for OpenECU adapter files.
            </p>
          </div>

          <!-- Introduction -->
          <section id="introduction" class="mb-12 scroll-mt-20">
            <h2 class="text-2xl font-bold mb-4">1. Introduction</h2>
            <div class="prose prose-neutral dark:prose-invert max-w-none">
              <p class="text-muted">
                This document defines the OpenECU Alliance adapter specification
                format. An adapter is a declarative description of how to
                interpret ECU log files and map their channels to standardized
                identifiers.
              </p>

              <h3 class="text-lg font-semibold mt-6 mb-3">Design Principles</h3>
              <div class="grid sm:grid-cols-2 gap-4 not-prose">
                <UCard>
                  <div class="flex items-start gap-3">
                    <UIcon
                      name="i-heroicons-document-duplicate"
                      class="size-5 text-primary shrink-0 mt-0.5"
                    />
                    <div>
                      <h4 class="font-semibold">Self-Contained</h4>
                      <p class="text-sm text-muted">
                        Each adapter contains complete channel definitions. No
                        external references required.
                      </p>
                    </div>
                  </div>
                </UCard>
                <UCard>
                  <div class="flex items-start gap-3">
                    <UIcon
                      name="i-heroicons-document-text"
                      class="size-5 text-primary shrink-0 mt-0.5"
                    />
                    <div>
                      <h4 class="font-semibold">Declarative</h4>
                      <p class="text-sm text-muted">
                        Adapters describe what data looks like, not how to parse
                        it programmatically.
                      </p>
                    </div>
                  </div>
                </UCard>
                <UCard>
                  <div class="flex items-start gap-3">
                    <UIcon
                      name="i-heroicons-globe-alt"
                      class="size-5 text-primary shrink-0 mt-0.5"
                    />
                    <div>
                      <h4 class="font-semibold">Language Agnostic</h4>
                      <p class="text-sm text-muted">
                        YAML format parseable by any programming language.
                      </p>
                    </div>
                  </div>
                </UCard>
                <UCard>
                  <div class="flex items-start gap-3">
                    <UIcon
                      name="i-heroicons-puzzle-piece"
                      class="size-5 text-primary shrink-0 mt-0.5"
                    />
                    <div>
                      <h4 class="font-semibold">Extensible</h4>
                      <p class="text-sm text-muted">
                        Custom channels and metadata are first-class citizens.
                      </p>
                    </div>
                  </div>
                </UCard>
              </div>

              <h3 class="text-lg font-semibold mt-6 mb-3">Terminology</h3>
              <div class="not-prose">
                <UCard>
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead>
                        <tr class="border-b border-default">
                          <th class="text-left py-2 pr-4 font-semibold">
                            Term
                          </th>
                          <th class="text-left py-2 font-semibold">
                            Definition
                          </th>
                        </tr>
                      </thead>
                      <tbody class="text-muted">
                        <tr class="border-b border-default">
                          <td class="py-2 pr-4 font-medium text-default">
                            Adapter
                          </td>
                          <td class="py-2">
                            A complete specification file describing an ECU log
                            format
                          </td>
                        </tr>
                        <tr class="border-b border-default">
                          <td class="py-2 pr-4 font-medium text-default">
                            Channel
                          </td>
                          <td class="py-2">
                            A single data stream (e.g., RPM, coolant
                            temperature)
                          </td>
                        </tr>
                        <tr class="border-b border-default">
                          <td class="py-2 pr-4 font-medium text-default">
                            Canonical ID
                          </td>
                          <td class="py-2">
                            The standardized identifier for a channel
                            (snake_case)
                          </td>
                        </tr>
                        <tr class="border-b border-default">
                          <td class="py-2 pr-4 font-medium text-default">
                            Source Name
                          </td>
                          <td class="py-2">
                            The vendor-specific name as it appears in log files
                          </td>
                        </tr>
                        <tr>
                          <td class="py-2 pr-4 font-medium text-default">
                            Unit
                          </td>
                          <td class="py-2">
                            The measurement unit for a channel's values
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </UCard>
              </div>
            </div>
          </section>

          <!-- File Format -->
          <section id="file-format" class="mb-12 scroll-mt-20">
            <h2 class="text-2xl font-bold mb-4">2. File Format</h2>
            <div class="space-y-4">
              <UCard>
                <div class="space-y-4">
                  <div>
                    <h4 class="font-semibold mb-2">File Extension</h4>
                    <p class="text-sm text-muted">
                      Adapter files MUST use the extension
                      <code class="bg-muted px-1.5 py-0.5 rounded text-primary"
                        >.adapter.yaml</code
                      >
                      or
                      <code class="bg-muted px-1.5 py-0.5 rounded text-primary"
                        >.adapter.yml</code
                      >.
                    </p>
                  </div>
                  <div>
                    <h4 class="font-semibold mb-2">Encoding</h4>
                    <p class="text-sm text-muted">
                      Files MUST be encoded as UTF-8.
                    </p>
                  </div>
                  <div>
                    <h4 class="font-semibold mb-2">YAML Version</h4>
                    <p class="text-sm text-muted">
                      Files SHOULD be valid YAML 1.2.
                    </p>
                  </div>
                </div>
              </UCard>
            </div>
          </section>

          <!-- Root Structure -->
          <section id="root-structure" class="mb-12 scroll-mt-20">
            <h2 class="text-2xl font-bold mb-4">3. Root Structure</h2>
            <p class="text-muted mb-4">
              An adapter file MUST contain the following root-level fields:
            </p>

            <UCard class="mb-6">
              <CodeBlock lang="yaml" :code="codeExamples.rootStructure" />
            </UCard>

            <div class="space-y-4">
              <UCard>
                <h4 class="font-semibold mb-2">
                  <code class="text-primary">openecualliance</code>
                  <UBadge color="error" variant="subtle" size="md" class="ml-2"
                    >Required</UBadge
                  >
                </h4>
                <p class="text-sm text-muted mb-2">
                  The specification version this adapter conforms to. Currently
                  <code class="bg-muted px-1 rounded">"1.0"</code>.
                </p>
              </UCard>

              <UCard>
                <h4 class="font-semibold mb-2">
                  <code class="text-primary">id</code>
                  <UBadge color="error" variant="subtle" size="md" class="ml-2"
                    >Required</UBadge
                  >
                </h4>
                <p class="text-sm text-muted mb-2">
                  A unique identifier for this adapter. MUST be lowercase
                  alphanumeric with hyphens. MUST be globally unique within the
                  registry.
                </p>
                <p class="text-sm text-muted">
                  Naming convention:
                  <code class="bg-muted px-1 rounded">{vendor}-{format}</code>
                  or
                  <code class="bg-muted px-1 rounded"
                    >{vendor}-{product}-{format}</code
                  >
                </p>
                <div class="mt-2 text-sm text-muted">
                  Examples:
                  <code class="bg-muted px-1 rounded">haltech-nsp</code>,
                  <code class="bg-muted px-1 rounded">link-llg</code>,
                  <code class="bg-muted px-1 rounded">aim-xrk</code>
                </div>
              </UCard>

              <UCard>
                <h4 class="font-semibold mb-2">
                  <code class="text-primary">version</code>
                  <UBadge color="error" variant="subtle" size="md" class="ml-2"
                    >Required</UBadge
                  >
                </h4>
                <p class="text-sm text-muted">
                  Semantic version of the adapter itself. MUST follow
                  <a
                    href="https://semver.org/"
                    target="_blank"
                    class="text-primary hover:underline"
                    >semver</a
                  >.
                </p>
              </UCard>

              <UCard>
                <h4 class="font-semibold mb-2">
                  <code class="text-primary">vendor</code>
                  <UBadge color="error" variant="subtle" size="md" class="ml-2"
                    >Required</UBadge
                  >
                </h4>
                <p class="text-sm text-muted mb-2">
                  The ECU vendor or manufacturer. Use lowercase.
                </p>
                <div class="flex flex-wrap gap-1 mt-2">
                  <UBadge
                    v-for="v in [
                      'haltech',
                      'link',
                      'aim',
                      'ecumaster',
                      'motec',
                      'aem',
                      'holley',
                      'fueltech',
                      'speeduino',
                      'rusefi',
                    ]"
                    :key="v"
                    color="neutral"
                    variant="subtle"
                    size="md"
                  >
                    {{ v }}
                  </UBadge>
                </div>
              </UCard>

              <UCard>
                <h4 class="font-semibold mb-2">
                  <code class="text-primary">branding</code>
                  <UBadge
                    color="neutral"
                    variant="subtle"
                    size="md"
                    class="ml-2"
                    >Optional</UBadge
                  >
                </h4>
                <p class="text-sm text-muted mb-3">
                  Vendor branding assets for display in applications.
                </p>
                <CodeBlock lang="yaml" :code="codeExamples.branding" />
              </UCard>
            </div>
          </section>

          <!-- File Format Spec -->
          <section id="file-format-spec" class="mb-12 scroll-mt-20">
            <h2 class="text-2xl font-bold mb-4">
              4. File Format Specification
            </h2>
            <p class="text-muted mb-4">
              The
              <code class="bg-muted px-1.5 py-0.5 rounded">file_format</code>
              object describes how to parse the log file.
            </p>

            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-semibold mb-3">CSV Format</h3>
                <UCard>
                  <CodeBlock lang="yaml" :code="codeExamples.csvFormat" />
                </UCard>
              </div>

              <div>
                <h3 class="text-lg font-semibold mb-3">Binary Format</h3>
                <UCard>
                  <CodeBlock lang="yaml" :code="codeExamples.binaryFormat" />
                </UCard>
              </div>
            </div>
          </section>

          <!-- Channel Definitions -->
          <section id="channels" class="mb-12 scroll-mt-20">
            <h2 class="text-2xl font-bold mb-4">5. Channel Definitions</h2>
            <p class="text-muted mb-4">
              The
              <code class="bg-muted px-1.5 py-0.5 rounded">channels</code>
              array contains definitions for each data channel.
            </p>

            <UCard class="mb-6">
              <CodeBlock lang="yaml" :code="codeExamples.channelDefinitions" />
            </UCard>

            <div class="space-y-4">
              <UCard>
                <h4 class="font-semibold mb-2">
                  <code class="text-primary">data_type</code>
                </h4>
                <p class="text-sm text-muted mb-2">
                  The data type of channel values. MUST be one of:
                </p>
                <div class="flex flex-wrap gap-2">
                  <UBadge color="neutral" variant="outline" size="sm"
                    >float</UBadge
                  >
                  <UBadge color="neutral" variant="outline" size="sm"
                    >int</UBadge
                  >
                  <UBadge color="neutral" variant="outline" size="sm"
                    >bool</UBadge
                  >
                  <UBadge color="neutral" variant="outline" size="sm"
                    >string</UBadge
                  >
                  <UBadge color="neutral" variant="outline" size="sm"
                    >enum</UBadge
                  >
                </div>
              </UCard>

              <UCard>
                <h4 class="font-semibold mb-2">
                  <code class="text-primary">source_names</code>
                </h4>
                <p class="text-sm text-muted">
                  Array of names this channel may appear as in the log file.
                  Case-insensitive matching is RECOMMENDED. Add ALL variations
                  you've seen in real log files.
                </p>
              </UCard>

              <UCard>
                <h4 class="font-semibold mb-2">
                  <code class="text-primary">conversion</code>
                </h4>
                <p class="text-sm text-muted mb-2">
                  Formula to convert from source unit to canonical unit. Use
                  <code class="bg-muted px-1 rounded">x</code> as the input
                  variable.
                </p>
                <CodeBlock lang="yaml" :code="codeExamples.conversion" />
              </UCard>
            </div>
          </section>

          <!-- Canonical Channel IDs -->
          <section id="channel-ids" class="mb-12 scroll-mt-20">
            <h2 class="text-2xl font-bold mb-4">6. Canonical Channel IDs</h2>
            <p class="text-muted mb-4">
              Recommended standardized channel identifiers. Custom IDs are
              permitted for ECU-specific channels not in this list.
            </p>

            <UCard>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-default">
                      <th class="text-left py-2 pr-4 font-semibold">ID</th>
                      <th class="text-left py-2 pr-4 font-semibold">Name</th>
                      <th class="text-left py-2 font-semibold">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="channel in canonicalChannels"
                      :key="channel.id"
                      class="border-b border-default"
                    >
                      <td class="py-2 pr-4">
                        <code class="bg-muted px-1.5 py-0.5 rounded text-sm">{{
                          channel.id
                        }}</code>
                      </td>
                      <td class="py-2 pr-4 text-muted">{{ channel.name }}</td>
                      <td class="py-2">
                        <UBadge color="neutral" variant="subtle" size="md">{{
                          channel.category
                        }}</UBadge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </UCard>

            <h3 class="text-lg font-semibold mt-8 mb-4">Channel Categories</h3>
            <div class="grid sm:grid-cols-2 gap-3">
              <UCard v-for="cat in categories" :key="cat.id" class="p-3">
                <div class="flex items-center gap-2 mb-1">
                  <code class="text-primary text-sm">{{ cat.id }}</code>
                </div>
                <p class="text-sm text-muted">{{ cat.description }}</p>
              </UCard>
            </div>
          </section>

          <!-- Units Reference -->
          <section id="units" class="mb-12 scroll-mt-20">
            <h2 class="text-2xl font-bold mb-4">7. Units Reference</h2>
            <p class="text-muted mb-4">
              Standard units for channel values. Applications SHOULD store data
              in canonical units.
            </p>

            <div class="grid sm:grid-cols-2 gap-4">
              <UCard v-for="cat in unitCategories" :key="cat.category">
                <h4 class="font-semibold mb-2">{{ cat.category }}</h4>
                <div class="flex flex-wrap gap-1">
                  <UBadge
                    v-for="unit in cat.units"
                    :key="unit"
                    color="neutral"
                    variant="outline"
                    size="md"
                  >
                    {{ unit }}
                  </UBadge>
                </div>
              </UCard>
            </div>
          </section>

          <!-- Metadata -->
          <section id="metadata" class="mb-12 scroll-mt-20">
            <h2 class="text-2xl font-bold mb-4">8. Metadata</h2>
            <p class="text-muted mb-4">
              The optional
              <code class="bg-muted px-1.5 py-0.5 rounded">metadata</code>
              object can contain additional information.
            </p>

            <UCard>
              <CodeBlock lang="yaml" :code="codeExamples.metadata" />
            </UCard>
          </section>

          <!-- Validation -->
          <section id="validation" class="mb-12 scroll-mt-20">
            <h2 class="text-2xl font-bold mb-4">9. Validation</h2>

            <UCard class="mb-4">
              <h4 class="font-semibold mb-3">Required Validations</h4>
              <ul class="space-y-2 text-sm text-muted">
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-check"
                    class="size-4 text-success shrink-0 mt-0.5"
                  />
                  All required fields are present
                </li>
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-check"
                    class="size-4 text-success shrink-0 mt-0.5"
                  />
                  <code class="bg-muted px-1 rounded">id</code> is unique and
                  follows naming convention
                </li>
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-check"
                    class="size-4 text-success shrink-0 mt-0.5"
                  />
                  <code class="bg-muted px-1 rounded">version</code> is valid
                  semver
                </li>
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-check"
                    class="size-4 text-success shrink-0 mt-0.5"
                  />
                  <code class="bg-muted px-1 rounded">channels[].id</code>
                  values are unique within the adapter
                </li>
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-check"
                    class="size-4 text-success shrink-0 mt-0.5"
                  />
                  <code class="bg-muted px-1 rounded"
                    >channels[].source_names</code
                  >
                  arrays are non-empty
                </li>
              </ul>
            </UCard>

            <UCard>
              <h4 class="font-semibold mb-3">Validate with CLI</h4>
              <CodeBlock lang="bash" :code="codeExamples.validation" />
            </UCard>
          </section>

          <!-- Unit Conversions -->
          <section id="conversions" class="mb-12 scroll-mt-20">
            <h2 class="text-2xl font-bold mb-4">
              10. Unit Conversion Reference
            </h2>

            <UCard>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-default">
                      <th class="text-left py-2 pr-4 font-semibold">From</th>
                      <th class="text-left py-2 pr-4 font-semibold">To</th>
                      <th class="text-left py-2 font-semibold">Formula</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="conv in conversions"
                      :key="`${conv.from}-${conv.to}`"
                      class="border-b border-default"
                    >
                      <td class="py-2 pr-4">{{ conv.from }}</td>
                      <td class="py-2 pr-4">{{ conv.to }}</td>
                      <td class="py-2">
                        <code class="bg-muted px-1.5 py-0.5 rounded text-sm">{{
                          conv.formula
                        }}</code>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </UCard>
          </section>

          <!-- Footer Links -->
          <div
            class="flex flex-col sm:flex-row gap-4 pt-8 border-t border-default"
          >
            <UButton
              to="https://github.com/ClassicMiniDIY/OECUASpecs/blob/main/SPECIFICATION.md"
              target="_blank"
              icon="i-simple-icons-github"
              color="neutral"
              variant="outline"
            >
              View on GitHub
            </UButton>
            <UButton
              to="https://github.com/ClassicMiniDIY/OECUASpecs/blob/main/schema/adapter.schema.json"
              target="_blank"
              icon="i-heroicons-code-bracket"
              color="neutral"
              variant="outline"
            >
              JSON Schema
            </UButton>
          </div>
        </main>
      </div>
    </UContainer>
  </div>
</template>
