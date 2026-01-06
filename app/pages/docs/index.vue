<script setup lang="ts">
const NuxtLink = resolveComponent("NuxtLink");

useSeoMeta({
  title: "Documentation - OpenECU Alliance",
  description:
    "Learn how to create adapters, CAN protocols, and 3D models for the OpenECU Alliance.",
});

const guides = [
  {
    icon: "i-heroicons-rocket-launch",
    title: "Getting Started",
    description: "Introduction to OpenECU Alliance and the adapter ecosystem.",
    to: "/docs/getting-started",
    color: "primary",
  },
  {
    icon: "i-heroicons-document-plus",
    title: "Creating Adapters",
    description: "Step-by-step guide to creating your own adapter.",
    to: "/docs/creating-adapters",
    color: "primary",
  },
  {
    icon: "i-heroicons-signal",
    title: "Creating Protocols",
    description: "Define CAN Bus messages and signals for real-time data.",
    to: "/docs/creating-protocols",
    color: "success",
  },
  {
    icon: "i-heroicons-cube",
    title: "Creating 3D Models",
    description: "Contribute printable mounts, enclosures, and accessories.",
    to: "/docs/creating-models",
    color: "warning",
  },
  {
    icon: "i-heroicons-check-badge",
    title: "Compliance Levels",
    description: "Understanding Level 1-3 compliance for applications.",
    to: "/docs/compliance",
    color: "primary",
  },
  {
    icon: "i-heroicons-users",
    title: "Governance",
    description: "How the Alliance operates and makes decisions.",
    to: "/docs/governance",
    color: "primary",
  },
];

const references = [
  {
    icon: "i-heroicons-document-text",
    title: "Full Specification",
    description: "Complete technical specification for adapter files.",
    to: "/spec",
  },
  {
    icon: "i-heroicons-paint-brush",
    title: "Branding Guidelines",
    description: "How to properly use OpenECU Alliance trademarks.",
    to: "/docs/branding",
  },
  {
    icon: "i-heroicons-building-office-2",
    title: "Project Charter",
    description: "Mission, values, and project donation process.",
    to: "/docs/project-charter",
  },
];
</script>

<template>
  <div class="py-8 px-4">
    <UContainer>
      <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold mb-2">Documentation</h1>
        <p class="text-lg text-muted">
          Learn how to create adapters, protocols, and 3D models for the
          OpenECU Alliance.
        </p>
      </div>

      <!-- Guides -->
      <section class="mb-12">
        <h2 class="text-xl font-semibold mb-4">Guides</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <UCard
            v-for="guide in guides"
            :key="guide.title"
            :as="NuxtLink"
            :to="guide.to"
            class="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
          >
            <div class="flex items-start gap-3">
              <div :class="`bg-${guide.color || 'primary'}/10`" class="p-2 rounded-lg shrink-0">
                <UIcon :name="guide.icon" :class="`size-5 text-${guide.color || 'primary'}`" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold mb-1">{{ guide.title }}</h3>
                <p class="text-sm text-muted">{{ guide.description }}</p>
              </div>
              <UIcon
                name="i-heroicons-chevron-right"
                class="size-5 text-muted shrink-0"
              />
            </div>
          </UCard>
        </div>
      </section>

      <!-- Reference -->
      <section class="mb-12">
        <h2 class="text-xl font-semibold mb-4">Reference</h2>
        <div class="grid sm:grid-cols-3 gap-4">
          <UCard
            v-for="ref in references"
            :key="ref.title"
            :as="NuxtLink"
            :to="ref.to"
            class="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
          >
            <div class="flex flex-col items-center text-center">
              <div class="bg-primary/10 p-3 rounded-xl mb-3">
                <UIcon :name="ref.icon" class="size-5 text-primary" />
              </div>
              <h3 class="font-semibold mb-1">{{ ref.title }}</h3>
              <p class="text-sm text-muted">{{ ref.description }}</p>
            </div>
          </UCard>
        </div>
      </section>

      <!-- Resources -->
      <section>
        <h2 class="text-xl font-semibold mb-4">External Resources</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <UCard
            :as="NuxtLink"
            to="https://github.com/ClassicMiniDIY/OECUASpecs"
            target="_blank"
            class="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
          >
            <div class="flex items-center gap-3">
              <UIcon name="i-simple-icons-github" class="size-6" />
              <div class="flex-1">
                <h3 class="font-semibold">GitHub Repository</h3>
                <p class="text-sm text-muted">
                  Specification and adapter registry
                </p>
              </div>
              <UIcon
                name="i-heroicons-arrow-top-right-on-square"
                class="size-4 text-muted"
              />
            </div>
          </UCard>

          <UCard
            :as="NuxtLink"
            to="https://github.com/ClassicMiniDIY/OECUASpecs/blob/main/schema/adapter.schema.json"
            target="_blank"
            class="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
          >
            <div class="flex items-center gap-3">
              <UIcon
                name="i-heroicons-code-bracket"
                class="size-6 text-primary"
              />
              <div class="flex-1">
                <h3 class="font-semibold">JSON Schema</h3>
                <p class="text-sm text-muted">
                  Validate adapters against schema
                </p>
              </div>
              <UIcon
                name="i-heroicons-arrow-top-right-on-square"
                class="size-4 text-muted"
              />
            </div>
          </UCard>
        </div>
      </section>
    </UContainer>
  </div>
</template>
