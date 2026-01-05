<script setup lang="ts">
const NuxtLink = resolveComponent("NuxtLink");

useSeoMeta({
  title: "OpenECU Alliance - The OpenECU Spec",
  description:
    "An open specification for standardizing ECU log data. Build spec-compatible applications that work with any ECU system.",
});

const features = [
  {
    icon: "i-heroicons-document-text",
    title: "The OpenECU Spec",
    description:
      "A standardized YAML format for describing ECU log file formats and channel mappings.",
  },
  {
    icon: "i-heroicons-puzzle-piece",
    title: "Adapter Library",
    description:
      "Pre-built adapters for popular ECU systems that map vendor channels to standard IDs.",
  },
  {
    icon: "i-heroicons-code-bracket",
    title: "Language Agnostic",
    description:
      "YAML-based specs parseable by any language. Build applications in Rust, Python, TypeScript, or anything.",
  },
  {
    icon: "i-heroicons-users",
    title: "Community Driven",
    description:
      "Open contribution model - anyone can create adapters or donate compatible projects.",
  },
];

const compatibleApps = [
  {
    name: "UltraLog",
    description:
      "High-performance ECU log viewer with multi-format support and computed channels.",
    url: "https://ultralog.app",
    icon: "i-heroicons-chart-bar",
    status: "available",
  },
];

