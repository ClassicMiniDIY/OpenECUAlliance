<script setup lang="ts">
  const NuxtLink = resolveComponent('NuxtLink');

  useSeoMeta({
    title: 'OpenECU Spec & API - Technical Specification - OpenECU Alliance',
    description:
      'YAML-based technical specification for ECU log adapters and CAN Bus protocols. Fetch specs via public REST API.',
    ogTitle: 'OpenECU Spec & API - Technical Specification',
    ogDescription:
      'Public REST API for fetching ECU log adapters and CAN Bus protocol specifications programmatically.',
    twitterCard: 'summary_large_image',
  });

  // Color class mappings for Tailwind (dynamic strings don't work with JIT)
  const colorClasses = {
    primary: { bg: 'bg-primary/10', text: 'text-primary' },
    success: { bg: 'bg-success/10', text: 'text-success' },
  } as const;

  const specTypes = [
    {
      id: 'adapter',
      name: 'Adapters',
      description: 'Log file format definitions that map vendor-specific channels to canonical identifiers.',
      icon: 'i-heroicons-document-text',
      color: 'primary' as const,
      fileExtension: '.adapter.yaml',
      schemaUrl: 'https://github.com/ClassicMiniDIY/OpenECUAlliance/blob/main/specs/schema/adapter.schema.json',
      docsUrl: '/docs/creating-adapters',
    },
    {
      id: 'protocol',
      name: 'Protocols',
      description: 'CAN Bus message and signal definitions with DBC export support.',
      icon: 'i-heroicons-signal',
      color: 'success' as const,
      fileExtension: '.protocol.yaml',
      schemaUrl: 'https://github.com/ClassicMiniDIY/OpenECUAlliance/blob/main/specs/schema/protocol.schema.json',
      docsUrl: '/docs/creating-protocols',
    },
  ];

  const commonFields = [
    {
      field: 'openecualliance',
      description: 'Spec version (currently "1.0")',
      required: true,
    },
    {
      field: 'type',
      description: 'Content type: adapter or protocol',
      required: true,
    },
    {
      field: 'id',
      description: 'Unique identifier (lowercase, hyphens)',
      required: true,
    },
    { field: 'name', description: 'Human-readable display name', required: true },
    {
      field: 'version',
      description: 'Semantic version (e.g., 1.0.0)',
      required: true,
    },
    {
      field: 'vendor',
      description: 'ECU vendor or manufacturer',
      required: true,
    },
    {
      field: 'description',
      description: 'Detailed description',
      required: false,
    },
    {
      field: 'website',
      description: 'URL for more information',
      required: false,
    },
    { field: 'branding', description: 'Logo, icon, colors', required: false },
    {
      field: 'metadata',
      description: 'Author, license, changelog',
      required: false,
    },
  ];

  const canonicalChannels = [
    { id: 'rpm', name: 'Engine RPM', category: 'engine' },
    { id: 'tps', name: 'Throttle Position', category: 'engine' },
    { id: 'map', name: 'Manifold Absolute Pressure', category: 'pressure' },
    { id: 'coolant_temp', name: 'Coolant Temperature', category: 'temperature' },
    { id: 'iat', name: 'Intake Air Temperature', category: 'temperature' },
    { id: 'afr', name: 'Air-Fuel Ratio', category: 'fuel' },
    { id: 'lambda', name: 'Lambda', category: 'fuel' },
    { id: 'boost', name: 'Boost Pressure', category: 'pressure' },
    { id: 'battery_voltage', name: 'Battery Voltage', category: 'electrical' },
    { id: 'vehicle_speed', name: 'Vehicle Speed', category: 'speed' },
    { id: 'ignition_advance', name: 'Ignition Timing', category: 'ignition' },
    { id: 'duty_cycle', name: 'Injector Duty Cycle', category: 'fuel' },
  ];

  const unitCategories = [
    { category: 'Temperature', units: ['celsius', 'fahrenheit', 'kelvin'] },
    { category: 'Pressure', units: ['kpa', 'psi', 'bar', 'mbar'] },
    { category: 'Speed', units: ['rpm', 'kph', 'mph'] },
    { category: 'Ratio', units: ['afr', 'lambda', 'percent'] },
    { category: 'Time', units: ['seconds', 'milliseconds'] },
    { category: 'Electrical', units: ['volts', 'amps'] },
  ];

  const apiEndpoints = [
    {
      method: 'GET',
      path: '/api/specs/adapters',
      description: 'List all available adapters with summary info',
      response: 'Array of adapter objects (JSON)',
    },
    {
      method: 'GET',
      path: '/api/specs/adapters/:vendor/:id',
      description: 'Get full adapter specification with all channels',
      response: 'Complete adapter object (JSON)',
    },
    {
      method: 'GET',
      path: '/api/specs/adapters-raw/:vendor/:id',
      description: 'Download raw YAML adapter file',
      response: 'Raw YAML file',
    },
    {
      method: 'GET',
      path: '/api/specs/protocols',
      description: 'List all available CAN protocols with summary info',
      response: 'Array of protocol objects (JSON)',
    },
    {
      method: 'GET',
      path: '/api/specs/protocols/:vendor/:id',
      description: 'Get full CAN protocol specification',
      response: 'Complete protocol object (JSON)',
    },
    {
      method: 'GET',
      path: '/api/specs/protocols-raw/:vendor/:id',
      description: 'Download raw YAML protocol file',
      response: 'Raw YAML file',
    },
  ];

  const codeExample = `openecualliance: "1.0"
type: adapter
id: haltech-nsp
name: "Haltech NSP"
version: "1.0.0"
vendor: haltech
description: "Haltech NSP CSV log format"
website: "https://haltech.com"

branding:
  logo: haltech-logo.svg
  color_primary: "#FFBE1A"

file_format:
  type: csv
  delimiter: ","
  header_row: 0
  data_start_row: 1

channels:
  - id: rpm
    name: "Engine RPM"
    category: engine
    data_type: float
    unit: rpm
    source_names:
      - "Engine RPM"
      - "RPM"`;

  const apiExampleFetch = `// Fetch all adapters
const response = await fetch('https://oecua.org/api/specs/adapters');
const adapters = await response.json();

// Fetch specific adapter
const adapter = await fetch('https://oecua.org/api/specs/adapters/haltech/haltech-nsp');
const haltechSpec = await adapter.json();

// Download raw YAML
const yaml = await fetch('https://oecua.org/api/specs/adapters-raw/haltech/haltech-nsp');
const yamlText = await yaml.text();`;

  const apiExampleCurl = `# List all adapters
curl https://oecua.org/api/specs/adapters

# Get specific adapter (parsed JSON)
curl https://oecua.org/api/specs/adapters/haltech/haltech-nsp

# Download raw YAML
curl https://oecua.org/api/specs/adapters-raw/haltech/haltech-nsp`;
</script>

