<script setup lang="ts">
useSeoMeta({
  title: "Adapters - OpenECU Alliance",
  description:
    "Browse log file adapters for popular ECU systems. Parse data from Haltech, ECUMaster, Link, AiM, and more.",
});

const { adapters, vendors, categories, fileFormats, filterAdapters, loading } =
  useAdapters();

const search = ref("");
const selectedVendor = ref<string>();
const selectedCategory = ref<string>();
const selectedFormat = ref<string>();

const filteredAdapters = computed(() => {
  return filterAdapters({
    search: search.value,
    vendor: selectedVendor.value,
    category: selectedCategory.value,
    fileFormat: selectedFormat.value,
  });
});

const hasActiveFilters = computed(() => {
  return search.value || selectedVendor.value || selectedCategory.value || selectedFormat.value;
});

function clearFilters() {
  search.value = "";
  selectedVendor.value = undefined;
  selectedCategory.value = undefined;
  selectedFormat.value = undefined;
}

const searchAnnouncement = computed(() => {
  if (loading.value) return "Loading adapters...";
  if (hasActiveFilters.value) {
    return `Showing ${filteredAdapters.value.length} of ${adapters.value.length} adapters`;
  }
  return `${adapters.value.length} adapters available`;
});
</script>

<template>
  <div>
    <UContainer class="py-12">
      <!-- Header -->
      <div class="text-center max-w-3xl mx-auto mb-12">
        <UBadge color="primary" variant="subtle" class="mb-4">
          Log Adapters
        </UBadge>

        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          ECU Log Adapters
        </h1>

        <p class="text-lg text-muted mb-8">
          Browse log file format definitions for popular ECU systems.
          Parse data from any supported format with ease.
        </p>

        <!-- Search -->
        <div class="max-w-xl mx-auto">
          <UInput
            v-model="search"
            icon="i-heroicons-magnifying-glass"
            placeholder="Search adapters..."
            size="lg"
            variant="subtle"
            class="w-full"
            aria-label="Search adapters"
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
            v-model="selectedCategory"
            :items="[
              { label: 'All Categories', value: undefined },
              ...categories.map((c) => ({
                label: c,
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
            v-model="selectedFormat"
            :items="[
              { label: 'All Formats', value: undefined },
              ...fileFormats.map((f) => ({
                label: f.toUpperCase(),
                value: f,
              })),
            ]"
            value-key="value"
            size="md"
            color="neutral"
            variant="outline"
            placeholder="Format"
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
          <span v-if="hasActiveFilters">
            Showing {{ filteredAdapters.length }} of
            {{ adapters.length }} adapters
          </span>
          <span v-else>{{ adapters.length }} adapters available</span>
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
        <NuxtLink
          to="/contribute"
          class="hidden md:flex items-center gap-1 hover:text-primary transition-colors"
        >
          Submit an adapter
          <UIcon name="i-heroicons-arrow-right" class="size-4" />
        </NuxtLink>
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-24"
        role="status"
        aria-busy="true"
      >
        <UIcon
          name="i-heroicons-arrow-path"
          class="size-8 text-primary animate-spin mb-4"
        />
        <p class="text-muted">Loading adapters...</p>
      </div>

      <!-- Adapter Grid -->
      <div
        v-else-if="filteredAdapters.length > 0"
        class="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        <AdapterCard
          v-for="adapter in filteredAdapters"
          :key="adapter.id"
          :adapter="adapter"
        />
      </div>

      <!-- Empty State -->
      <UCard v-else class="text-center py-12">
        <UIcon
          name="i-heroicons-document-magnifying-glass"
          class="size-12 text-muted mx-auto mb-4"
        />
        <h3 class="font-semibold mb-2">No adapters found</h3>
        <p class="text-muted mb-4">
          There's no adapter matching your search yet. Be the first to create
          it!
        </p>
        <div class="flex gap-2 justify-center">
          <UButton color="primary" variant="soft" to="/contribute">
            Contribute on GitHub
          </UButton>
          <UButton color="neutral" variant="ghost" @click="clearFilters">
            Clear filters
          </UButton>
        </div>
      </UCard>
    </UContainer>
  </div>
</template>
