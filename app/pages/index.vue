<script setup lang="ts">
const NuxtLink = resolveComponent("NuxtLink");
const input = useTemplateRef("input");

useSeoMeta({
  title: "OpenECU Alliance - The OpenECU Spec",
  description:
    "An open specification for standardizing ECU log data. Build spec-compatible applications that work with any ECU system.",
});

// ARIA live region announcement for search results
const searchAnnouncement = computed(() => {
  if (loading.value) return "Loading adapters...";
  if (hasActiveFilters.value) {
    return `Showing ${filteredAdapters.value.length} of ${adapters.value.length} adapters`;
  }
  return `${adapters.value.length} adapters available`;
});

// Sort order label for accessibility
const sortOrderLabel = computed(() =>
  sortOrder.value === "asc" ? "Sort ascending" : "Sort descending",
);

// Adapter search functionality
const { adapters, vendors, filterAdapters, loading } = useAdapters();

const search = ref("");
const selectedVendor = ref<string>();
const selectedFormat = ref<string>();
const sortBy = ref<"name" | "channels" | "vendor">("vendor");
const sortOrder = ref<"asc" | "desc">("asc");

const filteredAdapters = computed(() => {
  let result = filterAdapters({
    search: search.value,
    vendor: selectedVendor.value,
    fileFormat: selectedFormat.value,
  });

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
  selectedFormat.value = undefined;
}

const hasActiveFilters = computed(() => {
  return search.value || selectedVendor.value || selectedFormat.value;
});

defineShortcuts({
  "/": () => {
    input.value?.inputRef?.focus();
  },
});

const isMobile = ref(false);
onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 640;
  };
  checkMobile();
  window.addEventListener("resize", checkMobile);
  onUnmounted(() => window.removeEventListener("resize", checkMobile));
});

// Landing page content
const features = [
  {
    icon: "i-heroicons-document-text",
    title: "The OpenECU Spec",
    description:
      "A standardized YAML format for describing ECU log file formats and channel mappings.",
  },
  {
    icon: "i-heroicons-puzzle-piece",
    title: "Adapter Library",
    description:
      "Pre-built adapters for popular ECU systems that map vendor channels to standard IDs.",
  },
  {
    icon: "i-heroicons-code-bracket",
    title: "Language Agnostic",
    description:
      "YAML-based specs parseable by any language. Build applications in Rust, Python, TypeScript, or anything.",
  },
  {
    icon: "i-heroicons-users",
    title: "Community Driven",
    description:
      "Open contribution model - anyone can create adapters or donate compatible projects.",
  },
];

const compatibleApps = [
  {
    name: "UltraLog",
    description:
      "High-performance ECU log viewer with multi-format support and computed channels.",
    url: "https://ultralog.co",
    logo: "/ultralog-logo.png",
    status: "available",
  },
];
</script>