<template>
  <div class="py-8 px-4">
    <UContainer>
      <!-- Header -->
      <div class="mb-12">
        <UBadge color="primary" variant="subtle" class="mb-4"> Version 1.0 </UBadge>
        <h1 class="text-3xl sm:text-4xl font-bold mb-2">OpenECU Specification & API</h1>
        <p class="text-lg text-muted">
          YAML-based specifications for ECU adapters and CAN protocols, accessible via public REST API.
        </p>
      </div>

      <!-- API Endpoints -->
      <section id="api-endpoints" class="mb-12">
        <h2 class="text-xl font-semibold mb-4">Public API Endpoints</h2>
        <p class="text-muted mb-4">
          Access specs programmatically via REST API. All endpoints return JSON by default, with raw YAML available via
          <code class="bg-muted px-1.5 py-0.5 rounded text-xs">*-raw</code> endpoints.
        </p>
        <UCard>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-default">
                  <th class="text-left py-2 pr-4 font-semibold w-20">Method</th>
                  <th class="text-left py-2 pr-4 font-semibold">Endpoint</th>
                  <th class="text-left py-2 pr-4 font-semibold">Description</th>
                  <th class="text-left py-2 font-semibold">Response</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="endpoint in apiEndpoints" :key="endpoint.path" class="border-b border-default last:border-0">
                  <td class="py-2 pr-4">
                    <UBadge color="success" variant="subtle" size="xs">
                      {{ endpoint.method }}
                    </UBadge>
                  </td>
                  <td class="py-2 pr-4">
                    <code class="bg-muted px-1.5 py-0.5 rounded text-xs">{{ endpoint.path }}</code>
                  </td>
                  <td class="py-2 pr-4 text-muted">{{ endpoint.description }}</td>
                  <td class="py-2 text-muted text-xs">{{ endpoint.response }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </section>

      <!-- API Examples -->
      <section class="mb-12">
        <h2 class="text-xl font-semibold mb-4">API Usage Examples</h2>
        <div class="space-y-4">
          <UCard>
            <h3 class="font-semibold mb-3 text-sm">JavaScript / TypeScript</h3>
            <CodeBlock lang="javascript" :code="apiExampleFetch" />
          </UCard>
          <UCard>
            <h3 class="font-semibold mb-3 text-sm">cURL</h3>
            <CodeBlock lang="bash" :code="apiExampleCurl" />
          </UCard>
        </div>
      </section>

      <!-- Spec Types -->
      <section class="mb-12">
        <h2 class="text-xl font-semibold mb-4">Content Types</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <UCard v-for="spec in specTypes" :key="spec.id">
            <div class="flex flex-col h-full">
              <div class="flex items-center gap-3 mb-3">
                <div :class="colorClasses[spec.color].bg" class="p-2 rounded-lg">
                  <UIcon :name="spec.icon" :class="['size-5', colorClasses[spec.color].text]" />
                </div>
                <div>
                  <h3 class="font-semibold">{{ spec.name }}</h3>
                  <code class="text-xs text-muted">{{ spec.fileExtension }}</code>
                </div>
              </div>
              <p class="text-sm text-muted mb-4 flex-1">
                {{ spec.description }}
              </p>
              <div class="flex gap-2">
                <UButton :to="spec.schemaUrl" target="_blank" size="xs" color="neutral" variant="outline">
                  Schema
                </UButton>
                <UButton :to="spec.docsUrl" size="xs" color="neutral" variant="ghost"> Guide </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <!-- Common Structure -->
      <section class="mb-12">
        <h2 class="text-xl font-semibold mb-4">Common Structure</h2>
        <p class="text-muted mb-4">All content types share these root-level fields:</p>
        <UCard>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-default">
                  <th class="text-left py-2 pr-4 font-semibold">Field</th>
                  <th class="text-left py-2 pr-4 font-semibold">Description</th>
                  <th class="text-left py-2 font-semibold w-20">Required</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="field in commonFields" :key="field.field" class="border-b border-default last:border-0">
                  <td class="py-2 pr-4">
                    <code class="bg-muted px-1.5 py-0.5 rounded text-primary text-xs">
                      {{ field.field }}
                    </code>
                  </td>
                  <td class="py-2 pr-4 text-muted">{{ field.description }}</td>
                  <td class="py-2">
                    <UIcon v-if="field.required" name="i-heroicons-check" class="size-4 text-success" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </section>

      <!-- Example -->
      <section class="mb-12">
        <h2 class="text-xl font-semibold mb-4">Example Adapter</h2>
        <UCard>
          <CodeBlock lang="yaml" :code="codeExample" />
        </UCard>
      </section>

      <!-- Canonical Channels (for adapters) -->
      <section class="mb-12">
        <h2 class="text-xl font-semibold mb-4">Canonical Channel IDs</h2>
        <p class="text-muted mb-4">
          Standardized identifiers for common ECU channels. Use these in adapters for cross-format compatibility.
        </p>
        <UCard>
          <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm">
            <div v-for="channel in canonicalChannels" :key="channel.id" class="flex items-center gap-2 py-1">
              <code class="bg-muted px-1.5 py-0.5 rounded text-xs">{{ channel.id }}</code>
              <span class="text-muted">{{ channel.name }}</span>
            </div>
          </div>
          <p class="text-xs text-muted mt-4">
            <NuxtLink to="/docs/creating-adapters#channels" class="text-primary hover:underline">
              View full list
            </NuxtLink>
          </p>
        </UCard>
      </section>

      <!-- Units Reference -->
      <section class="mb-12">
        <h2 class="text-xl font-semibold mb-4">Units Reference</h2>
        <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <UCard v-for="cat in unitCategories" :key="cat.category" class="p-4">
            <h4 class="font-semibold text-sm mb-2">{{ cat.category }}</h4>
            <div class="flex flex-wrap gap-1">
              <UBadge v-for="unit in cat.units" :key="unit" color="neutral" variant="outline" size="xs">
                {{ unit }}
              </UBadge>
            </div>
          </UCard>
        </div>
      </section>

      <!-- Validation -->
      <section class="mb-12">
        <h2 class="text-xl font-semibold mb-4">Validation</h2>
        <UCard>
          <p class="text-sm text-muted mb-3">Validate your YAML files against the JSON Schema:</p>
          <CodeBlock
            lang="bash"
            code="# Using ajv-cli (Node.js)
npx ajv-cli validate -s schema/adapter.schema.json -d your-adapter.yaml

# Using check-jsonschema (Python)
check-jsonschema --schemafile schema/adapter.schema.json your-adapter.yaml"
          />
        </UCard>
      </section>

      <!-- Footer Links -->
      <div class="flex flex-wrap gap-3">
        <UButton
          to="https://github.com/ClassicMiniDIY/OpenECUAlliance"
          target="_blank"
          icon="i-simple-icons-github"
          color="neutral"
          variant="outline"
          size="sm"
        >
          GitHub Repository
        </UButton>
        <UButton
          to="https://github.com/ClassicMiniDIY/OpenECUAlliance/tree/main/specs/schema"
          target="_blank"
          icon="i-heroicons-code-bracket"
          color="neutral"
          variant="outline"
          size="sm"
        >
          All Schemas
        </UButton>
        <UButton to="/docs" icon="i-heroicons-book-open" color="neutral" variant="ghost" size="sm">
          Documentation
        </UButton>
      </div>
    </UContainer>
  </div>
</template>
