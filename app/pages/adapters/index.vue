<script setup lang="ts">
useSeoMeta({
  title: 'Adapters - OpenECU Alliance',
  description: 'Browse community-contributed adapters for ECU log file formats.',
})

const { adapters, vendors, categories, fileFormats, filterAdapters } = useAdapters()

const search = ref('')
const selectedVendor = ref<string>()
const selectedCategory = ref<string>()
const selectedFormat = ref<string>()

const filteredAdapters = computed(() => {
  return filterAdapters({
    search: search.value,
    vendor: selectedVendor.value,
    category: selectedCategory.value,
    fileFormat: selectedFormat.value,
  })
})

const vendorOptions = computed(() => [
  { label: 'All Vendors', value: undefined },
  ...vendors.value.map(v => ({
    label: v.charAt(0).toUpperCase() + v.slice(1),
    value: v,
  })),
])

const categoryOptions = computed(() => [
  { label: 'All Categories', value: undefined },
  ...categories.value.map(c => ({
    label: c.charAt(0).toUpperCase() + c.slice(1),
    value: c,
  })),
])

const formatOptions = computed(() => [
  { label: 'All Formats', value: undefined },
  { label: 'CSV', value: 'csv' },
  { label: 'Binary', value: 'binary' },
])

function clearFilters() {
  search.value = ''
  selectedVendor.value = undefined
  selectedCategory.value = undefined
  selectedFormat.value = undefined
}

const hasActiveFilters = computed(() => {
  return search.value || selectedVendor.value || selectedCategory.value || selectedFormat.value
})
</script>

<template>
  <div class="py-8 px-4">
    <UContainer>
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold mb-2">
          Adapters
        </h1>
        <p class="text-lg text-muted">
          Discover {{ adapters.length }} adapters for ECU log file formats.
        </p>
      </div>

      <!-- Search & Filters -->
      <div class="flex flex-col lg:flex-row gap-4 mb-8">
        <!-- Search -->
        <div class="flex-1">
          <UInput
            v-model="search"
            icon="i-heroicons-magnifying-glass"
            placeholder="Search adapters..."
            size="lg"
            class="w-full"
          />
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-3">
          <USelectMenu
            v-model="selectedVendor"
            :items="vendorOptions"
            value-key="value"
            placeholder="Vendor"
            class="w-40"
          />
          <USelectMenu
            v-model="selectedCategory"
            :items="categoryOptions"
            value-key="value"
            placeholder="Category"
            class="w-40"
          />
          <USelectMenu
            v-model="selectedFormat"
            :items="formatOptions"
            value-key="value"
            placeholder="Format"
            class="w-36"
          />

          <UButton
            v-if="hasActiveFilters"
            color="neutral"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="clearFilters"
          >
            Clear
          </UButton>
        </div>
      </div>

      <!-- Results count -->
      <div class="mb-6 text-sm text-muted">
        <span v-if="hasActiveFilters">
          Showing {{ filteredAdapters.length }} of {{ adapters.length }} adapters
        </span>
        <span v-else>
          {{ adapters.length }} adapters available
        </span>
      </div>

      <!-- Adapter Grid -->
      <div
        v-if="filteredAdapters.length > 0"
        class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <AdapterCard
          v-for="adapter in filteredAdapters"
          :key="adapter.id"
          :adapter="adapter"
        />
      </div>

      <!-- Empty State -->
      <UCard v-else class="text-center py-12">
        <UIcon name="i-heroicons-magnifying-glass" class="size-12 text-muted mx-auto mb-4" />
        <h3 class="font-semibold mb-2">No adapters found</h3>
        <p class="text-muted mb-4">
          Try adjusting your search or filters.
        </p>
        <UButton color="neutral" variant="soft" @click="clearFilters">
          Clear filters
        </UButton>
      </UCard>

      <!-- Contribute CTA -->
      <UCard class="mt-12">
        <div class="flex flex-col sm:flex-row items-center gap-4 py-4">
          <div class="bg-primary/10 p-3 rounded-xl">
            <UIcon name="i-heroicons-plus-circle" class="size-6 text-primary" />
          </div>
          <div class="flex-1 text-center sm:text-left">
            <h3 class="font-semibold">Missing an adapter?</h3>
            <p class="text-sm text-muted">
              Contribute your own adapter for an ECU system not listed here.
            </p>
          </div>
          <UButton to="/contribute" color="neutral" variant="soft">
            Contribute
          </UButton>
        </div>
      </UCard>
    </UContainer>
  </div>
</template>
