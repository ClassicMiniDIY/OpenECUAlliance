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
};

const vendorExamples = [
  { vendor: "Haltech", name: "Engine RPM", color: "#FFBE1A" },
  { vendor: "Link ECU", name: "Engine Speed", color: "#00A3E0" },
  { vendor: "AiM", name: "RPM", color: "#E31837" },
  { vendor: "ECUMaster", name: "Eng RPM", color: "#7CB342" },
];

const howItWorks = [
  {
    icon: "i-heroicons-document-text",
    title: "The Spec",
    description:
      "OpenECU Spec defines a standard YAML format for describing ECU log formats.",
  },
  {
    icon: "i-heroicons-puzzle-piece",
    title: "Adapters",
    description:
      "Community creates adapters that map vendor-specific channels to standard IDs.",
  },
  {
    icon: "i-heroicons-rocket-launch",
    title: "Applications",
    description:
      "Spec-compatible apps use adapters to support any ECU without custom code.",
  },
];

const ecosystemItems = {
  spec: [
    "Adapter file format specification",
    "Canonical channel identifiers",
    "JSON Schema for validation",
    "Official adapter library",
  ],
  alliance: ["Future donated projects"],
  apps: ["UltraLog", "Your app here"],
};

const nextSteps = [
  {
    to: "/docs/creating-adapters",
    icon: "i-heroicons-document-plus",
    title: "Create an Adapter",
    description: "Step-by-step guide to creating adapters",
  },
  {
    to: "/spec",
    icon: "i-heroicons-document-text",
    title: "Read the Spec",
    description: "Full technical specification",
  },
  {
    to: "/docs/compliance",
    icon: "i-heroicons-check-badge",
    title: "Compliance Levels",
    description: "Implement the spec in your app",
  },
  {
    to: "/",
    icon: "i-heroicons-magnifying-glass",
    title: "Browse Adapters",
    description: "Explore available adapters",
  },
];
</script>

