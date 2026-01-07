<script setup lang="ts">
import { EXTERNAL_PLATFORMS, type ExternalPlatform } from "~/types/model";

export interface ExternalMetadata {
  platform: ExternalPlatform;
  externalId: string;
  title: string;
  description: string;
  authorName: string;
  authorUrl: string | null;
  images: Array<{ url: string; isPrimary: boolean }>;
  license: string | null;
  tags: string[];
  remixesAllowed: boolean;
  commercialUseAllowed: boolean;
  normalizedUrl: string;
}

const props = defineProps<{
  metadata: ExternalMetadata;
}>();

const platformInfo = computed(
  () => EXTERNAL_PLATFORMS[props.metadata.platform],
);

const primaryImage = computed(
  () =>
    props.metadata.images.find((img) => img.isPrimary) ||
    props.metadata.images[0],
);

const truncatedDescription = computed(() => {
  const desc = props.metadata.description;
  if (desc.length <= 300) return desc;
  return desc.substring(0, 300) + "...";
});
</script>

<template>
  <div class="rounded-lg border border-border bg-card p-4 space-y-4">
    <div class="flex items-start gap-4">
      <div
        v-if="primaryImage"
        class="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted"
      >
        <img
          :src="primaryImage.url"
          :alt="metadata.title"
          class="w-full h-full object-cover"
        />
      </div>

      <div class="flex-1 min-w-0 space-y-2">
        <div class="flex items-center gap-2">
          <LinkedModelBadge :platform="metadata.platform" show-name />
        </div>

        <h3 class="font-semibold text-lg truncate">{{ metadata.title }}</h3>

        <p class="text-sm text-muted line-clamp-3">
          {{ truncatedDescription }}
        </p>

        <div class="flex items-center gap-4 text-sm text-muted">
          <span v-if="metadata.authorName" class="flex items-center gap-1">
            <UIcon name="i-heroicons-user" class="size-4" />
            <a
              v-if="metadata.authorUrl"
              :href="metadata.authorUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-primary"
            >
              {{ metadata.authorName }}
            </a>
            <span v-else>{{ metadata.authorName }}</span>
          </span>

          <span v-if="metadata.license" class="flex items-center gap-1">
            <UIcon name="i-heroicons-scale" class="size-4" />
            {{ metadata.license }}
          </span>
        </div>

        <div v-if="metadata.tags.length > 0" class="flex flex-wrap gap-1">
          <UBadge
            v-for="tag in metadata.tags.slice(0, 5)"
            :key="tag"
            variant="subtle"
            size="xs"
          >
            {{ tag }}
          </UBadge>
          <UBadge v-if="metadata.tags.length > 5" variant="subtle" size="xs">
            +{{ metadata.tags.length - 5 }} more
          </UBadge>
        </div>
      </div>
    </div>

    <div
      v-if="metadata.images.length > 1"
      class="flex gap-2 overflow-x-auto pb-2"
    >
      <div
        v-for="(image, index) in metadata.images.slice(0, 6)"
        :key="index"
        class="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-muted"
      >
        <img
          :src="image.url"
          :alt="`Image ${index + 1}`"
          class="w-full h-full object-cover"
        />
      </div>
      <div
        v-if="metadata.images.length > 6"
        class="w-16 h-16 flex-shrink-0 rounded bg-muted flex items-center justify-center text-sm text-muted-foreground"
      >
        +{{ metadata.images.length - 6 }}
      </div>
    </div>

    <div
      class="flex items-center gap-4 text-xs text-muted pt-2 border-t border-border"
    >
      <span class="flex items-center gap-1">
        <UIcon
          :name="
            metadata.remixesAllowed
              ? 'i-heroicons-check-circle'
              : 'i-heroicons-x-circle'
          "
          :class="metadata.remixesAllowed ? 'text-green-500' : 'text-red-500'"
          class="size-4"
        />
        Remixes {{ metadata.remixesAllowed ? "allowed" : "not allowed" }}
      </span>
      <span class="flex items-center gap-1">
        <UIcon
          :name="
            metadata.commercialUseAllowed
              ? 'i-heroicons-check-circle'
              : 'i-heroicons-x-circle'
          "
          :class="
            metadata.commercialUseAllowed ? 'text-green-500' : 'text-red-500'
          "
          class="size-4"
        />
        Commercial use
        {{ metadata.commercialUseAllowed ? "allowed" : "not allowed" }}
      </span>
    </div>
  </div>
</template>
