<script setup lang="ts">
import type { UserModelDetail } from "~/types/model";
import { EXTERNAL_PLATFORMS } from "~/types/model";

const route = useRoute();
const category = route.params.category as string;
const slug = route.params.slug as string;

const { data: model, status } = await useFetch<UserModelDetail>(
  `/api/models/${category}/${slug}`,
  {
    key: `model-${category}-${slug}`,
  },
);

const { getVendorIcon } = useVendorIcons();
const { getCategoryLabel, getCategoryIcon } = useModels();

// Check if this is a pending/unpublished model (user's own preview)
const isPending = computed(() => model.value?.status === "pending");
const isUnpublished = computed(() => !model.value?.isPublished);

useSeoMeta({
  title: () =>
    model.value
      ? `${model.value.name} - 3D Print - OpenECU Alliance`
      : "3D Model - OpenECU Alliance",
  description: () =>
    model.value?.description ||
    "Free 3D printable ECU mount or accessory. Download STL, STEP, and 3MF files.",
  ogTitle: () =>
    model.value ? `${model.value.name} - 3D Printable` : "3D Printable Model",
  ogDescription: () =>
    model.value?.description ||
    "Free 3D printable ECU mount or accessory. Download STL, STEP, and 3MF files.",
  ogType: "article",
  twitterCard: "summary_large_image",
});

const fallbackIcon = computed(() =>
  model.value?.vendor
    ? getVendorIcon(model.value.vendor)
    : getCategoryIcon(category as any),
);

// Primary image
const primaryImage = computed(() => {
  if (!model.value?.images?.length) return null;
  return (
    model.value.images.find((img) => img.isPrimary) || model.value.images[0]
  );
});

