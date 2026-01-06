<script setup lang="ts">
import type { Adapter } from "~/types/adapter";

const NuxtLink = resolveComponent("NuxtLink");

const props = defineProps<{
  adapter: Adapter;
}>();

const { getVendorIcon } = useVendorIcons();

const fallbackIcon = computed(() => getVendorIcon(props.adapter.vendor));

// Generate accessible description for screen readers
const accessibleDescription = computed(() => {
  const desc =
    props.adapter.description || `Adapter for ${props.adapter.name} log files`;
  return `${props.adapter.name} by ${props.adapter.vendor}. ${desc} ${props.adapter.channelCount} channels. Version ${props.adapter.version}.`;
});
</script>

<template>
  <UCard
    :as="NuxtLink"
    :to="`/adapters/${adapter.vendor}/${adapter.id}`"
    class="hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer"
    :aria-label="accessibleDescription"
  >
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="flex items-start gap-3 mb-3">
        <div
          class="bg-muted/50 p-2.5 rounded-lg shrink-0 flex items-center justify-center size-10"
          aria-hidden="true"
        >
          <img
            v-if="adapter.branding?.icon"
            :src="adapter.branding.icon"
            :alt="`${adapter.vendor} logo`"
            class="size-5 object-contain"
          />
          <UIcon
            v-else
            :name="fallbackIcon"
            class="size-5 text-primary"
            aria-hidden="true"
          />
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="font-semibold truncate">{{ adapter.name }}</h3>
          <p class="text-sm text-muted">{{ adapter.vendor }}</p>
        </div>
      </div>

      <!-- Description -->
      <p class="text-sm text-muted line-clamp-2 mb-4 flex-1">
        {{ adapter.description || `Adapter for ${adapter.name} log files` }}
      </p>

      <!-- Footer -->
      <div
        class="flex items-center justify-between text-sm text-muted pt-3 border-t border-default"
      >
        <div class="flex items-center gap-1">
          <UIcon
            name="i-heroicons-queue-list"
            class="size-3.5"
            aria-hidden="true"
          />
          <span>{{ adapter.channelCount }} channels</span>
        </div>
        <UBadge color="neutral" variant="subtle" size="md">
          v{{ adapter.version }}
        </UBadge>
      </div>
    </div>
  </UCard>
</template>
