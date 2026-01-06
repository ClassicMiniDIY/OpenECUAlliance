<script setup lang="ts">
useSeoMeta({
  title: "Creating Adapters - OpenECU Alliance",
  description: "Step-by-step guide to creating your own ECU adapter.",
});

// Code examples for syntax highlighting
const codeExamples = {
  step1: `git clone https://github.com/YOUR-USERNAME/OECUASpecs.git
cd OECUASpecs`,

  step2: `mkdir -p adapters/vendorname`,

  step3: `touch adapters/vendorname/vendorname-format.adapter.yaml`,

  step4: `openecualliance: "1.0"
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

  step5: `# Install validation tool (one-time)
npm install -g ajv-cli

# Validate
ajv validate -s schema/adapter.schema.json -d adapters/vendorname/vendorname-format.adapter.yaml`,

  step6: `git checkout -b add-vendorname-adapter
git add adapters/vendorname/
git commit -m "Add adapter for VendorName Format"
git push origin add-vendorname-adapter`,

  sourceNames: `# Before
source_names:
  - "Engine RPM"

# After
source_names:
  - "Engine RPM"
  - "Eng RPM"  # Found in firmware v2.3 exports`,
};
</script>

<template>
  <div class="py-8 px-4">
    <UContainer class="max-w-4xl">
      <div class="mb-2">
        <NuxtLink
          to="/docs"
          class="text-sm text-muted hover:text-primary inline-flex items-center gap-1"
        >
          <UIcon name="i-heroicons-arrow-left" class="size-4" />
          Back to Docs
        </NuxtLink>
      </div>

      <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold mb-2">Creating Adapters</h1>
        <p class="text-lg text-muted">
          Step-by-step guide to creating your own ECU adapter.
        </p>
      </div>

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
                <strong>Check existing adapters</strong> - Ensure an adapter
                doesn't already exist for your format.
              </div>
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-heroicons-check-circle"
                class="size-5 text-success shrink-0 mt-0.5"
              />
              <div>
                <strong>Gather sample files</strong> - You'll need real log
                files to test against.
              </div>
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-heroicons-check-circle"
                class="size-5 text-success shrink-0 mt-0.5"
              />
              <div>
                <strong>Read the specification</strong> - Familiarize yourself
                with the
                <NuxtLink to="/spec" class="text-primary hover:underline"
                  >full specification</NuxtLink
                >.
              </div>
            </li>
          </ul>
        </UCard>
      </section>

      <!-- Step by Step -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Step-by-Step Guide</h2>

        <!-- Step 1 -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex items-center justify-center size-10 bg-primary text-primary-foreground rounded-full font-bold shrink-0"
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
              class="flex items-center justify-center size-10 bg-primary text-primary-foreground rounded-full font-bold shrink-0"
            >
              2
            </div>
            <h3 class="text-xl font-semibold">Create Vendor Directory</h3>
          </div>
          <UCard>
            <CodeBlock lang="bash" :code="codeExamples.step2" />
            <p class="text-sm text-muted mt-3">
              Use lowercase vendor names:
              <code class="bg-muted px-1 rounded">haltech</code>,
              <code class="bg-muted px-1 rounded">link</code>,
              <code class="bg-muted px-1 rounded">motec</code>,
              <code class="bg-muted px-1 rounded">aem</code>, etc.
            </p>
          </UCard>
        </div>

        <!-- Step 3 -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex items-center justify-center size-10 bg-primary text-primary-foreground rounded-full font-bold shrink-0"
            >
              3
            </div>
            <h3 class="text-xl font-semibold">Create Adapter File</h3>
          </div>
          <UCard>
            <CodeBlock lang="bash" :code="codeExamples.step3" />
            <p class="text-sm text-muted mt-3">
              Naming convention:
              <code class="bg-muted px-1 rounded"
                >{vendor}-{format}.adapter.yaml</code
              >
            </p>
            <div class="mt-2 text-sm text-muted">
              Examples:
              <code class="bg-muted px-1 rounded">haltech-nsp.adapter.yaml</code
              >,
              <code class="bg-muted px-1 rounded">motec-csv.adapter.yaml</code>
            </div>
          </UCard>
        </div>

        <!-- Step 4 -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex items-center justify-center size-10 bg-primary text-primary-foreground rounded-full font-bold shrink-0"
            >
              4
            </div>
            <h3 class="text-xl font-semibold">Write the Adapter</h3>
          </div>
          <UCard>
            <CodeBlock lang="yaml" :code="codeExamples.step4" />
          </UCard>
        </div>

        <!-- Step 5 -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex items-center justify-center size-10 bg-primary text-primary-foreground rounded-full font-bold shrink-0"
            >
              5
            </div>
            <h3 class="text-xl font-semibold">Validate Your Adapter</h3>
          </div>
          <UCard>
            <CodeBlock lang="bash" :code="codeExamples.step5" />
          </UCard>
        </div>

        <!-- Step 6 -->
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex items-center justify-center size-10 bg-primary text-primary-foreground rounded-full font-bold shrink-0"
            >
              6
            </div>
            <h3 class="text-xl font-semibold">Submit Pull Request</h3>
          </div>
          <UCard>
            <CodeBlock lang="bash" :code="codeExamples.step6" />
            <p class="text-sm text-muted mt-3">
              Then create a Pull Request on GitHub.
            </p>
          </UCard>
        </div>
      </section>

      <!-- Quality Checklist -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Quality Checklist</h2>
        <UCard>
          <p class="text-muted mb-4">Before submitting, verify:</p>
          <ul class="space-y-2 text-sm">
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Adapter validates against JSON Schema
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              All required fields are present
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              <code class="bg-muted px-1 rounded">id</code> follows naming
              convention (vendor-format)
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              <code class="bg-muted px-1 rounded">version</code> follows semver
              (start with 1.0.0)
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Each channel has at least one
              <code class="bg-muted px-1 rounded">source_name</code>
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Channel IDs use canonical names where applicable
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              <code class="bg-muted px-1 rounded">metadata.tested_with</code>
              lists ECU models tested
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Description explains what log files this adapter supports
            </li>
          </ul>
        </UCard>
      </section>

      <!-- Adding Source Names -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">
          Adding Source Names to Existing Adapters
        </h2>
        <UCard>
          <p class="text-muted mb-4">
            If you discover additional channel name variations in log files:
          </p>
          <ol
            class="list-decimal list-inside space-y-2 text-sm text-muted mb-4"
          >
            <li>Find the channel in the existing adapter</li>
            <li>
              Add the new name to
              <code class="bg-muted px-1 rounded">source_names</code> array
            </li>
            <li>Increment the PATCH version</li>
            <li>
              Submit PR with explanation of where you found this variation
            </li>
          </ol>
          <CodeBlock lang="yaml" :code="codeExamples.sourceNames" />
        </UCard>
      </section>

      <!-- CTA -->
      <div class="flex flex-col sm:flex-row gap-4">
        <UButton
          to="https://github.com/ClassicMiniDIY/OECUASpecs"
          target="_blank"
          icon="i-simple-icons-github"
          size="lg"
        >
          View on GitHub
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
