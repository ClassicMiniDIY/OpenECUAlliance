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
    description: "Introduction to OpenECU Alliance and the content ecosystem.",
    to: "/docs/getting-started",
    color: "primary",
  },
  {
    icon: "i-heroicons-document-plus",
    title: "Creating Adapters",
    description: "Define log file formats for ECU data parsing.",
    to: "/docs/creating-adapters",
    color: "primary",
  },
  {
    icon: "i-heroicons-signal",
    title: "Creating Protocols",
    description: "Define CAN Bus messages and signals.",
    to: "/docs/creating-protocols",
    color: "success",
  },
  {
    icon: "i-heroicons-cube",
    title: "Submitting 3D Models",
    description: "Upload printable mounts, enclosures, and accessories.",
    to: "/docs/creating-models",
    color: "warning",
  },
];

const resources = [
  {
    icon: "i-heroicons-document-text",
    title: "Full Specification",
    description: "Technical reference for all content types.",
    to: "/spec",
    external: false,
  },
  {
    icon: "i-simple-icons-github",
    title: "GitHub Repository",
    description: "Adapters, protocols, models, and schemas.",
    to: "https://github.com/ClassicMiniDIY/OECUASpecs",
    external: true,
  },
  {
    icon: "i-heroicons-code-bracket",
    title: "JSON Schemas",
    description: "Validate your YAML files.",
    to: "https://github.com/ClassicMiniDIY/OECUASpecs/tree/main/schema",
    external: true,
  },
];
</script>

<template>
  <div class="py-8 px-4">
    <UContainer>
      <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold mb-2">Documentation</h1>
        <p class="text-lg text-muted">
          Learn how to create and contribute to the OpenECU Alliance.
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
              <div
                :class="`bg-${guide.color}/10`"
                class="p-2 rounded-lg shrink-0"
              >
                <UIcon
                  :name="guide.icon"
                  :class="`size-5 text-${guide.color}`"
                />
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

      <!-- Resources -->
      <section>
        <h2 class="text-xl font-semibold mb-4">Resources</h2>
        <div class="grid sm:grid-cols-3 gap-4">
          <UCard
            v-for="resource in resources"
            :key="resource.title"
            :as="NuxtLink"
            :to="resource.to"
            :target="resource.external ? '_blank' : undefined"
            class="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
          >
            <div class="flex items-center gap-3">
              <UIcon
                :name="resource.icon"
                class="size-5 text-primary shrink-0"
              />
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-sm">{{ resource.title }}</h3>
                <p class="text-xs text-muted">{{ resource.description }}</p>
              </div>
              <UIcon
                :name="
                  resource.external
                    ? 'i-heroicons-arrow-top-right-on-square'
                    : 'i-heroicons-chevron-right'
                "
                class="size-4 text-muted shrink-0"
              />
            </div>
          </UCard>
        </div>
      </section>
    </UContainer>
  </div>
</template>
