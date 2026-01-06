<script setup lang="ts">
useSeoMeta({
  title: "Getting Started - OpenECU Alliance",
  description: "Introduction to OpenECU Alliance and the adapter ecosystem.",
});

// Code examples for syntax highlighting
const codeExamples = {
  adapterExample: `channels:
  - id: rpm                    # Canonical ID (standardized)
    name: "Engine RPM"
    source_names:              # Vendor-specific names
      - "Engine RPM"
      - "Engine Speed"
      - "RPM"
      - "Eng RPM"`,

  ecosystemDiagram: `┌─────────────────────────────────────────────────────────────┐
│                    OpenECU Alliance                         │
│                   (The Organization)                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              OpenECU Spec (This Repo)               │   │
│  │                                                      │   │
│  │  • Adapter file format specification                 │   │
│  │  • Canonical channel identifiers                     │   │
│  │  • JSON Schema for validation                        │   │
│  │  • Official adapter library                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│              ┌────────────┴────────────┐                   │
│              ▼                         ▼                    │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │ Alliance Projects   │  │  Spec-Compatible Apps       │  │
│  │                     │  │                             │  │
│  │ Donated to and      │  │ Independent apps that       │  │
│  │ maintained by the   │  │ implement the OpenECU Spec  │  │
│  │ Alliance            │  │                             │  │
│  │                     │  │ • UltraLog                  │  │
│  │ • (Future projects) │  │ • (Your app here)           │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘`,
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
        <h1 class="text-3xl sm:text-4xl font-bold mb-2">Getting Started</h1>
        <p class="text-lg text-muted">
          Introduction to OpenECU Alliance and the adapter ecosystem.
        </p>
      </div>

      <!-- What is OpenECU Alliance -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">What is the OpenECU Alliance?</h2>
        <UCard class="mb-6">
          <p class="text-muted mb-4">
            The OpenECU Alliance is an open community dedicated to standardizing
            ECU log data formats. We maintain:
          </p>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <UIcon
                name="i-heroicons-document-text"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <strong>The OpenECU Spec</strong> - A YAML-based specification
                for describing ECU log file formats and channel mappings.
              </div>
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-heroicons-puzzle-piece"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <strong>Adapter Library</strong> - Pre-built adapters for
                popular ECU systems like Haltech, Link, AiM, ECUMaster, and
                more.
              </div>
            </li>
            <li class="flex items-start gap-3">
              <UIcon
                name="i-heroicons-cube"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <strong>Ecosystem</strong> - Spec-compatible applications that
                work with any ECU system.
              </div>
            </li>
          </ul>
        </UCard>
      </section>

      <!-- The Problem -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">The Problem We Solve</h2>
        <UCard class="mb-6">
          <p class="text-muted mb-4">
            Every ECU manufacturer exports data differently. The same data point
            has different names:
          </p>
          <div class="grid sm:grid-cols-2 gap-4 mb-4">
            <div class="bg-muted/30 p-4 rounded-lg">
              <div class="font-semibold mb-2">Haltech</div>
              <code class="text-sm text-primary">"Engine RPM"</code>
            </div>
            <div class="bg-muted/30 p-4 rounded-lg">
              <div class="font-semibold mb-2">Link ECU</div>
              <code class="text-sm text-primary">"Engine Speed"</code>
            </div>
            <div class="bg-muted/30 p-4 rounded-lg">
              <div class="font-semibold mb-2">AiM</div>
              <code class="text-sm text-primary">"RPM"</code>
            </div>
            <div class="bg-muted/30 p-4 rounded-lg">
              <div class="font-semibold mb-2">ECUMaster</div>
              <code class="text-sm text-primary">"Eng RPM"</code>
            </div>
          </div>
          <p class="text-muted">
            <strong>They all mean the same thing.</strong> Without
            standardization, every analysis tool needs custom code for each ECU
            system.
          </p>
        </UCard>
      </section>

      <!-- The Solution -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">The Solution: Adapters</h2>
        <UCard>
          <p class="text-muted mb-4">
            Adapters map vendor-specific names to canonical identifiers:
          </p>
          <CodeBlock lang="yaml" :code="codeExamples.adapterExample" />
          <p class="text-muted mt-4">
            Applications implementing the OpenECU Spec can use any adapter to
            parse any supported ECU format - no custom code needed.
          </p>
        </UCard>
      </section>

      <!-- How It Works -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">How It Works</h2>
        <div class="grid md:grid-cols-3 gap-4">
          <UCard>
            <div class="text-center">
              <div class="bg-primary/10 p-4 rounded-xl mb-4 inline-flex">
                <span class="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 class="font-semibold mb-2">The Spec</h3>
              <p class="text-sm text-muted">
                OpenECU Spec defines a standard YAML format for adapter files.
              </p>
            </div>
          </UCard>
          <UCard>
            <div class="text-center">
              <div class="bg-primary/10 p-4 rounded-xl mb-4 inline-flex">
                <span class="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 class="font-semibold mb-2">Adapters</h3>
              <p class="text-sm text-muted">
                Community creates adapters that map vendor channels to standard
                IDs.
              </p>
            </div>
          </UCard>
          <UCard>
            <div class="text-center">
              <div class="bg-primary/10 p-4 rounded-xl mb-4 inline-flex">
                <span class="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 class="font-semibold mb-2">Applications</h3>
              <p class="text-sm text-muted">
                Spec-compatible apps use adapters to support any ECU without
                custom code.
              </p>
            </div>
          </UCard>
        </div>
      </section>

      <!-- Ecosystem -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">The Ecosystem</h2>
        <UCard>
          <CodeBlock lang="text" :code="codeExamples.ecosystemDiagram" />
        </UCard>
      </section>

      <!-- Next Steps -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Next Steps</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <UCard
            as="NuxtLink"
            to="/docs/creating-adapters"
            class="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
          >
            <div class="flex items-center gap-3">
              <UIcon
                name="i-heroicons-document-plus"
                class="size-6 text-primary"
              />
              <div>
                <h3 class="font-semibold">Create an Adapter</h3>
                <p class="text-sm text-muted">
                  Step-by-step guide to creating adapters
                </p>
              </div>
            </div>
          </UCard>
          <UCard
            as="NuxtLink"
            to="/spec"
            class="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
          >
            <div class="flex items-center gap-3">
              <UIcon
                name="i-heroicons-document-text"
                class="size-6 text-primary"
              />
              <div>
                <h3 class="font-semibold">Read the Spec</h3>
                <p class="text-sm text-muted">Full technical specification</p>
              </div>
            </div>
          </UCard>
          <UCard
            as="NuxtLink"
            to="/docs/compliance"
            class="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
          >
            <div class="flex items-center gap-3">
              <UIcon
                name="i-heroicons-check-badge"
                class="size-6 text-primary"
              />
              <div>
                <h3 class="font-semibold">Compliance Levels</h3>
                <p class="text-sm text-muted">Implement the spec in your app</p>
              </div>
            </div>
          </UCard>
          <UCard
            as="NuxtLink"
            to="/"
            class="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
          >
            <div class="flex items-center gap-3">
              <UIcon
                name="i-heroicons-magnifying-glass"
                class="size-6 text-primary"
              />
              <div>
                <h3 class="font-semibold">Browse Adapters</h3>
                <p class="text-sm text-muted">Explore available adapters</p>
              </div>
            </div>
          </UCard>
        </div>
      </section>
    </UContainer>
  </div>
</template>
