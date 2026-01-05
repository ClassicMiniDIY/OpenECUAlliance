<script setup lang="ts">
const input = useTemplateRef("input");

useSeoMeta({
  title: "Adapters - OpenECU Alliance",
  description:
    "Browse community-contributed adapters for ECU log file formats.",
});

const { adapters, vendors, filterAdapters, loading } = useAdapters();

const search = ref("");
const selectedVendor = ref<string>();
const selectedCategory = ref<string>();
const selectedFormat = ref<string>();
const sortBy = ref<"name" | "channels" | "vendor">("vendor");
const sortOrder = ref<"asc" | "desc">("asc");

const filteredAdapters = computed(() => {
  let result = filterAdapters({
    search: search.value,
    vendor: selectedVendor.value,
    category: selectedCategory.value,
    fileFormat: selectedFormat.value,
  });

  // Sort results
  result = [...result].sort((a, b) => {
    let cmp = 0;
    switch (sortBy.value) {
      case "name":
        cmp = a.name.localeCompare(b.name);
        break;
      case "channels":
        cmp = a.channelCount - b.channelCount;
        break;
      case "vendor":
      default:
        cmp = a.vendor.localeCompare(b.vendor) || a.name.localeCompare(b.name);
        break;
    }
    return sortOrder.value === "desc" ? -cmp : cmp;
  });

  return result;
});

const vendorButtons = computed(() =>
  vendors.value.map((v) => ({
    label: v.charAt(0).toUpperCase() + v.slice(1),
    key: v,
    active: selectedVendor.value === v,
    click: () => {
      selectedVendor.value = selectedVendor.value === v ? undefined : v;
    },
  })),
);

const sortOptions = [
  { label: "Vendor", value: "vendor" },
  { label: "Name", value: "name" },
  { label: "Channels", value: "channels" },
];

const formatButtons = computed(() => [
  {
    label: "All",
    key: undefined,
    active: !selectedFormat.value,
    click: () => {
      selectedFormat.value = undefined;
    },
  },
  {
    label: "CSV",
    key: "csv",
    active: selectedFormat.value === "csv",
    click: () => {
      selectedFormat.value = selectedFormat.value === "csv" ? undefined : "csv";
    },
  },
  {
    label: "Binary",
    key: "binary",
    active: selectedFormat.value === "binary",
    click: () => {
      selectedFormat.value =
        selectedFormat.value === "binary" ? undefined : "binary";
    },
  },
]);

function clearFilters() {
  search.value = "";
  selectedVendor.value = undefined;
  selectedCategory.value = undefined;
  selectedFormat.value = undefined;
}

const hasActiveFilters = computed(() => {
  return (
    search.value ||
    selectedVendor.value ||
    selectedCategory.value ||
    selectedFormat.value
  );
});

// Keyboard shortcut for search
defineShortcuts({
  "/": () => {
    input.value?.inputRef?.focus();
  },
});

// Responsive behavior - check if mobile
const isMobile = ref(false);
onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 640;
  };
  checkMobile();
  window.addEventListener("resize", checkMobile);
  onUnmounted(() => window.removeEventListener("resize", checkMobile));
});
</script>

