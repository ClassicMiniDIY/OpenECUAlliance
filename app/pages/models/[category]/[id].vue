<script setup lang="ts">
import type { ModelDetail } from "~/types/model";

const route = useRoute();
const category = route.params.category as string;
const id = route.params.id as string;

const { data: model, status } = await useFetch<ModelDetail>(
  `/api/models/${category}/${id}`,
  {
    key: `model-${category}-${id}`,
  },
);

const { getVendorIcon } = useVendorIcons();
const { getCategoryLabel, getCategoryIcon } = useModels();

useSeoMeta({
  title: () =>
    model.value
      ? `${model.value.name} - OpenECU Alliance`
      : "Model - OpenECU Alliance",
  description: () =>
    model.value?.description || "3D printable ECU accessory",
});

const fallbackIcon = computed(() =>
  model.value?.vendor
    ? getVendorIcon(model.value.vendor)
    : getCategoryIcon(category as any),
);

// Primary image
const primaryImage = computed(() => {
  if (!model.value?.images) return null;
  return (
    model.value.images.find((img) => img.primary) || model.value.images[0]
  );
});

// Primary file
const primaryFile = computed(() => {
  if (!model.value?.files) return null;
  return model.value.files.find((f) => f.primary) || model.value.files[0];
});

// Formatted print time
const formattedPrintTime = computed(() => {
  if (!model.value?.printing.estimatedTimeHours) return null;
  const hours = Math.floor(model.value.printing.estimatedTimeHours);
  const minutes = Math.round(
    (model.value.printing.estimatedTimeHours - hours) * 60,
  );
  if (hours === 0) return `${minutes} minutes`;
  if (minutes === 0) return `${hours} hours`;
  return `${hours}h ${minutes}m`;
});
</script>

<template>
  <div>
    <UContainer class="py-8">
      <!-- Breadcrumb -->
      <nav class="mb-6" aria-label="Breadcrumb">
        <ol class="flex items-center gap-2 text-sm text-muted">
          <li>
            <NuxtLink to="/models" class="hover:text-primary"> Models </NuxtLink>
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
          <li aria-hidden="true">/</li>
          <li class="text-default font-medium truncate">
            {{ model?.name || id }}
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
        <p class="text-muted mb-4">The model "{{ id }}" could not be found.</p>
        <UButton to="/models" variant="soft">Back to Models</UButton>
      </UCard>

      <!-- Model Detail -->
      <div v-else-if="model" class="grid lg:grid-cols-2 gap-8">
        <!-- Left: Images & Files -->
        <div>
          <!-- Primary Image -->
          <div
            class="aspect-video bg-muted/30 rounded-xl overflow-hidden mb-4"
          >
            <img
              v-if="primaryImage"
              :src="primaryImage.url"
              :alt="model.name"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center"
            >
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
              :key="img.filename"
              class="aspect-square bg-muted/30 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-warning/50"
            >
              <img
                :src="img.url"
                :alt="img.description || model.name"
                class="w-full h-full object-cover"
              />
            </div>
          </div>

          <!-- Download Files -->
          <UCard>
            <template #header>
              <h3 class="font-semibold">Download Files</h3>
            </template>
            <div class="space-y-2">
              <a
                v-for="file in model.files"
                :key="file.filename"
                :href="file.downloadUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <UIcon name="i-heroicons-document" class="size-5 text-muted" />
                  <div>
                    <div class="font-medium text-sm">{{ file.filename }}</div>
                    <div class="text-xs text-muted">
                      {{ file.format.toUpperCase() }}
                      <span v-if="file.description">
                        • {{ file.description }}
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
              <img
                v-if="model.branding?.icon"
                :src="model.branding.icon"
                :alt="`${model.vendor} logo`"
                class="size-10 object-contain"
              />
              <UIcon v-else :name="fallbackIcon" class="size-10 text-warning" />
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h1 class="text-2xl font-bold">{{ model.name }}</h1>
                <UBadge color="warning" variant="subtle">
                  {{ getCategoryLabel(model.category) }}
                </UBadge>
              </div>
              <p v-if="model.vendor" class="text-muted capitalize">
                {{ model.vendor }}
              </p>
            </div>
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
                <div class="font-medium">{{ model.printing.infillPercent }}%</div>
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
        </div>
      </div>
    </UContainer>
  </div>
</template>
