<script setup lang="ts">
const NuxtLink = resolveComponent("NuxtLink");

useSeoMeta({
  title: "Contribute - OpenECU Alliance",
  description:
    "Learn how to contribute adapters, CAN protocols, 3D models, and more to the OpenECU Alliance.",
});

const waysToContribute = [
  {
    type: "Submit Adapters",
    description: "Add support for new ECU log formats",
    difficulty: "Beginner",
    color: "success" as const,
  },
  {
    type: "Submit Protocols",
    description: "Define CAN Bus messages and signals",
    difficulty: "Intermediate",
    color: "warning" as const,
  },
  {
    type: "Submit 3D Models",
    description: "Share printable mounts and enclosures",
    difficulty: "Beginner",
    color: "success" as const,
  },
  {
    type: "Improve Content",
    description: "Add source_names, fix issues",
    difficulty: "Beginner",
    color: "success" as const,
  },
  {
    type: "Report Issues",
    description: "Report bugs or missing features",
    difficulty: "Beginner",
    color: "success" as const,
  },
  {
    type: "Documentation",
    description: "Improve docs, add examples",
    difficulty: "Beginner",
    color: "success" as const,
  },
  {
    type: "Review PRs",
    description: "Help review submissions",
    difficulty: "Intermediate",
    color: "warning" as const,
  },
  {
    type: "Propose RFC",
    description: "Suggest specification changes",
    difficulty: "Advanced",
    color: "error" as const,
  },
  {
    type: "Build Tools",
    description: "Validation tools, SDKs",
    difficulty: "Advanced",
    color: "error" as const,
  },
];

const contributionTypes = [
  {
    icon: "i-heroicons-document-text",
    title: "Adapters",
    description: "Log file format definitions for ECU data parsing",
    to: "/docs/creating-adapters",
    color: "primary",
  },
  {
    icon: "i-heroicons-signal",
    title: "Protocols",
    description: "CAN Bus message definitions with DBC export",
    to: "/docs/creating-protocols",
    color: "success",
  },
  {
    icon: "i-heroicons-cube",
    title: "3D Models",
    description: "Printable mounts, enclosures, and accessories",
    to: "/docs/creating-models",
    color: "warning",
  },
];

const adapterSteps = [
  {
    step: 1,
    title: "Fork and Clone",
    description: "Fork the OECUASpecs repository and clone it locally.",
    code: `git clone https://github.com/YOUR-USERNAME/OECUASpecs.git
cd OECUASpecs`,
  },
  {
    step: 2,
    title: "Create Vendor Directory",
    description:
      "Create a directory for your vendor if it doesn't exist. Use lowercase names.",
    code: "mkdir -p adapters/vendorname",
  },
  {
    step: 3,
    title: "Create Adapter File",
    description:
      "Create your adapter file following the naming convention: {vendor}-{format}.adapter.yaml",
    code: "touch adapters/vendorname/vendorname-format.adapter.yaml",
  },
  {
    step: 4,
    title: "Write the Adapter",
    description: "Fill in the adapter with your ECU's channel mappings.",
  },
  {
    step: 5,
    title: "Validate",
    description: "Validate your adapter against the JSON Schema.",
    code: `# Install validation tool (one-time)
npm install -g ajv-cli

# Validate
ajv validate -s schema/adapter.schema.json -d adapters/vendorname/vendorname-format.adapter.yaml`,
  },
  {
    step: 6,
    title: "Submit Pull Request",
    description: "Push your changes and create a pull request on GitHub.",
    code: `git checkout -b add-vendorname-adapter
git add adapters/vendorname/
git commit -m "Add adapter for VendorName Format"
git push origin add-vendorname-adapter`,
  },
];

const qualityChecklist = [
  "Adapter validates against JSON Schema",
  "All required fields are present",
  "ID follows naming convention (vendor-format)",
  "Version follows semver (start with 1.0.0)",
  "Each channel has at least one source_name",
  "Channel IDs use canonical names where applicable",
  "metadata.tested_with lists ECU models tested",
  "Description explains what log files this adapter supports",
];

