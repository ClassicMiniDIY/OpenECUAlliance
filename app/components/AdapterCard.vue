<script setup lang="ts">
import type { Adapter } from '~/types/adapter'

const props = defineProps<{
  adapter: Adapter
}>()

const { getVendorIcon } = useVendorIcons()

const icon = computed(() => getVendorIcon(props.adapter.vendor))
</script>

<template>
  <UCard
    :to="`/adapters/${adapter.vendor}/${adapter.id}`"
    class="hover:ring-2 hover:ring-primary/50 transition-all"
  >
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="flex items-start gap-3 mb-3">
        <div class="bg-muted/50 p-2.5 rounded-lg shrink-0">
          <UIcon :name="icon" class="size-5 text-primary" />
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
      <div class="flex items-center justify-between text-xs text-muted pt-3 border-t border-default">
        <div class="flex items-center gap-1">
          <UIcon name="i-heroicons-queue-list" class="size-3.5" />
          <span>{{ adapter.channelCount }} channels</span>
        </div>
        <UBadge color="neutral" variant="subtle" size="xs">
          v{{ adapter.version }}
        </UBadge>
      </div>
    </div>
  </UCard>
</template>
