<script setup lang="ts">
const navigation = [
  {
    label: "Browse",
    children: [
      { label: "All", to: "/", description: "Browse all content" },
      { label: "Adapters", to: "/adapters", description: "Log file format definitions" },
      { label: "Protocols", to: "/protocols", description: "CAN Bus protocol definitions" },
      { label: "3D Models", to: "/models", description: "Printable mounts & accessories" },
    ],
  },
  { label: "Ecosystem", to: "/ecosystem" },
  { label: "Spec", to: "/spec" },
  { label: "Docs", to: "/docs" },
  { label: "Contribute", to: "/contribute" },
];
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink
        to="/"
        class="flex items-center gap-2"
        aria-label="OpenECU Alliance - Home"
      >
        <UIcon
          name="i-heroicons-cpu-chip"
          class="size-7 text-primary"
          aria-hidden="true"
        />
        <span class="font-bold text-lg">OpenECU Alliance</span>
      </NuxtLink>
    </template>

    <!-- Default slot for navigation -->
    <nav aria-label="Main navigation">
      <UNavigationMenu :items="navigation" class="hidden md:flex" />
    </nav>

    <template #right>
      <UTooltip text="View source on GitHub">
        <UButton
          to="https://github.com/ClassicMiniDIY/OpenECUAlliance"
          target="_blank"
          icon="i-simple-icons-github"
          color="neutral"
          variant="ghost"
          aria-label="View source on GitHub (opens in new tab)"
          rel="noopener noreferrer"
        />
      </UTooltip>
    </template>

    <template #body>
      <nav aria-label="Mobile navigation">
        <UNavigationMenu :items="navigation" orientation="vertical" />
      </nav>
    </template>
  </UHeader>
</template>