const assetRequirements = [
  { type: "Logo", format: "SVG (preferred) or PNG", size: "Min 400px wide" },
  { type: "Icon", format: "SVG (preferred) or PNG", size: "256x256px" },
  { type: "Banner", format: "PNG or JPG", size: "1200x630px" },
];

const rfcCriteria = {
  needsRfc: [
    "New fields in the adapter schema",
    "New channel categories",
    "Changes to existing field definitions",
    "New canonical channel IDs",
    "Breaking changes of any kind",
  ],
  noRfc: [
    "Typo fixes",
    "Clarifications that don't change meaning",
    "Adding adapter examples",
  ],
};

const rfcSteps = [
  {
    step: "Discuss First",
    description: "Open a GitHub Discussion to gauge interest",
  },
  {
    step: "Write RFC",
    description: "Create rfcs/0000-your-proposal.md using the template",
  },
  { step: "Submit PR", description: "Open PR for community review" },
  { step: "Iterate", description: "Incorporate feedback" },
  { step: "FCP", description: "Final Comment Period (14 days)" },
  { step: "Decision", description: "Steering Committee accepts or rejects" },
];

const commitTypes = [
  { type: "adapter:", description: "Adding or updating adapters" },
  { type: "protocol:", description: "Adding or updating CAN protocols" },
  { type: "model:", description: "Adding or updating 3D models" },
  { type: "spec:", description: "Specification changes" },
  { type: "docs:", description: "Documentation only" },
  { type: "schema:", description: "JSON Schema changes" },
  { type: "chore:", description: "Maintenance, tooling" },
];

// Code examples for syntax highlighting
const codeExamples = {
  adapterTemplate: `openecualliance: "1.0"
id: vendorname-format
name: "Vendor Name Format Description"
version: "1.0.0"
vendor: vendorname
description: |
  Brief description of this adapter.
  Include supported ECU models and export methods.
website: "https://vendor-website.com"

file_format:
  type: csv  # or binary
  extensions: [".csv", ".log"]
  delimiter: ","
  header_row: 0
  data_start_row: 1

channels:
  - id: rpm
    name: "Engine RPM"
    category: engine
    data_type: float
    unit: rpm
    min: 0
    max: 20000
    source_names:
      - "Engine RPM"
      - "RPM"
      # Add ALL variations you've seen in real log files

  - id: coolant_temp
    name: "Coolant Temperature"
    category: temperature
    data_type: float
    unit: celsius
    source_names:
      - "ECT"
      - "Coolant Temp"

metadata:
  author: "Your Name"
  tested_with:
    - "ECU Model 1"
    - "ECU Model 2"
  changelog:
    - version: "1.0.0"
      date: "2024-01-15"
      changes:
        - "Initial release"`,

  installValidation: `# Option 1: ajv-cli (Node.js)
npm install -g ajv-cli

# Option 2: check-jsonschema (Python)
pip install check-jsonschema`,

  validateAll: `# Using ajv-cli
for f in adapters/**/*.adapter.yaml; do
  ajv validate -s schema/adapter.schema.json -d "$f"
done`,
};
</script>

