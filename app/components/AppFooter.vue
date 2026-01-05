<script setup lang="ts">
const links = [
  {
    label: "Resources",
    children: [
      { label: "Specification", to: "/spec" },
      { label: "Documentation", to: "/docs" },
      { label: "JSON Schema", to: "/spec/schema" },
    ],
  },
  {
    label: "Community",
    children: [
      {
        label: "GitHub",
        to: "https://github.com/ClassicMiniDIY/OpenECUAlliance",
        target: "_blank",
      },
      { label: "Contribute", to: "/contribute" },
      { label: "Discord", to: "#", target: "_blank" },
    ],
  },
  {
    label: "Ecosystem",
    children: [
      { label: "UltraLog", to: "https://ultralog.app", target: "_blank" },
    ],
  },
];
</script>

<template>
  <UFooter>
    <template #left>
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-cpu-chip" class="size-5 text-muted" />
        <span class="text-muted text-sm">OpenECU Alliance</span>
      </div>
    </template>

    <template #center>
      <div class="flex flex-wrap justify-center gap-x-8 gap-y-2">
        <template v-for="section in links" :key="section.label">
          <template v-for="link in section.children" :key="link.label">
            <ULink
              :to="link.to"
              :target="link.target"
              class="text-sm text-muted hover:text-default"
            >
              {{ link.label }}
            </ULink>
          </template>
        </template>
      </div>
    </template>

    <template #right>
      <span class="text-muted text-sm">
        &copy; {{ new Date().getFullYear() }} OpenECU Alliance
      </span>
    </template>
  </UFooter>
</template>