const vendors = [
  { name: "Haltech", status: "ready" },
  { name: "Link", status: "ready" },
  { name: "AiM", status: "ready" },
  { name: "ECUMaster", status: "ready" },
  { name: "Speeduino", status: "ready" },
  { name: "rusEFI", status: "ready" },
  { name: "RomRaider", status: "ready" },
  { name: "MoTeC", status: "planned" },
  { name: "AEM", status: "planned" },
  { name: "Holley", status: "planned" },
  { name: "FuelTech", status: "planned" },
];
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="py-24 px-4">
      <UContainer>
        <div class="text-center max-w-4xl mx-auto">
          <UBadge color="primary" variant="subtle" class="mb-4">
            Open Source Specification
          </UBadge>
          <h1
            class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            The
            <span class="text-primary">OpenECU Spec</span>
          </h1>
          <p class="text-lg sm:text-xl text-muted mb-4 max-w-2xl mx-auto">
            An open specification for standardizing ECU log data formats.
          </p>
          <p class="text-base text-muted mb-8 max-w-2xl mx-auto">
            Build spec-compatible applications that work with
            <strong>any</strong> ECU system. One specification, every
            manufacturer, any analysis tool.
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <UButton to="/adapters" size="lg"> Browse Adapters </UButton>
            <UButton to="/spec" size="lg" color="neutral" variant="outline">
              Read the Spec
            </UButton>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- What is OpenECU Alliance -->
    <section class="py-16 px-4 bg-elevated">
      <UContainer>
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-12">
            <h2 class="text-2xl sm:text-3xl font-bold mb-4">
              What is the OpenECU Alliance?
            </h2>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <UCard>
              <div class="text-center">
                <div class="bg-primary/10 p-3 rounded-xl mb-4 inline-flex">
                  <UIcon
                    name="i-heroicons-building-office-2"
                    class="size-6 text-primary"
                  />
                </div>
                <h3 class="font-semibold mb-2">The Alliance</h3>
                <p class="text-sm text-muted">
                  An open community that publishes and maintains the OpenECU
                  Spec, adapter definitions, and compatible tools.
                </p>
              </div>
            </UCard>

            <UCard>
              <div class="text-center">
                <div class="bg-primary/10 p-3 rounded-xl mb-4 inline-flex">
                  <UIcon
                    name="i-heroicons-document-text"
                    class="size-6 text-primary"
                  />
                </div>
                <h3 class="font-semibold mb-2">The Spec</h3>
                <p class="text-sm text-muted">
                  A YAML-based specification that defines how to describe ECU
                  log formats and map channels to standard identifiers.
                </p>
              </div>
            </UCard>

            <UCard>
              <div class="text-center">
                <div class="bg-primary/10 p-3 rounded-xl mb-4 inline-flex">
                  <UIcon name="i-heroicons-cube" class="size-6 text-primary" />
                </div>
                <h3 class="font-semibold mb-2">The Ecosystem</h3>
                <p class="text-sm text-muted">
                  Spec-compatible applications, adapters, and tools that work
                  together seamlessly.
                </p>
              </div>
            </UCard>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Features Section -->
    <section class="py-16 px-4">
      <UContainer>
        <div class="text-center mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold mb-4">
            Why Use the OpenECU Spec?
          </h2>
          <p class="text-muted max-w-2xl mx-auto">
            Every ECU uses different channel names for the same data. The spec
            creates a universal standard that benefits everyone.
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <UCard
            v-for="feature in features"
            :key="feature.title"
            class="text-center"
          >
            <div class="flex flex-col items-center">
              <div class="bg-primary/10 p-3 rounded-xl mb-4">
                <UIcon :name="feature.icon" class="size-6 text-primary" />
              </div>
              <h3 class="font-semibold mb-2">{{ feature.title }}</h3>
              <p class="text-sm text-muted">{{ feature.description }}</p>
            </div>
          </UCard>
        </div>
      </UContainer>
    </section>

    <!-- Compatible Applications -->
    <section class="py-16 px-4 bg-elevated">
      <UContainer>
        <div class="text-center mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold mb-4">
            Spec-Compatible Applications
          </h2>
          <p class="text-muted max-w-2xl mx-auto">
            Applications built with OpenECU Spec support can read logs from any
            ECU with an adapter.
          </p>
        </div>

        <div class="max-w-2xl mx-auto">
          <UCard
            v-for="app in compatibleApps"
            :key="app.name"
            :as="NuxtLink"
            :to="app.url"
            target="_blank"
            class="hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer"
          >
            <div class="flex items-center gap-4">
              <div class="bg-primary/10 p-3 rounded-xl shrink-0">
                <UIcon :name="app.icon" class="size-6 text-primary" />
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-semibold">{{ app.name }}</h3>
                  <UBadge color="success" variant="subtle" size="xs">
                    Available
                  </UBadge>
                </div>
                <p class="text-sm text-muted">{{ app.description }}</p>
              </div>
              <UIcon
                name="i-heroicons-arrow-top-right-on-square"
                class="size-4 text-muted"
              />
            </div>
          </UCard>

          <p class="text-center text-sm text-muted mt-6">
            Building a spec-compatible app?
            <NuxtLink to="/contribute" class="text-primary hover:underline">
              Let us know
            </NuxtLink>
            and we'll add it here.
          </p>
        </div>
      </UContainer>
    </section>

    <!-- Supported Vendors -->
    <section class="py-16 px-4">
      <UContainer>
        <div class="text-center mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold mb-4">
            Supported ECU Systems
          </h2>
          <p class="text-muted max-w-2xl mx-auto">
            Adapters available for these ECU manufacturers. More coming soon.
          </p>
        </div>

        <div class="flex flex-wrap justify-center gap-3">
          <UBadge
            v-for="vendor in vendors"
            :key="vendor.name"
            :color="vendor.status === 'ready' ? 'success' : 'neutral'"
            variant="subtle"
            size="lg"
          >
            <template v-if="vendor.status === 'ready'">
              <UIcon name="i-heroicons-check-circle" class="size-3.5 mr-1" />
            </template>
            {{ vendor.name }}
          </UBadge>
        </div>
      </UContainer>
    </section>

    <!-- For Developers -->
    <section class="py-16 px-4 bg-elevated">
      <UContainer>
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-12">
            <h2 class="text-2xl sm:text-3xl font-bold mb-4">For Developers</h2>
            <p class="text-muted max-w-2xl mx-auto">
              The OpenECU Spec makes it easy to add ECU log support to your
              application.
            </p>
          </div>

          <div class="grid md:grid-cols-2 gap-8">
            <UCard>
              <h3 class="font-semibold mb-3">Use the Spec</h3>
              <ul class="space-y-2 text-sm text-muted">
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-check"
                    class="size-4 text-success shrink-0 mt-0.5"
                  />
                  <span>Parse any ECU log format with a single codebase</span>
                </li>
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-check"
                    class="size-4 text-success shrink-0 mt-0.5"
                  />
                  <span>Use canonical channel IDs across all ECU systems</span>
                </li>
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-check"
                    class="size-4 text-success shrink-0 mt-0.5"
                  />
                  <span>Leverage community-maintained adapters</span>
                </li>
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-check"
                    class="size-4 text-success shrink-0 mt-0.5"
                  />
                  <span>Add new ECU support without code changes</span>
                </li>
              </ul>
              <div class="mt-4">
                <UButton to="/docs" variant="soft" size="sm">
                  Read Documentation
                </UButton>
              </div>
            </UCard>

            <UCard>
              <h3 class="font-semibold mb-3">Contribute to the Alliance</h3>
              <ul class="space-y-2 text-sm text-muted">
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-plus"
                    class="size-4 text-primary shrink-0 mt-0.5"
                  />
                  <span>Create adapters for new ECU systems</span>
                </li>
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-plus"
                    class="size-4 text-primary shrink-0 mt-0.5"
                  />
                  <span>Improve existing channel mappings</span>
                </li>
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-plus"
                    class="size-4 text-primary shrink-0 mt-0.5"
                  />
                  <span>Donate ECU-related projects for maintenance</span>
                </li>
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-plus"
                    class="size-4 text-primary shrink-0 mt-0.5"
                  />
                  <span>Build spec-compatible tools and libraries</span>
                </li>
              </ul>
              <div class="mt-4">
                <UButton to="/contribute" variant="soft" size="sm">
                  Start Contributing
                </UButton>
              </div>
            </UCard>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- CTA Section -->
    <section class="py-16 px-4">
      <UContainer>
        <UCard class="text-center">
          <div class="py-8 px-4">
            <h2 class="text-2xl font-bold mb-4">Ready to get started?</h2>
            <p class="text-muted mb-6 max-w-xl mx-auto">
              Browse the adapter library, read the specification, or start
              building a spec-compatible application.
            </p>
            <div class="flex flex-wrap justify-center gap-4">
              <UButton to="/adapters"> Browse Adapters </UButton>
              <UButton to="/spec" color="neutral" variant="soft">
                Read the Spec
              </UButton>
            </div>
          </div>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>