<template>
  <div class="py-8 px-4">
    <UContainer class="max-w-4xl">
      <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold mb-2">Contribute</h1>
        <p class="text-lg text-muted">
          Thank you for your interest in contributing to the OpenECU Alliance!
          Learn how to contribute adapters, protocols, 3D models, and more.
        </p>
      </div>

      <!-- Quick Start Cards -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">What Would You Like to Contribute?</h2>
        <div class="grid sm:grid-cols-3 gap-4">
          <UCard
            v-for="ct in contributionTypes"
            :key="ct.title"
            :as="NuxtLink"
            :to="ct.to"
            class="cursor-pointer hover:ring-2 transition-all"
            :class="`hover:ring-${ct.color}/50`"
          >
            <div class="flex items-start gap-3">
              <div :class="`bg-${ct.color}/10`" class="p-2 rounded-lg shrink-0">
                <UIcon :name="ct.icon" :class="`size-5 text-${ct.color}`" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold mb-1">{{ ct.title }}</h3>
                <p class="text-sm text-muted">{{ ct.description }}</p>
              </div>
              <UIcon
                name="i-heroicons-chevron-right"
                class="size-5 text-muted shrink-0"
              />
            </div>
          </UCard>
        </div>
      </section>

      <!-- Ways to Contribute -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Ways to Contribute</h2>
        <UCard>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-default">
                  <th class="text-left py-2 pr-4 font-semibold">
                    Contribution Type
                  </th>
                  <th class="text-left py-2 pr-4 font-semibold">Description</th>
                  <th class="text-left py-2 font-semibold">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="way in waysToContribute"
                  :key="way.type"
                  class="border-b border-default"
                >
                  <td class="py-2 pr-4 font-medium">{{ way.type }}</td>
                  <td class="py-2 pr-4 text-muted">{{ way.description }}</td>
                  <td class="py-2">
                    <UBadge :color="way.color" variant="subtle" size="md">
                      {{ way.difficulty }}
                    </UBadge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </section>

      <!-- Contributing Adapters -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Contributing Adapters</h2>
        <p class="text-muted mb-6">
          Adapters are the primary way the community expands OpenECU Spec
          coverage.
        </p>

        <!-- Before You Start -->
        <UCard class="mb-6">
          <h3 class="font-semibold mb-3">Before You Start</h3>
          <ul class="space-y-2">
            <li class="flex items-start gap-2 text-sm">
              <UIcon
                name="i-heroicons-check-circle"
                class="size-5 text-success shrink-0 mt-0.5"
              />
              <div>
                <strong>Check existing adapters</strong> - Ensure an adapter
                doesn't already exist for your format
              </div>
            </li>
            <li class="flex items-start gap-2 text-sm">
              <UIcon
                name="i-heroicons-check-circle"
                class="size-5 text-success shrink-0 mt-0.5"
              />
              <div>
                <strong>Gather sample files</strong> - You'll need real log
                files to test against
              </div>
            </li>
            <li class="flex items-start gap-2 text-sm">
              <UIcon
                name="i-heroicons-check-circle"
                class="size-5 text-success shrink-0 mt-0.5"
              />
              <div>
                <strong>Read the specification</strong> - Familiarize yourself
                with the
                <NuxtLink to="/spec" class="text-primary hover:underline"
                  >full specification</NuxtLink
                >
              </div>
            </li>
          </ul>
        </UCard>

        <!-- Steps -->
        <div class="space-y-4 mb-6">
          <UCard v-for="item in adapterSteps" :key="item.step">
            <div class="flex items-start gap-4">
              <div
                class="flex items-center justify-center size-10 bg-primary text-primary-foreground rounded-full font-bold shrink-0"
              >
                {{ item.step }}
              </div>
              <div class="flex-1">
                <h3 class="font-semibold mb-1">{{ item.title }}</h3>
                <p class="text-sm text-muted mb-2">{{ item.description }}</p>
                <CodeBlock v-if="item.code" lang="bash" :code="item.code" />
              </div>
            </div>
          </UCard>
        </div>

        <!-- Adapter Template -->
        <UCard class="mb-6">
          <h3 class="font-semibold mb-3">Adapter Template</h3>
          <CodeBlock lang="yaml" :code="codeExamples.adapterTemplate" />
        </UCard>

        <!-- Quality Checklist -->
        <UCard>
          <h3 class="font-semibold mb-3">Quality Checklist</h3>
          <p class="text-sm text-muted mb-3">Before submitting, verify:</p>
          <ul class="grid sm:grid-cols-2 gap-2">
            <li
              v-for="item in qualityChecklist"
              :key="item"
              class="flex items-start gap-2 text-sm"
            >
              <UIcon
                name="i-heroicons-check"
                class="size-4 text-success shrink-0 mt-0.5"
              />
              {{ item }}
            </li>
          </ul>
        </UCard>
      </section>

      <!-- Contributing Brand Assets -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Contributing Brand Assets</h2>
        <p class="text-muted mb-4">
          Help make the OpenECU Alliance visually cohesive by contributing
          vendor logos, icons, and brand assets.
        </p>
        <UCard class="mb-4">
          <h3 class="font-semibold mb-3">Asset Requirements</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-default">
                  <th class="text-left py-2 pr-4 font-semibold">Asset Type</th>
                  <th class="text-left py-2 pr-4 font-semibold">Format</th>
                  <th class="text-left py-2 font-semibold">Size</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="req in assetRequirements"
                  :key="req.type"
                  class="border-b border-default"
                >
                  <td class="py-2 pr-4 font-medium">{{ req.type }}</td>
                  <td class="py-2 pr-4 text-muted">{{ req.format }}</td>
                  <td class="py-2 text-muted">{{ req.size }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>

        <div class="grid sm:grid-cols-2 gap-4">
          <UCard>
            <h4 class="font-semibold mb-2 text-success">Approved Sources</h4>
            <ul class="space-y-1 text-sm text-muted">
              <li class="flex items-center gap-2">
                <UIcon name="i-heroicons-check" class="size-4 text-success" />
                Official vendor press kits / media pages
              </li>
              <li class="flex items-center gap-2">
                <UIcon name="i-heroicons-check" class="size-4 text-success" />
                Direct written permission from vendor
              </li>
              <li class="flex items-center gap-2">
                <UIcon name="i-heroicons-check" class="size-4 text-success" />
                Assets you have verified rights to use
              </li>
            </ul>
          </UCard>
          <UCard>
            <h4 class="font-semibold mb-2 text-error">Not Acceptable</h4>
            <ul class="space-y-1 text-sm text-muted">
              <li class="flex items-center gap-2">
                <UIcon name="i-heroicons-x-mark" class="size-4 text-error" />
                Screenshots or low-quality captures
              </li>
              <li class="flex items-center gap-2">
                <UIcon name="i-heroicons-x-mark" class="size-4 text-error" />
                Modified third-party images
              </li>
              <li class="flex items-center gap-2">
                <UIcon name="i-heroicons-x-mark" class="size-4 text-error" />
                Assets without clear licensing
              </li>
            </ul>
          </UCard>
        </div>
      </section>

      <!-- Proposing Specification Changes -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Proposing Specification Changes</h2>
        <p class="text-muted mb-4">
          For changes to the OpenECU Spec itself, use the RFC (Request for
          Comments) process.
        </p>

        <div class="grid sm:grid-cols-2 gap-4 mb-6">
          <UCard>
            <h4 class="font-semibold mb-2">Needs RFC</h4>
            <ul class="space-y-1 text-sm">
              <li
                v-for="item in rfcCriteria.needsRfc"
                :key="item"
                class="flex items-center gap-2 text-muted"
              >
                <UIcon
                  name="i-heroicons-document-text"
                  class="size-4 text-primary"
                />
                {{ item }}
              </li>
            </ul>
          </UCard>
          <UCard>
            <h4 class="font-semibold mb-2">No RFC Needed</h4>
            <ul class="space-y-1 text-sm">
              <li
                v-for="item in rfcCriteria.noRfc"
                :key="item"
                class="flex items-center gap-2 text-muted"
              >
                <UIcon name="i-heroicons-check" class="size-4 text-success" />
                {{ item }}
              </li>
            </ul>
          </UCard>
        </div>

        <UCard>
          <h3 class="font-semibold mb-3">RFC Process</h3>
          <div class="space-y-2">
            <div
              v-for="(item, index) in rfcSteps"
              :key="item.step"
              class="flex items-center gap-3"
            >
              <div
                class="flex items-center justify-center size-6 bg-primary/10 text-primary rounded-full text-sm font-bold shrink-0"
              >
                {{ index + 1 }}
              </div>
              <div class="text-sm">
                <span class="font-medium">{{ item.step }}</span>
                <span class="text-muted"> - {{ item.description }}</span>
              </div>
            </div>
          </div>
        </UCard>
      </section>

      <!-- Reporting Issues -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Reporting Issues</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <UCard>
            <h3 class="font-semibold mb-3">Bug Reports</h3>
            <p class="text-sm text-muted mb-3">
              For incorrect adapters, schema validation problems, or
              documentation errors. Include:
            </p>
            <ul class="space-y-1 text-sm text-muted">
              <li>1. Which adapter/file is affected</li>
              <li>2. What you expected</li>
              <li>3. What actually happened</li>
              <li>4. Sample log file (sanitize sensitive data)</li>
            </ul>
          </UCard>
          <UCard>
            <h3 class="font-semibold mb-3">Feature Requests</h3>
            <p class="text-sm text-muted mb-3">For new features:</p>
            <ul class="space-y-1 text-sm text-muted">
              <li>1. Describe the use case</li>
              <li>2. Explain why existing features don't suffice</li>
              <li>3. Propose a solution (optional)</li>
            </ul>
          </UCard>
        </div>
      </section>

      <!-- Development Setup -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Development Setup</h2>
        <UCard>
          <h3 class="font-semibold mb-3">Prerequisites</h3>
          <ul class="space-y-2 text-sm mb-4">
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Node.js 18+ (for validation tools)
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Git
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              A text editor with YAML support
            </li>
          </ul>

          <h3 class="font-semibold mb-3">Install Validation Tools</h3>
          <div class="mb-4">
            <CodeBlock lang="bash" :code="codeExamples.installValidation" />
          </div>

          <h3 class="font-semibold mb-3">Validate All Adapters</h3>
          <CodeBlock lang="bash" :code="codeExamples.validateAll" />
        </UCard>
      </section>

      <!-- Style Guidelines -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Style Guidelines</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <UCard>
            <h3 class="font-semibold mb-3">YAML Style</h3>
            <ul class="space-y-2 text-sm text-muted">
              <li>Use 2-space indentation</li>
              <li>Quote strings that might be ambiguous</li>
              <li>Use lowercase for IDs and vendors</li>
              <li>Use snake_case for channel IDs</li>
              <li>Multi-line descriptions use |</li>
            </ul>
          </UCard>
          <UCard>
            <h3 class="font-semibold mb-3">Commit Message Types</h3>
            <ul class="space-y-1 text-sm">
              <li
                v-for="ct in commitTypes"
                :key="ct.type"
                class="flex items-start gap-2"
              >
                <code class="bg-muted px-1 rounded text-sm">{{ ct.type }}</code>
                <span class="text-muted">{{ ct.description }}</span>
              </li>
            </ul>
          </UCard>
        </div>
      </section>

      <!-- Getting Help -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Getting Help</h2>
        <UCard>
          <div class="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p class="font-medium mb-1">GitHub Discussions</p>
              <p class="text-muted">Questions, ideas, general discussion</p>
            </div>
            <div>
              <p class="font-medium mb-1">GitHub Issues</p>
              <p class="text-muted">Bug reports, specific problems</p>
            </div>
            <div>
              <p class="font-medium mb-1">Discord</p>
              <p class="text-muted">Real-time chat (coming soon)</p>
            </div>
          </div>
        </UCard>
      </section>

      <!-- Recognition -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Recognition</h2>
        <UCard>
          <p class="text-muted mb-3">All contributors are recognized in:</p>
          <ul class="space-y-2 text-sm">
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-star" class="size-4 text-warning" />
              Adapter metadata.author fields
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-star" class="size-4 text-warning" />
              Repository CONTRIBUTORS.md file
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-star" class="size-4 text-warning" />
              Release notes for significant contributions
            </li>
          </ul>
        </UCard>
      </section>

      <!-- CTA -->
      <div class="flex flex-wrap gap-4">
        <UButton
          to="https://github.com/ClassicMiniDIY/OECUASpecs"
          target="_blank"
          icon="i-simple-icons-github"
          size="lg"
        >
          View on GitHub
        </UButton>
        <UButton
          to="/docs/creating-adapters"
          color="primary"
          variant="outline"
          icon="i-heroicons-document-plus"
          size="lg"
        >
          Adapter Guide
        </UButton>
        <UButton
          to="/docs/creating-protocols"
          color="success"
          variant="outline"
          icon="i-heroicons-signal"
          size="lg"
        >
          Protocol Guide
        </UButton>
        <UButton
          to="/docs/creating-models"
          color="warning"
          variant="outline"
          icon="i-heroicons-cube"
          size="lg"
        >
          3D Model Guide
        </UButton>
      </div>
    </UContainer>
  </div>
</template>
