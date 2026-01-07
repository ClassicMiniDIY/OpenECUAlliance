<script setup lang="ts">
  import type { ModelCategory } from '~/types/model';

  useSeoMeta({
    title: '3D Printable ECU Mounts & Accessories - OpenECU Alliance',
    description:
      'Browse 3D printable ECU mounts, enclosures, brackets, and accessories. Download STL, STEP, and 3MF files with print settings.',
    ogTitle: '3D Printable ECU Mounts & Accessories',
    ogDescription:
      'Free 3D printable mounts, enclosures, and brackets for ECU installations. Download STL, STEP, and 3MF files.',
    twitterCard: 'summary_large_image',
  });

  const { models, vendors, categories, materials, filterModels, loading, getCategoryLabel } = useModels();

  const search = ref('');
  const selectedVendor = ref<string>();
  const selectedCategory = ref<ModelCategory>();
  const selectedMaterial = ref<string>();

  const filteredModels = computed(() => {
    return filterModels({
      search: search.value,
      vendor: selectedVendor.value,
      category: selectedCategory.value,
      material: selectedMaterial.value,
    });
  });

  const hasActiveFilters = computed(() => {
    return search.value || selectedVendor.value || selectedCategory.value || selectedMaterial.value;
  });

  function clearFilters() {
    search.value = '';
    selectedVendor.value = undefined;
    selectedCategory.value = undefined;
    selectedMaterial.value = undefined;
  }

  const searchAnnouncement = computed(() => {
    if (loading.value) return 'Loading models...';
    if (hasActiveFilters.value) {
      return `Showing ${filteredModels.value.length} of ${models.value.length} models`;
    }
    return `${models.value.length} models available`;
  });
</script>

<template>
  <div>
    <UContainer class="py-12">
      <!-- Header -->
      <div class="text-center max-w-3xl mx-auto mb-12">
        <UBadge color="warning" variant="subtle" class="mb-4"> 3D Printable </UBadge>

        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-4">3D Models</h1>

        <p class="text-lg text-muted mb-8">
          Browse 3D printable ECU mounts, enclosures, brackets, and accessories. Download files with recommended print
          settings.
        </p>

        <!-- Search -->
        <div class="max-w-xl mx-auto">
          <UInput
            v-model="search"
            icon="i-heroicons-magnifying-glass"
            placeholder="Search models..."
            size="lg"
            variant="subtle"
            class="w-full"
            aria-label="Search models"
          >
            <template #trailing>
              <UButton
                v-if="search"
                color="neutral"
                variant="link"
                size="lg"
                icon="i-heroicons-x-mark"
                aria-label="Clear search"
                @click="search = ''"
              />
            </template>
          </UInput>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-2 justify-center mt-6">
          <USelectMenu
            v-model="selectedCategory"
            :items="[
              { label: 'All Categories', value: undefined },
              ...categories.map((c) => ({
                label: getCategoryLabel(c),
                value: c,
              })),
            ]"
            value-key="value"
            size="md"
            color="neutral"
            variant="outline"
            placeholder="Category"
            class="w-36"
          />
          <USelectMenu
            v-model="selectedVendor"
            :items="[
              { label: 'All Vendors', value: undefined },
              ...vendors.map((v) => ({
                label: v.charAt(0).toUpperCase() + v.slice(1),
                value: v,
              })),
            ]"
            value-key="value"
            size="md"
            color="neutral"
            variant="outline"
            placeholder="Vendor"
            class="w-36"
          />
          <USelectMenu
            v-model="selectedMaterial"
            :items="[
              { label: 'All Materials', value: undefined },
              ...materials.map((m) => ({
                label: m,
                value: m,
              })),
            ]"
            value-key="value"
            size="md"
            color="neutral"
            variant="outline"
            placeholder="Material"
            class="w-32"
          />
        </div>
      </div>

      <!-- ARIA Live Region -->
      <div class="sr-only" aria-live="polite" aria-atomic="true">
        {{ searchAnnouncement }}
      </div>

      <!-- Results Header -->
      <div class="flex justify-between items-center mb-4 text-sm text-muted">
        <div class="flex items-center gap-2">
          <span v-if="hasActiveFilters"> Showing {{ filteredModels.length }} of {{ models.length }} models </span>
          <span v-else>{{ models.length }} models available</span>
          <UButton
            v-if="hasActiveFilters"
            color="neutral"
            variant="link"
            size="md"
            icon="i-heroicons-x-mark"
            @click="clearFilters"
          >
            Clear filters
          </UButton>
        </div>
        <NuxtLink to="/models/upload" class="hidden md:flex items-center gap-1 hover:text-warning transition-colors">
          Upload a model
          <UIcon name="i-heroicons-arrow-right" class="size-4" />
        </NuxtLink>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-24" role="status" aria-busy="true">
        <UIcon name="i-heroicons-arrow-path" class="size-8 text-warning animate-spin mb-4" />
        <p class="text-muted">Loading models...</p>
      </div>

      <!-- Model Grid -->
      <div v-else-if="filteredModels.length > 0" class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <ModelCard v-for="model in filteredModels" :key="model.id" :model="model" />
      </div>

      <!-- Empty State -->
      <UCard v-else class="text-center py-12">
        <UIcon name="i-heroicons-cube-transparent" class="size-12 text-muted mx-auto mb-4" />
        <h3 class="font-semibold mb-2">No models found</h3>
        <p class="text-muted mb-4">There's no model matching your search yet. Be the first to create it!</p>
        <div class="flex gap-2 justify-center">
          <UButton color="warning" variant="soft" to="/models/upload"> Upload a model </UButton>
          <UButton color="neutral" variant="ghost" @click="clearFilters"> Clear filters </UButton>
        </div>
      </UCard>
    </UContainer>
  </div>
</template>
