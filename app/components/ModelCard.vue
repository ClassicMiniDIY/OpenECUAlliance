<script setup lang="ts">
import type { Model } from "~/types/model";

const NuxtLink = resolveComponent("NuxtLink");

const props = defineProps<{
  model: Model;
}>();

const { getVendorIcon } = useVendorIcons();
const { getCategoryLabel, getCategoryIcon } = useModels();

const fallbackIcon = computed(() =>
  props.model.vendor ? getVendorIcon(props.model.vendor) : getCategoryIcon(props.model.category),
);

const accessibleDescription = computed(() => {
  const desc = props.model.description || `3D model for ${props.model.name}`;
  const time = props.model.estimatedTimeHours
    ? `${props.model.estimatedTimeHours} hour print time.`
    : "";
  return `${props.model.name}. ${desc} ${props.model.recommendedMaterial} material. ${time} Version ${props.model.version}.`;
});

const formattedPrintTime = computed(() => {
  if (!props.model.estimatedTimeHours) return null;
  const hours = Math.floor(props.model.estimatedTimeHours);
  const minutes = Math.round((props.model.estimatedTimeHours - hours) * 60);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
});
</script>

<template>
  <UCard
    :as="NuxtLink"
    :to="`/models/${model.category}/${model.id}`"
    class="hover:ring-2 hover:ring-warning/50 transition-all cursor-pointer"
    :aria-label="accessibleDescription"
  >
    <div class="flex flex-col h-full">
      <!-- Image Preview -->
      <div
        v-if="model.primaryImage"
        class="relative aspect-video bg-muted/30 rounded-lg mb-3 overflow-hidden"
      >
        <img
          :src="model.primaryImage"
          :alt="model.name"
          class="w-full h-full object-cover"
        />
        <UBadge
          color="warning"
          variant="solid"
          size="sm"
          class="absolute top-2 right-2"
        >
          {{ getCategoryLabel(model.category) }}
        </UBadge>
      </div>

      <!-- No Image Fallback -->
      <div
        v-else
        class="relative aspect-video bg-muted/30 rounded-lg mb-3 flex items-center justify-center"
      >
        <UIcon
          :name="getCategoryIcon(model.category)"
          class="size-12 text-muted"
          aria-hidden="true"
        />
        <UBadge
          color="warning"
          variant="solid"
          size="sm"
          class="absolute top-2 right-2"
        >
          {{ getCategoryLabel(model.category) }}
        </UBadge>
      </div>

      <!-- Header -->
      <div class="flex items-start gap-3 mb-2">
        <div
          class="bg-warning/10 p-2 rounded-lg shrink-0 flex items-center justify-center size-8"
          aria-hidden="true"
        >
          <img
            v-if="model.branding?.icon"
            :src="model.branding.icon"
            :alt="`${model.vendor} logo`"
            class="size-4 object-contain"
          />
          <UIcon
            v-else
            :name="fallbackIcon"
            class="size-4 text-warning"
            aria-hidden="true"
          />
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="font-semibold truncate text-sm">{{ model.name }}</h3>
          <p v-if="model.vendor" class="text-xs text-muted">{{ model.vendor }}</p>
        </div>
      </div>

      <!-- Description -->
      <p class="text-xs text-muted line-clamp-2 mb-3 flex-1">
        {{ model.description || `3D printable ${getCategoryLabel(model.category).toLowerCase()}` }}
      </p>

      <!-- Footer -->
      <div
        class="flex items-center justify-between text-xs text-muted pt-2 border-t border-default"
      >
        <div class="flex items-center gap-2">
          <UBadge color="neutral" variant="outline" size="sm">
            {{ model.recommendedMaterial }}
          </UBadge>
          <span v-if="formattedPrintTime" class="flex items-center gap-1">
            <UIcon name="i-heroicons-clock" class="size-3" aria-hidden="true" />
            {{ formattedPrintTime }}
          </span>
        </div>
        <div class="flex gap-1">
          <UBadge
            v-for="format in model.fileFormats.slice(0, 2)"
            :key="format"
            color="neutral"
            variant="subtle"
            size="sm"
          >
            {{ format }}
          </UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>