<template>
  <UContainer>
    <!-- Animated Background -->
    <AdaptersMarquee :adapters="adapters" />

    <!-- Hero Section -->
    <div class="relative z-20 pt-24 pb-12">
      <div class="text-center max-w-4xl mx-auto">
        <!-- Title -->
        <h1
          class="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance"
        >
          Parse any ECU with
          <span class="text-primary">OpenECU Spec</span>
          Adapters
        </h1>

        <!-- Description -->
        <p class="text-lg sm:text-xl text-muted mb-8 max-w-2xl mx-auto">
          Community-contributed adapters that map vendor-specific ECU log
          formats to the OpenECU Spec. Works with any spec-compatible
          application.
        </p>

        <!-- Search & Sort -->
        <div class="max-w-2xl mx-auto">
          <div class="flex flex-col sm:flex-row gap-2">
            <UInput
              ref="input"
              v-model="search"
              icon="i-heroicons-magnifying-glass"
              placeholder="Search adapters..."
              size="lg"
              variant="subtle"
              class="flex-1"
              autofocus
              autocomplete="off"
            >
              <template #trailing>
                <UButton
                  v-if="search"
                  color="neutral"
                  variant="link"
                  size="lg"
                  icon="i-heroicons-x-mark"
                  @click="search = ''"
                />
                <UKbd v-else value="/" class="hidden sm:flex" />
              </template>
            </UInput>

            <div v-if="!isMobile" class="flex gap-2">
              <USelectMenu
                v-model="sortBy"
                :items="sortOptions"
                value-key="value"
                size="lg"
                color="neutral"
                variant="outline"
                class="w-32"
              />
              <UButton
                :icon="
                  sortOrder === 'asc'
                    ? 'i-heroicons-bars-arrow-up'
                    : 'i-heroicons-bars-arrow-down'
                "
                size="lg"
                color="neutral"
                variant="outline"
                @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
              />
            </div>
          </div>

          <!-- Mobile filters -->
          <div v-if="isMobile" class="flex gap-2 mt-2">
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
              size="lg"
              color="neutral"
              variant="outline"
              class="flex-1"
              placeholder="Vendor"
            />
            <USelectMenu
              v-model="sortBy"
              :items="sortOptions"
              value-key="value"
              size="lg"
              color="neutral"
              variant="outline"
              class="w-28"
            />
            <UButton
              :icon="
                sortOrder === 'asc'
                  ? 'i-heroicons-bars-arrow-up'
                  : 'i-heroicons-bars-arrow-down'
              "
              size="lg"
              color="neutral"
              variant="outline"
              @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
            />
          </div>
        </div>

        <!-- Vendor Filter Chips (Desktop) -->
        <div class="hidden sm:flex mt-6 flex-wrap gap-1.5 justify-center">
          <UButton
            v-for="vendor in vendorButtons"
            :key="vendor.key"
            :label="vendor.label"
            color="neutral"
            :variant="vendor.active ? 'subtle' : 'outline'"
            :class="vendor.active ? 'ring-2 ring-primary' : ''"
            size="sm"
            @click="vendor.click"
          />
        </div>

        <!-- Format Filter -->
        <div class="flex mt-4 gap-1.5 justify-center">
          <UButton
            v-for="format in formatButtons"
            :key="format.key ?? 'all'"
            :label="format.label"
            color="neutral"
            :variant="format.active ? 'soft' : 'ghost'"
            size="xs"
            @click="format.click"
          />
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div class="relative z-20">
      <!-- Results info -->
      <div class="flex justify-between items-center mb-4 text-sm text-muted">
        <div class="flex items-center gap-2">
          <span v-if="hasActiveFilters">
            Showing {{ filteredAdapters.length }} of
            {{ adapters.length }} adapters
          </span>
          <span v-else> {{ adapters.length }} adapters available </span>
          <UButton
            v-if="hasActiveFilters"
            color="neutral"
            variant="link"
            size="xs"
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
          Create your own adapter
          <UIcon name="i-heroicons-arrow-right" class="size-4" />
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-24"
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
          name="i-heroicons-magnifying-glass"
          class="size-12 text-muted mx-auto mb-4"
        />
        <h3 class="font-semibold mb-2">No adapters found</h3>
        <p class="text-muted mb-4">
          There's no adapter matching "{{ search }}" yet. Be the first to create
          it!
        </p>
        <div class="flex gap-2 justify-center">
          <UButton color="neutral" variant="soft" to="/contribute">
            Contribute on GitHub
          </UButton>
          <UButton color="neutral" variant="ghost" @click="clearFilters">
            Clear filters
          </UButton>
        </div>
      </UCard>

      <!-- Contribute CTA -->
      <UCard class="mt-12 mb-8">
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
          <UButton to="/contribute" color="primary">
            Contribute
            <UIcon name="i-heroicons-arrow-right" class="size-4" />
          </UButton>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