// Formatted print time
const formattedPrintTime = computed(() => {
  if (!model.value?.printing?.estimatedTimeHours) return null;
  const hours = Math.floor(model.value.printing.estimatedTimeHours);
  const minutes = Math.round(
    (model.value.printing.estimatedTimeHours - hours) * 60,
  );
  if (hours === 0) return `${minutes} minutes`;
  if (minutes === 0) return `${hours} hours`;
  return `${hours}h ${minutes}m`;
});

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<template>
  <div>
    <UContainer class="py-8">
      <!-- Breadcrumb -->
      <nav class="mb-6" aria-label="Breadcrumb">
        <ol class="flex items-center gap-2 text-sm text-muted">
          <li v-if="isUnpublished">
            <NuxtLink to="/profile/models" class="hover:text-primary">
              My Models
            </NuxtLink>
          </li>
          <template v-else>
            <li>
              <NuxtLink to="/models" class="hover:text-primary">
                Models
              </NuxtLink>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <NuxtLink
                :to="`/models?category=${category}`"
                class="hover:text-primary capitalize"
              >
                {{ getCategoryLabel(category as any) }}
              </NuxtLink>
            </li>
          </template>
          <li aria-hidden="true">/</li>
          <li class="text-default font-medium truncate">
            {{ model?.name || slug }}
          </li>
        </ol>
      </nav>

      <!-- Loading -->
      <div
        v-if="status === 'pending'"
        class="flex items-center justify-center py-24"
      >
        <UIcon
          name="i-heroicons-arrow-path"
          class="size-8 text-warning animate-spin"
        />
      </div>

      <!-- Error -->
      <UCard v-else-if="status === 'error'" class="text-center py-12">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="size-12 text-error mx-auto mb-4"
        />
        <h2 class="font-semibold mb-2">Model not found</h2>
        <p class="text-muted mb-4">
          The model "{{ slug }}" could not be found.
        </p>
        <UButton to="/models" variant="soft">Back to Models</UButton>
      </UCard>

      <!-- Pending Status Banner -->
      <div
        v-if="model && isPending"
        class="mb-6 p-4 bg-warning/10 border border-warning/30 rounded-xl flex items-center gap-3"
      >
        <UIcon name="i-heroicons-clock" class="size-6 text-warning shrink-0" />
        <div>
          <p class="font-medium text-warning">Pending Review</p>
          <p class="text-sm text-muted">
            This model is awaiting moderator approval. Social features are
            disabled until it's published.
          </p>
        </div>
      </div>

      <!-- Model Detail -->
      <div v-if="model" class="grid lg:grid-cols-2 gap-8">
        <!-- Left: Images & Files -->
        <div>
          <!-- Primary Image -->
          <div class="aspect-video bg-muted/30 rounded-xl overflow-hidden mb-4">
            <img
              v-if="primaryImage"
              :src="primaryImage.url"
              :alt="model.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon
                :name="getCategoryIcon(model.category)"
                class="size-24 text-muted"
              />
            </div>
          </div>

          <!-- Image Gallery -->
          <div
            v-if="model.images && model.images.length > 1"
            class="grid grid-cols-4 gap-2 mb-6"
          >
            <div
              v-for="img in model.images"
              :key="img.id"
              class="aspect-square bg-muted/30 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-warning/50"
            >
              <img
                :src="img.thumbnailUrl || img.url"
                :alt="model.name"
                class="w-full h-full object-cover"
              />
            </div>
          </div>

          <!-- Download Files (or External Link for linked models) -->
          <UCard v-if="model.isLinked && model.externalUrl">
            <template #header>
              <h3 class="font-semibold">Get This Model</h3>
            </template>
            <div class="space-y-4">
              <p class="text-sm text-muted">
                This model is hosted externally. Click below to view and
                download on the original platform.
              </p>
              <UButton
                :href="model.externalUrl"
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
                size="lg"
                block
              >
                <LinkedModelBadge
                  v-if="model.externalPlatform"
                  :platform="model.externalPlatform"
                  class="mr-2"
                />
                View on
                {{
                  model.externalPlatform
                    ? EXTERNAL_PLATFORMS[model.externalPlatform]?.name
                    : "Original Site"
                }}
                <UIcon
                  name="i-heroicons-arrow-top-right-on-square"
                  class="size-4 ml-2"
                />
              </UButton>
              <div
                v-if="model.externalAuthorName"
                class="text-xs text-muted text-center"
              >
                Originally shared by
                <a
                  v-if="model.externalAuthorUrl"
                  :href="model.externalAuthorUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary hover:underline"
                >
                  {{ model.externalAuthorName }}
                </a>
                <span v-else>{{ model.externalAuthorName }}</span>
              </div>
            </div>
          </UCard>
          <UCard v-else>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="font-semibold">Download Files</h3>
                <span class="text-xs text-muted">
                  {{ model.downloadsCount }} downloads
                </span>
              </div>
            </template>
            <div class="space-y-2">
              <a
                v-for="file in model.files"
                :key="file.id"
                :href="file.downloadUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <UIcon
                    name="i-heroicons-document"
                    class="size-5 text-muted"
                  />
                  <div>
                    <div class="font-medium text-sm">
                      {{ file.originalFilename }}
                    </div>
                    <div class="text-xs text-muted">
                      {{ file.format.toUpperCase() }}
                      <span v-if="file.sizeBytes">
                        • {{ formatFileSize(file.sizeBytes) }}
                      </span>
                    </div>
                  </div>
                </div>
                <UIcon
                  name="i-heroicons-arrow-down-tray"
                  class="size-5 text-warning"
                />
              </a>
            </div>
          </UCard>
        </div>

        <!-- Right: Details -->
        <div>
          <!-- Header -->
          <div class="flex items-start gap-4 mb-6">
            <div
              class="bg-warning/10 p-3 rounded-xl shrink-0"
              aria-hidden="true"
            >
              <UIcon :name="fallbackIcon" class="size-10 text-warning" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-1">
                    <h1 class="text-2xl font-bold wrap-break-word">
                      {{ model.name }}
                    </h1>
                    <UBadge color="warning" variant="subtle" class="shrink-0">
                      {{ getCategoryLabel(model.category) }}
                    </UBadge>
                    <UBadge
                      v-if="isPending"
                      color="warning"
                      variant="outline"
                      class="shrink-0"
                    >
                      Pending Review
                    </UBadge>
                    <UBadge
                      v-if="model.featured"
                      color="primary"
                      variant="subtle"
                      class="shrink-0"
                    >
                      Featured
                    </UBadge>
                    <LinkedModelBadge
                      v-if="model.isLinked && model.externalPlatform"
                      :platform="model.externalPlatform"
                      show-name
                      class="shrink-0"
                    />
                  </div>
                  <div class="flex items-center gap-2 text-sm text-muted">
                    <span v-if="model.vendor" class="capitalize">{{
                      model.vendor
                    }}</span>
                    <span v-if="model.vendor">·</span>
                    <NuxtLink
                      v-if="model.author"
                      :to="`/users/${model.author.username}`"
                      class="hover:text-primary flex items-center gap-1"
                    >
                      <UAvatar
                        :src="model.author.avatarUrl || undefined"
                        :alt="model.author.displayName || model.author.username"
                        size="2xs"
                      />
                      {{ model.author.displayName || model.author.username }}
                    </NuxtLink>
                  </div>
                </div>
                <div class="shrink-0">
                  <SocialLikeButton
                    v-if="!isUnpublished"
                    :model-id="model.id"
                    :initial-liked="model.isLikedByUser"
                    :initial-count="model.likesCount"
                    size="lg"
                  />
                  <UTooltip v-else text="Available after approval">
                    <UButton
                      color="neutral"
                      variant="ghost"
                      disabled
                      class="opacity-50"
                    >
                      <UIcon name="i-heroicons-heart" class="size-5" />
                      <span class="ml-1">{{ model.likesCount }}</span>
                    </UButton>
                  </UTooltip>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-4 mb-6 text-sm text-muted">
            <span class="flex items-center gap-1">
              <UIcon name="i-heroicons-heart" class="size-4" />
              {{ model.likesCount }} likes
            </span>
            <span class="flex items-center gap-1">
              <UIcon name="i-heroicons-chat-bubble-left" class="size-4" />
              {{ model.commentsCount }} comments
            </span>
            <span
              v-if="model.averageRating > 0"
              class="flex items-center gap-1"
            >
              <UIcon
                name="i-heroicons-star-solid"
                class="size-4 text-warning"
              />
              {{ model.averageRating.toFixed(1) }} ({{ model.ratingsCount }})
            </span>
          </div>

          <!-- Description -->
          <p class="text-muted mb-6 whitespace-pre-line">
            {{ model.description }}
          </p>

          <!-- Print Settings -->
          <UCard class="mb-6">
            <template #header>
              <h3 class="font-semibold">Print Settings</h3>
            </template>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div class="text-muted">Material</div>
                <div class="font-medium">
                  {{ model.printing.recommendedMaterial }}
                </div>
              </div>
              <div v-if="model.printing.layerHeight">
                <div class="text-muted">Layer Height</div>
                <div class="font-medium">
                  {{ model.printing.layerHeight }}mm
                </div>
              </div>
              <div v-if="model.printing.infillPercent">
                <div class="text-muted">Infill</div>
                <div class="font-medium">
                  {{ model.printing.infillPercent }}%
                </div>
              </div>
              <div v-if="model.printing.wallCount">
                <div class="text-muted">Walls</div>
                <div class="font-medium">{{ model.printing.wallCount }}</div>
              </div>
              <div>
                <div class="text-muted">Supports</div>
                <div class="font-medium">
                  {{ model.printing.supportsRequired ? "Required" : "None" }}
                </div>
              </div>
              <div v-if="formattedPrintTime">
                <div class="text-muted">Est. Time</div>
                <div class="font-medium">{{ formattedPrintTime }}</div>
              </div>
            </div>
            <div
              v-if="model.printing.notes"
              class="mt-4 p-3 bg-warning/10 rounded-lg text-sm"
            >
              <div class="font-medium text-warning mb-1">Print Notes</div>
              <div class="text-muted whitespace-pre-line">
                {{ model.printing.notes }}
              </div>
            </div>
          </UCard>

          <!-- Hardware -->
          <UCard v-if="model.hardware?.length" class="mb-6">
            <template #header>
              <h3 class="font-semibold">Required Hardware</h3>
            </template>
            <ul class="space-y-2">
              <li
                v-for="hw in model.hardware"
                :key="hw.item"
                class="flex items-start gap-2 text-sm"
              >
                <span
                  class="bg-muted/50 px-2 py-0.5 rounded text-xs font-medium shrink-0"
                >
                  {{ hw.quantity }}x
                </span>
                <div>
                  <span :class="{ 'text-muted': hw.optional }">
                    {{ hw.item }}
                    <span v-if="hw.optional" class="text-xs">(optional)</span>
                  </span>
                  <div v-if="hw.notes" class="text-xs text-muted">
                    {{ hw.notes }}
                  </div>
                </div>
              </li>
            </ul>
          </UCard>

          <!-- Assembly -->
          <UCard v-if="model.assembly?.steps?.length">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="font-semibold">Assembly Instructions</h3>
                <UBadge
                  v-if="model.assembly.difficulty"
                  color="neutral"
                  variant="subtle"
                >
                  {{ model.assembly.difficulty }}
                </UBadge>
              </div>
            </template>
            <ol class="space-y-2 list-decimal list-inside text-sm">
              <li v-for="(step, i) in model.assembly.steps" :key="i">
                {{ step }}
              </li>
            </ol>
            <div
              v-if="model.assembly.warnings?.length"
              class="mt-4 p-3 bg-error/10 rounded-lg"
            >
              <div class="font-medium text-error text-sm mb-2">Warnings</div>
              <ul class="space-y-1 text-sm text-muted">
                <li
                  v-for="(warning, i) in model.assembly.warnings"
                  :key="i"
                  class="flex items-start gap-2"
                >
                  <UIcon
                    name="i-heroicons-exclamation-triangle"
                    class="size-4 text-error shrink-0 mt-0.5"
                  />
                  {{ warning }}
                </li>
              </ul>
            </div>
          </UCard>

          <!-- License Info -->
          <div class="mt-6 text-xs text-muted flex items-center gap-4">
            <span>License: {{ model.license }}</span>
            <span v-if="model.remixesAllowed">Remixes allowed</span>
            <span v-if="model.commercialUseAllowed"
              >Commercial use allowed</span
            >
          </div>
        </div>
      </div>

      <!-- Social Section (Ratings & Comments) -->
      <div v-if="model" class="mt-12 grid lg:grid-cols-2 gap-8">
        <!-- Ratings -->
        <UCard :class="{ 'opacity-60': isUnpublished }">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold">Ratings & Reviews</h3>
              <UBadge
                v-if="isUnpublished"
                color="neutral"
                variant="outline"
                size="xs"
              >
                Disabled
              </UBadge>
            </div>
          </template>
          <div v-if="isUnpublished" class="text-center py-6 text-muted">
            <UIcon
              name="i-heroicons-star"
              class="size-8 mx-auto mb-2 opacity-50"
            />
            <p class="text-sm">Ratings will be available after approval</p>
          </div>
          <SocialRatingSection v-else :model-id="model.id" />
        </UCard>

        <!-- Comments -->
        <UCard :class="{ 'opacity-60': isUnpublished }">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold">Comments</h3>
              <UBadge
                v-if="isUnpublished"
                color="neutral"
                variant="outline"
                size="xs"
              >
                Disabled
              </UBadge>
            </div>
          </template>
          <div v-if="isUnpublished" class="text-center py-6 text-muted">
            <UIcon
              name="i-heroicons-chat-bubble-left"
              class="size-8 mx-auto mb-2 opacity-50"
            />
            <p class="text-sm">Comments will be available after approval</p>
          </div>
          <SocialCommentSection v-else :model-id="model.id" />
        </UCard>
      </div>
    </UContainer>
  </div>
</template>
