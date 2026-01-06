<script setup lang="ts">
useSeoMeta({
  title: "Ecosystem - OpenECU Alliance",
  description:
    "Discover spec-compatible applications, libraries, and tools built on the OpenECU Spec.",
});

const compatibleApps = [
  {
    name: "UltraLog",
    description:
      "High-performance ECU log viewer written in Rust. Features multi-format support, computed channels, scatter plots, and PDF/PNG export.",
    url: "https://ultralog.co",
    logo: "/ultralog-logo.png",
    status: "available" as const,
    features: [
      "Multi-file tabs",
      "Computed channels",
      "Scatter plots",
      "Export to PNG/PDF",
    ],
  },
];

const libraries = [
  {
    name: "openecuspec (planned)",
    description:
      "Reference implementation library for parsing OpenECU Spec adapters.",
    languages: ["Rust", "TypeScript"],
    status: "planned" as const,
  },
];

const donateProjects = [
  {
    title: "ECU Calibration Tools",
    description:
      "Tuning and calibration software that could benefit from standardized channel names.",
  },
  {
    title: "Data Analysis Libraries",
    description:
      "Libraries for analyzing ECU log data across different formats.",
  },
  {
    title: "Hardware Integration",
    description: "CAN bus readers, data loggers, or other hardware projects.",
  },
];
</script>

<template>
  <div>
    <UContainer class="py-12">
      <!-- Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <UBadge color="primary" variant="subtle" class="mb-4">
          OpenECU Ecosystem
        </UBadge>
        <h1 class="text-3xl sm:text-4xl font-bold mb-4">
          Spec-Compatible Applications
        </h1>
        <p class="text-lg text-muted">
          Discover applications, libraries, and tools built with OpenECU Spec
          support. When you use spec-compatible software, you get automatic
          support for any ECU with an adapter.
        </p>
      </div>

      <!-- How it Works -->
      <section class="mb-16">
        <div class="max-w-4xl mx-auto">
          <h2 class="text-xl font-semibold mb-6 text-center">
            How the Ecosystem Works
          </h2>
          <div class="grid md:grid-cols-3 gap-4">
            <UCard>
              <div class="text-center">
                <div class="bg-primary/10 p-3 rounded-xl mb-4 inline-flex">
                  <UIcon
                    name="i-heroicons-document-text"
                    class="size-6 text-primary"
                  />
                </div>
                <h3 class="font-semibold mb-2">1. The Spec</h3>
                <p class="text-sm text-muted">
                  OpenECU Spec defines a standard way to describe ECU log
                  formats and channel mappings.
                </p>
              </div>
            </UCard>
            <UCard>
              <div class="text-center">
                <div class="bg-primary/10 p-3 rounded-xl mb-4 inline-flex">
                  <UIcon
                    name="i-heroicons-puzzle-piece"
                    class="size-6 text-primary"
                  />
                </div>
                <h3 class="font-semibold mb-2">2. Adapters</h3>
                <p class="text-sm text-muted">
                  Community creates YAML adapters that map vendor-specific
                  channels to canonical IDs.
                </p>
              </div>
            </UCard>
            <UCard>
              <div class="text-center">
                <div class="bg-primary/10 p-3 rounded-xl mb-4 inline-flex">
                  <UIcon name="i-heroicons-cube" class="size-6 text-primary" />
                </div>
                <h3 class="font-semibold mb-2">3. Applications</h3>
                <p class="text-sm text-muted">
                  Spec-compatible apps use adapters to support any ECU without
                  custom code.
                </p>
              </div>
            </UCard>
          </div>
        </div>
      </section>

      <!-- Compatible Applications -->
      <section class="mb-16">
        <h2 class="text-xl font-semibold mb-6">Applications</h2>
        <div class="grid gap-4">
          <UCard
            v-for="app in compatibleApps"
            :key="app.name"
            class="hover:ring-2 hover:ring-primary/50 transition-all"
          >
            <div class="flex flex-col sm:flex-row gap-4">
              <div class="bg-primary/10 p-5 rounded-xl shrink-0 self-start">
                <img
                  v-if="app.logo"
                  :src="app.logo"
                  :alt="app.name"
                  class="size-14 object-contain"
                />
                <UIcon v-else name="i-heroicons-cube" class="size-14 text-primary" />
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="text-lg font-semibold">{{ app.name }}</h3>
                  <UBadge
                    :color="app.status === 'available' ? 'success' : 'warning'"
                    variant="subtle"
                    size="xs"
                  >
                    {{
                      app.status === "available" ? "Available" : "Coming Soon"
                    }}
                  </UBadge>
                </div>
                <p class="text-muted mb-4">{{ app.description }}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                  <UBadge
                    v-for="feature in app.features"
                    :key="feature"
                    color="neutral"
                    variant="subtle"
                    size="xs"
                  >
                    {{ feature }}
                  </UBadge>
                </div>
                <UButton :to="app.url" target="_blank" size="sm">
                  Visit Website
                  <UIcon
                    name="i-heroicons-arrow-top-right-on-square"
                    class="size-4 ml-1"
                  />
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <!-- Libraries -->
      <section class="mb-16">
        <h2 class="text-xl font-semibold mb-6">Libraries & SDKs</h2>
        <div class="grid gap-4">
          <UCard v-for="lib in libraries" :key="lib.name">
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="font-semibold">{{ lib.name }}</h3>
                  <UBadge color="warning" variant="subtle" size="xs">
                    {{ lib.status }}
                  </UBadge>
                </div>
                <p class="text-sm text-muted mb-2">{{ lib.description }}</p>
                <div class="flex gap-2">
                  <UBadge
                    v-for="lang in lib.languages"
                    :key="lang"
                    color="neutral"
                    variant="subtle"
                    size="xs"
                  >
                    {{ lang }}
                  </UBadge>
                </div>
              </div>
            </div>
          </UCard>
        </div>
        <p class="text-sm text-muted mt-4 text-center">
          More libraries and SDK coming soon.
          <NuxtLink to="/contribute" class="text-primary hover:underline">
            Contribute
          </NuxtLink>
          if you're building one.
        </p>
      </section>

      <!-- Donate Projects -->
      <section class="mb-16">
        <div class="max-w-3xl mx-auto">
          <div class="text-center mb-8">
            <h2 class="text-xl font-semibold mb-4">Donate Your Project</h2>
            <p class="text-muted">
              Have an ECU-related project you'd like maintained long-term? The
              OpenECU Alliance can adopt compatible projects and provide ongoing
              maintenance.
            </p>
          </div>
          <div class="grid sm:grid-cols-3 gap-4">
            <UCard v-for="project in donateProjects" :key="project.title">
              <h3 class="font-semibold mb-2">{{ project.title }}</h3>
              <p class="text-sm text-muted">{{ project.description }}</p>
            </UCard>
          </div>
          <div class="text-center mt-6">
            <UButton to="/contribute" variant="soft">
              Learn About Contributing
            </UButton>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section>
        <UCard class="text-center">
          <div class="py-8">
            <h2 class="text-xl font-bold mb-4">
              Building Something Spec-Compatible?
            </h2>
            <p class="text-muted mb-6 max-w-xl mx-auto">
              We'd love to feature your project! Whether it's a library, tool,
              or full application, if it uses OpenECU Spec adapters, let us
              know.
            </p>
            <div class="flex justify-center gap-4">
              <UButton to="/contribute"> Get Listed </UButton>
              <UButton to="/docs" variant="soft" color="neutral">
                Read the Docs
              </UButton>
            </div>
          </div>
        </UCard>
      </section>
    </UContainer>
  </div>
</template>
