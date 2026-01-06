<script setup lang="ts">
useSeoMeta({
  title: "Creating 3D Models - OpenECU Alliance",
  description:
    "Step-by-step guide to contributing 3D printable ECU mounts, enclosures, and accessories.",
});

const codeExamples = {
  step1: `git clone https://github.com/YOUR-USERNAME/OECUASpecs.git
cd OECUASpecs`,

  step2: `mkdir -p models/mounts/my-ecu-mount`,

  step3: `touch models/mounts/my-ecu-mount/my-ecu-mount.model.yaml`,

  step4: `openecualliance: "1.0"
type: model
id: haltech-elite-2500-mount
name: "Haltech Elite 2500 ECU Mount"
version: "1.0.0"
vendor: haltech
description: |
  Universal mounting bracket for Haltech Elite 2500 ECU.
  Designed for firewall or bulkhead mounting with vibration isolation.

category: mounts  # mounts | enclosures | brackets | adapters | accessories

compatibility:
  ecus:
    - vendor: haltech
      models: ["Elite 2500", "Elite 2000"]
  notes: "Fits any flat surface with 4x M6 mounting holes"

files:
  - filename: haltech-elite-mount.stl
    format: stl
    description: "Print-ready mesh"
    primary: true

  - filename: haltech-elite-mount.step
    format: step
    description: "CAD source file for modifications"

  - filename: haltech-elite-mount.3mf
    format: 3mf
    description: "3MF with embedded print settings"

images:
  - filename: preview.jpg
    type: render
    description: "3D render of mounted ECU"
    primary: true

  - filename: installed.jpg
    type: photo
    description: "Installed in engine bay"

printing:
  recommended_material: "PETG"
  alternative_materials: ["ASA", "ABS", "Nylon"]
  layer_height: 0.2
  infill_percent: 40
  wall_count: 3
  supports_required: false
  orientation: "Mounting holes facing up"
  estimated_time_hours: 4.5
  estimated_filament_grams: 85
  notes: |
    - Use at least 3 perimeters for strength
    - PETG recommended for heat resistance
    - PLA NOT recommended for engine bay use

hardware:
  - item: "M6 x 20mm Socket Head Cap Screw"
    quantity: 4
    notes: "For mounting to bulkhead"

  - item: "M4 x 12mm Pan Head Screw"
    quantity: 4
    notes: "For ECU attachment"

  - item: "M6 Rubber Vibration Isolator"
    quantity: 4
    optional: true
    notes: "Recommended for street use"

assembly:
  difficulty: "easy"  # easy | moderate | difficult
  steps:
    - "Mark mounting hole positions using the bracket as a template"
    - "Drill 4x 6.5mm holes for M6 bolts"
    - "Install vibration isolators if using"
    - "Mount bracket with M6 hardware"
    - "Secure ECU to bracket with M4 screws"
  warnings:
    - "Ensure adequate cooling airflow around ECU"
    - "Route wiring away from exhaust heat"

metadata:
  author: "Your Name"
  license: "CC-BY-SA-4.0"
  changelog:
    - version: "1.0.0"
      date: "2025-01-06"
      changes:
        - "Initial release"`,

  step5: `# Install validation tool (one-time)
npm install -g ajv-cli

# Validate
ajv validate -s schema/model.schema.json -d models/mounts/my-ecu-mount/my-ecu-mount.model.yaml`,

  step6: `git checkout -b add-haltech-mount
git add models/mounts/haltech-elite-mount/
git commit -m "Add ECU mount for Haltech Elite 2500"
git push origin add-haltech-mount`,

  directoryStructure: `models/
├── mounts/                    # ECU mounting brackets
│   └── haltech-elite-mount/
│       ├── haltech-elite-mount.model.yaml
│       ├── haltech-elite-mount.stl
│       ├── haltech-elite-mount.step
│       └── images/
│           ├── preview.jpg
│           └── installed.jpg
├── enclosures/                # Protective cases
├── brackets/                  # Sensor brackets
├── adapters/                  # Physical connector adapters
└── accessories/               # Misc accessories`,
};

const categories = [
  {
    name: "Mounts",
    description: "ECU mounting brackets for firewall, bulkhead, or console",
    icon: "i-heroicons-cube",
  },
  {
    name: "Enclosures",
    description: "Protective cases and weatherproof housings",
    icon: "i-heroicons-inbox",
  },
  {
    name: "Brackets",
    description: "Sensor mounts, connector holders, cable management",
    icon: "i-heroicons-wrench",
  },
  {
    name: "Adapters",
    description: "Physical connector adapters and spacers",
    icon: "i-heroicons-link",
  },
  {
    name: "Accessories",
    description: "Labels, covers, cable clips, and misc items",
    icon: "i-heroicons-cog-6-tooth",
  },
];

