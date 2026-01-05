<script setup lang="ts">
const navigation = [
  { label: 'Adapters', to: '/adapters' },
  { label: 'Ecosystem', to: '/ecosystem' },
  { label: 'Spec', to: '/spec' },
  { label: 'Docs', to: '/docs' },
]

const colorMode = useColorMode()

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/" class="flex items-center gap-2">
        <UIcon name="i-heroicons-cpu-chip" class="size-7 text-primary" />
        <span class="font-bold text-lg">OpenECU Alliance</span>
      </NuxtLink>
    </template>

    <template #center>
      <UNavigationMenu :items="navigation" class="hidden md:flex" />
    </template>

    <template #right>
      <UTooltip text="Toggle color mode">
        <UButton
          :icon="colorMode.value === 'dark' ? 'i-heroicons-moon' : 'i-heroicons-sun'"
          color="neutral"
          variant="ghost"
          @click="toggleColorMode"
        />
      </UTooltip>

      <UTooltip text="GitHub">
        <UButton
          to="https://github.com/openecualliance"
          target="_blank"
          icon="i-simple-icons-github"
          color="neutral"
          variant="ghost"
        />
      </UTooltip>
    </template>

    <template #body>
      <UNavigationMenu :items="navigation" orientation="vertical" class="md:hidden" />
    </template>
  </UHeader>
</template>
