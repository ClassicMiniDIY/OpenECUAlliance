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
        external: true,
      },
      { label: "Contribute", to: "/contribute" },
      { label: "Discord", to: "#", target: "_blank", external: true },
    ],
  },
  {
    label: "Ecosystem",
    children: [
      {
        label: "UltraLog",
        to: "https://ultralog.co",
        target: "_blank",
        external: true,
      },
    ],
  },
];

const currentYear = new Date().getFullYear();
</script>

<template>
  <UFooter>
    <template #left>
      <div class="flex items-center gap-2">
        <UIcon
          name="i-heroicons-cpu-chip"
          class="size-5 text-muted"
          aria-hidden="true"
        />
        <span class="text-muted text-sm">OpenECU Alliance</span>
      </div>
    </template>

    <template #center>
      <nav aria-label="Footer navigation">
        <div class="flex flex-wrap justify-center gap-x-8 gap-y-2">
          <template v-for="section in links" :key="section.label">
            <template v-for="link in section.children" :key="link.label">
              <ULink
                :to="link.to"
                :target="link.target"
                :rel="link.external ? 'noopener noreferrer' : undefined"
                :aria-label="
                  link.external
                    ? `${link.label} (opens in new tab)`
                    : link.label
                "
                class="text-sm text-muted hover:text-default"
              >
                {{ link.label }}
                <span v-if="link.external" class="sr-only">
                  (opens in new tab)
                </span>
              </ULink>
            </template>
          </template>
        </div>
      </nav>
    </template>

    <template #right>
      <span class="text-muted text-sm">
        &copy; {{ currentYear }} OpenECU Alliance
      </span>
    </template>
  </UFooter>
</template>