<template>
  <div>
    <!-- Hero + Adapter Search Section -->
    <UContainer class="relative">
      <AdaptersMarquee :adapters="adapters" />

      <div class="relative z-20 pt-24 pb-8">
        <div class="text-center max-w-4xl mx-auto">
          <UBadge color="primary" variant="subtle" class="mb-4">
            Open Source Specification
          </UBadge>

          <h1
            class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            The
            <span class="text-primary">OpenECU Spec</span>
          </h1>

          <p class="text-lg sm:text-xl text-muted mb-8 max-w-2xl mx-auto">
            An open specification for standardizing ECU log data formats. One
            spec, every manufacturer, any analysis tool.
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
                autocomplete="off"
                aria-label="Search adapters by name, vendor, or description"
                aria-describedby="search-results-count"
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
                  :aria-label="sortOrderLabel"
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
                :aria-label="sortOrderLabel"
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
              size="md"
              @click="format.click"
            />
          </div>
        </div>
      </div>

      <!-- ARIA Live Region for Search Results -->
      <div
        id="search-results-count"
        class="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ searchAnnouncement }}
      </div>

      <!-- Adapter Results -->
      <section class="relative z-20 pb-16" aria-label="Adapter search results">
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
            Create your own adapter
            <UIcon name="i-heroicons-arrow-right" class="size-4" />
          </NuxtLink>
        </div>

        <!-- Loading State -->
        <div
          v-if="loading"
          class="flex flex-col items-center justify-center py-24"
          role="status"
          aria-busy="true"
        >
          <UIcon
            name="i-heroicons-arrow-path"
            class="size-8 text-primary animate-spin mb-4"
            aria-hidden="true"
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
            There's no adapter matching "{{ search }}" yet. Be the first to
            create it!
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
      </section>
    </UContainer>

    <!-- What is OpenECU Alliance -->
    <section class="py-16 px-4 bg-elevated">
      <UContainer>
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-12">
            <h2 class="text-2xl sm:text-3xl font-bold mb-4">
              What is the OpenECU Alliance?
            </h2>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <UCard>
              <div class="text-center">
                <div
                  class="bg-primary/10 p-3 rounded-xl mb-4 inline-flex"
                  aria-hidden="true"
                >
                  <UIcon
                    name="i-heroicons-building-office-2"
                    class="size-6 text-primary"
                  />
                </div>
                <h3 class="font-semibold mb-2">The Alliance</h3>
                <p class="text-sm text-muted">
                  An open community that publishes and maintains the OpenECU
                  Spec, adapter definitions, and compatible tools.
                </p>
              </div>
            </UCard>

            <UCard>
              <div class="text-center">
                <div
                  class="bg-primary/10 p-3 rounded-xl mb-4 inline-flex"
                  aria-hidden="true"
                >
                  <UIcon
                    name="i-heroicons-document-text"
                    class="size-6 text-primary"
                  />
                </div>
                <h3 class="font-semibold mb-2">The Spec</h3>
                <p class="text-sm text-muted">
                  A YAML-based specification that defines how to describe ECU
                  log formats and map channels to standard identifiers.
                </p>
              </div>
            </UCard>

            <UCard>
              <div class="text-center">
                <div
                  class="bg-primary/10 p-3 rounded-xl mb-4 inline-flex"
                  aria-hidden="true"
                >
                  <UIcon name="i-heroicons-cube" class="size-6 text-primary" />
                </div>
                <h3 class="font-semibold mb-2">The Ecosystem</h3>
                <p class="text-sm text-muted">
                  Spec-compatible applications, adapters, and tools that work
                  together seamlessly.
                </p>
              </div>
            </UCard>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Features Section -->
    <section class="py-16 px-4">
      <UContainer>
        <div class="text-center mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold mb-4">
            Why Use the OpenECU Spec?
          </h2>
          <p class="text-muted max-w-2xl mx-auto">
            Every ECU uses different channel names for the same data. The spec
            creates a universal standard that benefits everyone.
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <UCard
            v-for="feature in features"
            :key="feature.title"
            class="text-center"
          >
            <div class="flex flex-col items-center">
              <div class="bg-primary/10 p-3 rounded-xl mb-4" aria-hidden="true">
                <UIcon :name="feature.icon" class="size-6 text-primary" />
              </div>
              <h3 class="font-semibold mb-2">{{ feature.title }}</h3>
              <p class="text-sm text-muted">{{ feature.description }}</p>
            </div>
          </UCard>
        </div>
      </UContainer>
    </section>

    <!-- Compatible Applications -->
    <section class="py-16 px-4 bg-elevated">
      <UContainer>
        <div class="text-center mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold mb-4">
            Spec-Compatible Applications
          </h2>
          <p class="text-muted max-w-2xl mx-auto">
            Applications built with OpenECU Spec support can read logs from any
            ECU with an adapter.
          </p>
        </div>

        <div class="max-w-2xl mx-auto">
          <UCard
            v-for="app in compatibleApps"
            :key="app.name"
            :as="NuxtLink"
            :to="app.url"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer"
            :aria-label="`${app.name} - ${app.description} (opens in new tab)`"
          >
            <div class="flex items-center gap-4">
              <div
                class="bg-primary/10 p-4 rounded-xl shrink-0"
                aria-hidden="true"
              >
                <img
                  v-if="app.logo"
                  :src="app.logo"
                  :alt="`${app.name} logo`"
                  class="size-10 object-contain"
                />
                <UIcon
                  v-else
                  name="i-heroicons-cube"
                  class="size-10 text-primary"
                />
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-semibold">{{ app.name }}</h3>
                  <UBadge color="success" variant="subtle" size="md">
                    Available
                  </UBadge>
                </div>
                <p class="text-sm text-muted">{{ app.description }}</p>
              </div>
              <UIcon
                name="i-heroicons-arrow-top-right-on-square"
                class="size-4 text-muted"
                aria-hidden="true"
              />
            </div>
          </UCard>

          <p class="text-center text-sm text-muted mt-6">
            Building a spec-compatible app?
            <NuxtLink to="/contribute" class="text-primary hover:underline">
              Let us know
            </NuxtLink>
            and we'll add it here.
          </p>
        </div>
      </UContainer>
    </section>

    <!-- For Developers -->
    <section class="py-16 px-4">
      <UContainer>
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-12">
            <h2 class="text-2xl sm:text-3xl font-bold mb-4">For Developers</h2>
            <p class="text-muted max-w-2xl mx-auto">
              The OpenECU Spec makes it easy to add ECU log support to your
              application.
            </p>
          </div>

          <div class="grid md:grid-cols-2 gap-8">
            <UCard>
              <h3 class="font-semibold mb-3">Use the Spec</h3>
              <ul class="space-y-2 text-sm text-muted">
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-check"
                    class="size-4 text-success shrink-0 mt-0.5"
                  />
                  <span>Parse any ECU log format with a single codebase</span>
                </li>
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-check"
                    class="size-4 text-success shrink-0 mt-0.5"
                  />
                  <span>Use canonical channel IDs across all ECU systems</span>
                </li>
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-check"
                    class="size-4 text-success shrink-0 mt-0.5"
                  />
                  <span>Leverage community-maintained adapters</span>
                </li>
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-check"
                    class="size-4 text-success shrink-0 mt-0.5"
                  />
                  <span>Add new ECU support without code changes</span>
                </li>
              </ul>
              <div class="mt-4">
                <UButton to="/spec" variant="soft" size="sm">
                  Read the Spec
                </UButton>
              </div>
            </UCard>

            <UCard>
              <h3 class="font-semibold mb-3">Contribute to the Alliance</h3>
              <ul class="space-y-2 text-sm text-muted">
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-plus"
                    class="size-4 text-primary shrink-0 mt-0.5"
                  />
                  <span>Create adapters for new ECU systems</span>
                </li>
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-plus"
                    class="size-4 text-primary shrink-0 mt-0.5"
                  />
                  <span>Improve existing channel mappings</span>
                </li>
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-plus"
                    class="size-4 text-primary shrink-0 mt-0.5"
                  />
                  <span>Donate ECU-related projects for maintenance</span>
                </li>
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-plus"
                    class="size-4 text-primary shrink-0 mt-0.5"
                  />
                  <span>Build spec-compatible tools and libraries</span>
                </li>
              </ul>
              <div class="mt-4">
                <UButton to="/contribute" variant="soft" size="sm">
                  Start Contributing
                </UButton>
              </div>
            </UCard>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>