<template>
  <div class="py-8 px-4">
    <UContainer class="max-w-4xl">
      <!-- Breadcrumb -->
      <div class="mb-6">
        <NuxtLink
          to="/docs"
          class="text-sm text-muted hover:text-primary inline-flex items-center gap-1.5 transition-colors"
        >
          <UIcon name="i-heroicons-arrow-left" class="size-4" />
          Back to Docs
        </NuxtLink>
      </div>

      <!-- Hero -->
      <div class="mb-12">
        <h1 class="text-3xl sm:text-4xl font-bold mb-3">Getting Started</h1>
        <p class="text-lg text-muted max-w-2xl">
          Learn how the OpenECU Alliance standardizes ECU log data formats
          across manufacturers.
        </p>
      </div>

      <!-- What is OpenECU Alliance -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold mb-6">What is the OpenECU Alliance?</h2>
        <p class="text-muted mb-6 max-w-3xl">
          The OpenECU Alliance is an open community dedicated to standardizing
          ECU log data formats. We maintain:
        </p>
        <div class="grid sm:grid-cols-3 gap-4">
          <UCard>
            <div class="flex flex-col items-center text-center">
              <div
                class="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4"
              >
                <UIcon
                  name="i-heroicons-document-text"
                  class="size-6 text-primary"
                />
              </div>
              <h3 class="font-semibold mb-2">The OpenECU Spec</h3>
              <p class="text-sm text-muted">
                A YAML-based specification for describing ECU log file formats
                and channel mappings.
              </p>
            </div>
          </UCard>
          <UCard>
            <div class="flex flex-col items-center text-center">
              <div
                class="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4"
              >
                <UIcon
                  name="i-heroicons-puzzle-piece"
                  class="size-6 text-primary"
                />
              </div>
              <h3 class="font-semibold mb-2">Adapter Library</h3>
              <p class="text-sm text-muted">
                Pre-built adapters for popular ECU systems like Haltech, Link,
                AiM, ECUMaster, and more.
              </p>
            </div>
          </UCard>
          <UCard>
            <div class="flex flex-col items-center text-center">
              <div
                class="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4"
              >
                <UIcon name="i-heroicons-cube" class="size-6 text-primary" />
              </div>
              <h3 class="font-semibold mb-2">Ecosystem</h3>
              <p class="text-sm text-muted">
                Spec-compatible applications that work seamlessly with any ECU
                system.
              </p>
            </div>
          </UCard>
        </div>
      </section>

      <!-- The Problem -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold mb-6">The Problem We Solve</h2>
        <UCard class="overflow-hidden">
          <p class="text-muted mb-6">
            Every ECU manufacturer exports data differently. The same data point
            has different names across vendors:
          </p>

          <!-- Visual comparison -->
          <div class="relative">
            <!-- Vendor names -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div
                v-for="example in vendorExamples"
                :key="example.vendor"
                class="rounded-lg p-4 border border-default bg-elevated"
              >
                <div
                  class="text-xs font-medium uppercase tracking-wide mb-2"
                  :style="{ color: example.color }"
                >
                  {{ example.vendor }}
                </div>
                <code class="text-sm font-mono">"{{ example.name }}"</code>
              </div>
            </div>

            <!-- Arrow -->
            <div class="flex justify-center mb-6">
              <div
                class="flex flex-col items-center gap-2 text-muted px-6 py-3"
              >
                <UIcon name="i-heroicons-arrows-pointing-in" class="size-6" />
                <span class="text-xs font-medium uppercase tracking-wide"
                  >All mean the same thing</span
                >
              </div>
            </div>

            <!-- Canonical -->
            <div
              class="rounded-lg p-4 bg-primary/10 border border-primary/20 text-center"
            >
              <div
                class="text-xs font-medium uppercase tracking-wide text-primary mb-2"
              >
                Canonical ID
              </div>
              <code class="text-lg font-mono font-semibold text-primary"
                >rpm</code
              >
            </div>
          </div>

          <p class="text-muted mt-6 text-sm">
            Without standardization, every analysis tool needs custom code for
            each ECU system. Adapters solve this by mapping vendor names to
            canonical identifiers.
          </p>
        </UCard>
      </section>

      <!-- The Solution -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold mb-6">The Solution: Adapters</h2>
        <UCard>
          <p class="text-muted mb-4">
            Adapters are YAML files that map vendor-specific channel names to
            standardized canonical identifiers:
          </p>
          <CodeBlock lang="yaml" :code="codeExamples.adapterExample" />
          <p class="text-muted mt-4 text-sm">
            Applications implementing the OpenECU Spec can use any adapter to
            parse any supported ECU format - no custom code needed.
          </p>
        </UCard>
      </section>

      <!-- How It Works -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold mb-6">How It Works</h2>
        <div class="relative">
          <!-- Connection line (desktop only) -->
          <div
            class="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 -translate-y-1/2 z-0"
          />

          <div class="grid md:grid-cols-3 gap-6 relative z-10">
            <div
              v-for="(step, index) in howItWorks"
              :key="step.title"
              class="relative"
            >
              <UCard class="h-full">
                <div class="flex flex-col items-center text-center">
                  <div
                    class="size-14 rounded-full bg-primary flex items-center justify-center mb-4 ring-4 ring-background"
                  >
                    <UIcon :name="step.icon" class="size-7 text-white" />
                  </div>
                  <div
                    class="absolute -top-2 -right-2 size-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center"
                  >
                    {{ index + 1 }}
                  </div>
                  <h3 class="font-semibold mb-2">{{ step.title }}</h3>
                  <p class="text-sm text-muted">{{ step.description }}</p>
                </div>
              </UCard>
            </div>
          </div>
        </div>
      </section>

      <!-- Ecosystem -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold mb-6">The Ecosystem</h2>
        <UCard>
          <div class="space-y-6">
            <!-- OpenECU Spec -->
            <div
              class="rounded-lg border border-primary/30 bg-primary/5 p-5 relative"
            >
              <div
                class="flex items-center gap-2 mb-3 text-primary font-semibold"
              >
                <UIcon name="i-heroicons-cpu-chip" class="size-5" />
                OpenECU Spec
              </div>
              <ul class="grid sm:grid-cols-2 gap-2 text-sm text-muted">
                <li
                  v-for="item in ecosystemItems.spec"
                  :key="item"
                  class="flex items-center gap-2"
                >
                  <UIcon
                    name="i-heroicons-check"
                    class="size-4 text-primary shrink-0"
                  />
                  {{ item }}
                </li>
              </ul>
            </div>

            <!-- Arrow -->
            <div class="flex justify-center">
              <UIcon
                name="i-heroicons-arrow-down"
                class="size-6 text-muted animate-pulse"
              />
            </div>

            <!-- Two columns -->
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="rounded-lg border border-default bg-elevated p-5">
                <div class="flex items-center gap-2 mb-3 font-semibold">
                  <UIcon name="i-heroicons-building-office" class="size-5" />
                  Alliance Projects
                </div>
                <ul class="space-y-2 text-sm text-muted">
                  <li
                    v-for="item in ecosystemItems.alliance"
                    :key="item"
                    class="flex items-center gap-2"
                  >
                    <UIcon name="i-heroicons-clock" class="size-4 shrink-0" />
                    {{ item }}
                  </li>
                </ul>
              </div>
              <div class="rounded-lg border border-default bg-elevated p-5">
                <div class="flex items-center gap-2 mb-3 font-semibold">
                  <UIcon name="i-heroicons-window" class="size-5" />
                  Spec-Compatible Apps
                </div>
                <ul class="space-y-2 text-sm text-muted">
                  <li
                    v-for="item in ecosystemItems.apps"
                    :key="item"
                    class="flex items-center gap-2"
                  >
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="size-4 shrink-0 text-success"
                    />
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </UCard>
      </section>

      <!-- Next Steps -->
      <section>
        <h2 class="text-2xl font-bold mb-6">Next Steps</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <NuxtLink
            v-for="step in nextSteps"
            :key="step.to"
            :to="step.to"
            class="block group"
          >
            <UCard
              class="h-full transition-all hover:ring-2 hover:ring-primary/50 hover:bg-elevated"
            >
              <div class="flex items-center gap-4">
                <div
                  class="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors"
                >
                  <UIcon :name="step.icon" class="size-5 text-primary" />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold mb-0.5 group-hover:text-primary transition-colors">
                    {{ step.title }}
                  </h3>
                  <p class="text-sm text-muted">{{ step.description }}</p>
                </div>
                <UIcon
                  name="i-heroicons-chevron-right"
                  class="size-5 text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </div>
            </UCard>
          </NuxtLink>
        </div>
      </section>
    </UContainer>
  </div>
</template>