const materials = [
  {
    name: "PETG",
    rating: "Recommended",
    color: "success",
    notes: "Good heat resistance, easy to print, durable",
  },
  {
    name: "ASA",
    rating: "Excellent",
    color: "success",
    notes: "UV resistant, heat resistant, outdoor suitable",
  },
  {
    name: "ABS",
    rating: "Good",
    color: "warning",
    notes: "Heat resistant but requires enclosure to print",
  },
  {
    name: "Nylon",
    rating: "Excellent",
    color: "success",
    notes: "Very strong, heat resistant, requires dry box",
  },
  {
    name: "PLA",
    rating: "Not Recommended",
    color: "error",
    notes: "Low heat resistance - will deform in engine bay",
  },
];
</script>

<template>
  <div class="py-8 px-4">
    <UContainer class="max-w-4xl">
      <div class="mb-2">
        <NuxtLink
          to="/docs"
          class="text-sm text-muted hover:text-warning inline-flex items-center gap-1"
        >
          <UIcon name="i-heroicons-arrow-left" class="size-4" />
          Back to Docs
        </NuxtLink>
      </div>

      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <UBadge color="warning" variant="subtle">3D Model</UBadge>
        </div>
        <h1 class="text-3xl sm:text-4xl font-bold mb-2">Creating 3D Models</h1>
        <p class="text-lg text-muted">
          Step-by-step guide to contributing 3D printable ECU mounts,
          enclosures, and accessories.
        </p>
      </div>

      <!-- Categories -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Model Categories</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <UCard v-for="cat in categories" :key="cat.name">
            <div class="flex items-start gap-3">
              <div class="bg-warning/10 p-2 rounded-lg shrink-0">
                <UIcon :name="cat.icon" class="size-5 text-warning" />
              </div>
              <div>
                <h3 class="font-semibold">{{ cat.name }}</h3>
                <p class="text-sm text-muted">{{ cat.description }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <!-- Before You Start -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Before You Start</h2>
        <UCard>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <UIcon
                name="i-heroicons-check-circle"
                class="size-5 text-success shrink-0 mt-0.5"
              />
              <div>
                <strong>Design for printability</strong> - Consider overhangs,
                supports, and bed adhesion.
              </div>
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-heroicons-check-circle"
                class="size-5 text-success shrink-0 mt-0.5"
              />
              <div>
                <strong>Test print your design</strong> - Verify fitment and
                structural integrity.
              </div>
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-heroicons-check-circle"
                class="size-5 text-success shrink-0 mt-0.5"
              />
              <div>
                <strong>Take photos</strong> - Document your prints, especially
                installed photos.
              </div>
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-heroicons-check-circle"
                class="size-5 text-success shrink-0 mt-0.5"
              />
              <div>
                <strong>Include source files</strong> - Provide STEP files for
                modifications.
              </div>
            </li>
          </ul>
        </UCard>
      </section>

      <!-- Material Guide -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Material Guide for Engine Bay</h2>
        <UCard>
          <p class="text-muted mb-4">
            Engine bays can reach high temperatures. Choose materials
            appropriate for your application.
          </p>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-default">
                  <th class="text-left py-2 pr-4 font-semibold">Material</th>
                  <th class="text-left py-2 pr-4 font-semibold">Rating</th>
                  <th class="text-left py-2 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="mat in materials"
                  :key="mat.name"
                  class="border-b border-default"
                >
                  <td class="py-2 pr-4 font-medium">{{ mat.name }}</td>
                  <td class="py-2 pr-4">
                    <UBadge :color="mat.color" variant="subtle" size="sm">
                      {{ mat.rating }}
                    </UBadge>
                  </td>
                  <td class="py-2 text-muted">{{ mat.notes }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </section>

      <!-- Directory Structure -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Directory Structure</h2>
        <UCard>
          <CodeBlock lang="text" :code="codeExamples.directoryStructure" />
        </UCard>
      </section>

      <!-- Step by Step -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Step-by-Step Guide</h2>

        <!-- Step 1 -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex items-center justify-center size-10 bg-warning text-warning-foreground rounded-full font-bold shrink-0"
            >
              1
            </div>
            <h3 class="text-xl font-semibold">Fork and Clone</h3>
          </div>
          <UCard>
            <CodeBlock lang="bash" :code="codeExamples.step1" />
          </UCard>
        </div>

        <!-- Step 2 -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex items-center justify-center size-10 bg-warning text-warning-foreground rounded-full font-bold shrink-0"
            >
              2
            </div>
            <h3 class="text-xl font-semibold">Create Model Directory</h3>
          </div>
          <UCard>
            <CodeBlock lang="bash" :code="codeExamples.step2" />
            <p class="text-sm text-muted mt-3">
              Choose the appropriate category folder:
              <code class="bg-muted px-1 rounded">mounts</code>,
              <code class="bg-muted px-1 rounded">enclosures</code>,
              <code class="bg-muted px-1 rounded">brackets</code>,
              <code class="bg-muted px-1 rounded">adapters</code>, or
              <code class="bg-muted px-1 rounded">accessories</code>.
            </p>
          </UCard>
        </div>

        <!-- Step 3 -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex items-center justify-center size-10 bg-warning text-warning-foreground rounded-full font-bold shrink-0"
            >
              3
            </div>
            <h3 class="text-xl font-semibold">Create Model Metadata File</h3>
          </div>
          <UCard>
            <CodeBlock lang="bash" :code="codeExamples.step3" />
            <p class="text-sm text-muted mt-3">
              Naming convention:
              <code class="bg-muted px-1 rounded">{model-id}.model.yaml</code>
            </p>
          </UCard>
        </div>

        <!-- Step 4 -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex items-center justify-center size-10 bg-warning text-warning-foreground rounded-full font-bold shrink-0"
            >
              4
            </div>
            <h3 class="text-xl font-semibold">Write the Metadata</h3>
          </div>
          <UCard>
            <CodeBlock lang="yaml" :code="codeExamples.step4" />
          </UCard>
        </div>

        <!-- Step 5 -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex items-center justify-center size-10 bg-warning text-warning-foreground rounded-full font-bold shrink-0"
            >
              5
            </div>
            <h3 class="text-xl font-semibold">Validate Your Model</h3>
          </div>
          <UCard>
            <CodeBlock lang="bash" :code="codeExamples.step5" />
          </UCard>
        </div>

        <!-- Step 6 -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex items-center justify-center size-10 bg-warning text-warning-foreground rounded-full font-bold shrink-0"
            >
              6
            </div>
            <h3 class="text-xl font-semibold">Submit Pull Request</h3>
          </div>
          <UCard>
            <CodeBlock lang="bash" :code="codeExamples.step6" />
            <p class="text-sm text-muted mt-3">
              Include photos of your test prints in the PR description!
            </p>
          </UCard>
        </div>
      </section>

      <!-- Required Files -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Required Files</h2>
        <UCard>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-default">
                  <th class="text-left py-2 pr-4 font-semibold">File Type</th>
                  <th class="text-left py-2 pr-4 font-semibold">Required</th>
                  <th class="text-left py-2 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-default">
                  <td class="py-2 pr-4 font-medium">.model.yaml</td>
                  <td class="py-2 pr-4">
                    <UBadge color="success" variant="subtle" size="sm"
                      >Required</UBadge
                    >
                  </td>
                  <td class="py-2 text-muted">Metadata and print settings</td>
                </tr>
                <tr class="border-b border-default">
                  <td class="py-2 pr-4 font-medium">.stl</td>
                  <td class="py-2 pr-4">
                    <UBadge color="success" variant="subtle" size="sm"
                      >Required</UBadge
                    >
                  </td>
                  <td class="py-2 text-muted">Print-ready mesh file</td>
                </tr>
                <tr class="border-b border-default">
                  <td class="py-2 pr-4 font-medium">.step</td>
                  <td class="py-2 pr-4">
                    <UBadge color="warning" variant="subtle" size="sm"
                      >Recommended</UBadge
                    >
                  </td>
                  <td class="py-2 text-muted">CAD source for modifications</td>
                </tr>
                <tr class="border-b border-default">
                  <td class="py-2 pr-4 font-medium">.3mf</td>
                  <td class="py-2 pr-4">
                    <UBadge color="neutral" variant="subtle" size="sm"
                      >Optional</UBadge
                    >
                  </td>
                  <td class="py-2 text-muted">With embedded print settings</td>
                </tr>
                <tr class="border-b border-default">
                  <td class="py-2 pr-4 font-medium">images/</td>
                  <td class="py-2 pr-4">
                    <UBadge color="success" variant="subtle" size="sm"
                      >Required</UBadge
                    >
                  </td>
                  <td class="py-2 text-muted">Preview and installed photos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </section>

      <!-- Quality Checklist -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Quality Checklist</h2>
        <UCard>
          <p class="text-muted mb-4">Before submitting, verify:</p>
          <ul class="space-y-2 text-sm">
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Model metadata validates against JSON Schema
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              STL file is watertight (no holes in mesh)
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              You've successfully printed and tested the model
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Print settings are accurate and tested
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Hardware list is complete and accurate
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Assembly instructions are clear
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Photos show the print quality clearly
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              License is appropriate (CC-BY-SA recommended)
            </li>
          </ul>
        </UCard>
      </section>

      <!-- CTA -->
      <div class="flex flex-col sm:flex-row gap-4">
        <UButton
          to="https://github.com/ClassicMiniDIY/OECUASpecs"
          target="_blank"
          icon="i-simple-icons-github"
          color="warning"
          size="lg"
        >
          View on GitHub
        </UButton>
        <UButton
          to="/models"
          color="neutral"
          variant="outline"
          icon="i-heroicons-cube"
          size="lg"
        >
          Browse Models
        </UButton>
        <UButton
          to="/spec"
          color="neutral"
          variant="outline"
          icon="i-heroicons-document-text"
          size="lg"
        >
          Read the Full Spec
        </UButton>
      </div>
    </UContainer>
  </div>
</template>
