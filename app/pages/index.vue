<script setup lang="ts">
import type { ContentType } from "~/types/content";

const NuxtLink = resolveComponent("NuxtLink");
const input = useTemplateRef("input");

useSeoMeta({
  title: "OpenECU Alliance - Adapters, Protocols & 3D Models",
  description:
    "An open community for ECU resources. Browse log adapters, CAN protocols, and 3D printable mounts - all free and open source.",
});

// Content composables
const {
  adapters,
  protocols,
  models,
  counts,
  allVendors,
  filterContent,
  loading,
  getTypeLabel,
  getTypeIcon,
  getTypeColor,
} = useContent();

const { filterAdapters } = useAdapters();
const { filterProtocols } = useProtocols();
const { filterModels, getCategoryLabel } = useModels();

// State
const search = ref("");
const selectedType = ref<ContentType | "all">("all");
const selectedVendor = ref<string>();
const sortBy = ref<"name" | "vendor" | "type">("vendor");
const sortOrder = ref<"asc" | "desc">("asc");

// Filtered content based on selected type
const filteredAdapters = computed(() => {
  if (selectedType.value !== "all" && selectedType.value !== "adapter")
    return [];
  return filterAdapters({
    search: search.value,
    vendor: selectedVendor.value,
  });
});

const filteredProtocols = computed(() => {
  if (selectedType.value !== "all" && selectedType.value !== "protocol")
    return [];
  return filterProtocols({
    search: search.value,
    vendor: selectedVendor.value,
  });
});

const filteredModels = computed(() => {
  if (selectedType.value !== "all" && selectedType.value !== "model") return [];
  return filterModels({
    search: search.value,
    vendor: selectedVendor.value,
  });
});

// Combined count for display
const totalFiltered = computed(() => {
  return (
    filteredAdapters.value.length +
    filteredProtocols.value.length +
    filteredModels.value.length
  );
});

const totalItems = computed(() => {
  return adapters.value.length + protocols.value.length + models.value.length;
});

// Search announcement for accessibility
const searchAnnouncement = computed(() => {
  if (loading.value) return "Loading content...";
  if (hasActiveFilters.value) {
    return `Showing ${totalFiltered.value} of ${totalItems.value} items`;
  }
  return `${totalItems.value} items available`;
});

const hasActiveFilters = computed(() => {
  return search.value || selectedVendor.value || selectedType.value !== "all";
});

function clearFilters() {
  search.value = "";
  selectedVendor.value = undefined;
  selectedType.value = "all";
}

// Content type tabs
const contentTabs = computed(() => [
  {
    key: "all" as const,
    label: "All",
    count: counts.value.all,
    icon: "i-heroicons-squares-2x2",
    color: "neutral",
  },
  {
    key: "adapter" as const,
    label: "Adapters",
    count: counts.value.adapter,
    icon: "i-heroicons-document-text",
    color: "primary",
  },
  {
    key: "protocol" as const,
    label: "Protocols",
    count: counts.value.protocol,
    icon: "i-heroicons-signal",
    color: "success",
  },
  {
    key: "model" as const,
    label: "3D Models",
    count: counts.value.model,
    icon: "i-heroicons-cube",
    color: "warning",
  },
]);

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
    title: "Log Adapters",
    description:
      "Parse ECU log files from any vendor using standardized YAML definitions.",
    color: "primary",
  },
  {
    icon: "i-heroicons-signal",
    title: "CAN Protocols",
    description:
      "Real-time CAN Bus message definitions with DBC export for industry tools.",
    color: "success",
  },
  {
    icon: "i-heroicons-cube",
    title: "3D Models",
    description:
      "Printable ECU mounts, enclosures, and brackets with full print settings.",
    color: "warning",
  },
  {
    icon: "i-heroicons-users",
    title: "Community Driven",
    description:
      "Open contribution model - anyone can create and share resources.",
    color: "neutral",
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
    <!-- Hero + Unified Search Section -->
    <UContainer class="relative">
      <AdaptersMarquee :adapters="adapters" />

      <div class="relative z-20 pt-24 pb-8">
        <div class="text-center max-w-4xl mx-auto">
          <UBadge color="primary" variant="subtle" class="mb-4">
            Open Source Community
          </UBadge>

          <h1
            class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            The
            <span class="text-primary">OpenECU Alliance</span>
          </h1>

          <p class="text-lg sm:text-xl text-muted mb-8 max-w-2xl mx-auto">
            One community. Shared standards. Free resources for ECU enthusiasts,
            tuners, and developers.
          </p>

          <!-- Unified Search -->
          <div class="max-w-2xl mx-auto mb-6">
            <UInput
              ref="input"
              v-model="search"
              icon="i-heroicons-magnifying-glass"
              placeholder="Search adapters, protocols, models..."
              size="lg"
              variant="subtle"
              class="w-full"
              autocomplete="off"
              aria-label="Search all content"
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
          </div>

          <!-- Content Type Tabs -->
          <div
            class="flex flex-wrap gap-2 justify-center mb-6"
            role="tablist"
            aria-label="Content type filter"
          >
            <button
              v-for="tab in contentTabs"
              :key="tab.key"
              role="tab"
              :aria-selected="selectedType === tab.key"
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              :class="[
                selectedType === tab.key
                  ? `bg-${tab.color}/10 text-${tab.color} ring-2 ring-${tab.color}/30`
                  : 'bg-muted/30 text-muted hover:bg-muted/50 hover:text-default',
              ]"
              @click="selectedType = tab.key"
            >
              <UIcon :name="tab.icon" class="size-4" aria-hidden="true" />
              <span class="hidden sm:inline">{{ tab.label }}</span>
              <span
                class="px-1.5 py-0.5 rounded text-xs"
                :class="[
                  selectedType === tab.key
                    ? `bg-${tab.color}/20`
                    : 'bg-muted/50',
                ]"
              >
                {{ tab.count }}
              </span>
            </button>
          </div>

          <!-- Vendor Filter (Desktop) -->
          <div
            v-if="allVendors.length > 0"
            class="hidden sm:flex flex-wrap gap-1.5 justify-center"
          >
            <UButton
              v-for="vendor in allVendors"
              :key="vendor"
              :label="vendor.charAt(0).toUpperCase() + vendor.slice(1)"
              color="neutral"
              :variant="selectedVendor === vendor ? 'subtle' : 'outline'"
              :class="selectedVendor === vendor ? 'ring-2 ring-primary' : ''"
              size="sm"
              @click="
                selectedVendor = selectedVendor === vendor ? undefined : vendor
              "
            />
          </div>

          <!-- Mobile Vendor Filter -->
          <div v-if="isMobile && allVendors.length > 0" class="mt-4">
            <USelectMenu
              v-model="selectedVendor"
              :items="[
                { label: 'All Vendors', value: undefined },
                ...allVendors.map((v) => ({
                  label: v.charAt(0).toUpperCase() + v.slice(1),
                  value: v,
                })),
              ]"
              value-key="value"
              size="lg"
              color="neutral"
              variant="outline"
              placeholder="Filter by vendor"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- ARIA Live Region -->
      <div
        id="search-results-count"
        class="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ searchAnnouncement }}
      </div>

      <!-- Results Section -->
      <section class="relative z-20 pb-16" aria-label="Search results">
        <div class="flex justify-between items-center mb-4 text-sm text-muted">
          <div class="flex items-center gap-2">
            <span v-if="hasActiveFilters">
              Showing {{ totalFiltered }} of {{ totalItems }} items
            </span>
            <span v-else>{{ totalItems }} items available</span>
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
            Contribute
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
          <p class="text-muted">Loading content...</p>
        </div>

        <!-- Content Sections -->
        <div v-else-if="totalFiltered > 0" class="space-y-8">
          <!-- Adapters Section -->
          <div v-if="filteredAdapters.length > 0">
            <div
              v-if="selectedType === 'all'"
              class="flex items-center gap-2 mb-4"
            >
              <UIcon
                name="i-heroicons-document-text"
                class="size-5 text-primary"
              />
              <h2 class="font-semibold">
                Adapters ({{ filteredAdapters.length }})
              </h2>
              <NuxtLink
                to="/adapters"
                class="ml-auto text-sm text-muted hover:text-primary"
              >
                View all
              </NuxtLink>
            </div>
            <div
              class="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              <AdapterCard
                v-for="adapter in selectedType === 'all'
                  ? filteredAdapters.slice(0, 6)
                  : filteredAdapters"
                :key="adapter.id"
                :adapter="adapter"
              />
            </div>
          </div>

          <!-- Protocols Section -->
          <div v-if="filteredProtocols.length > 0">
            <div
              v-if="selectedType === 'all'"
              class="flex items-center gap-2 mb-4"
            >
              <UIcon name="i-heroicons-signal" class="size-5 text-success" />
              <h2 class="font-semibold">
                Protocols ({{ filteredProtocols.length }})
              </h2>
              <NuxtLink
                to="/protocols"
                class="ml-auto text-sm text-muted hover:text-success"
              >
                View all
              </NuxtLink>
            </div>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ProtocolCard
                v-for="protocol in selectedType === 'all'
                  ? filteredProtocols.slice(0, 6)
                  : filteredProtocols"
                :key="protocol.id"
                :protocol="protocol"
              />
            </div>
          </div>

          <!-- Models Section -->
          <div v-if="filteredModels.length > 0">
            <div
              v-if="selectedType === 'all'"
              class="flex items-center gap-2 mb-4"
            >
              <UIcon name="i-heroicons-cube" class="size-5 text-warning" />
              <h2 class="font-semibold">
                3D Models ({{ filteredModels.length }})
              </h2>
              <NuxtLink
                to="/models"
                class="ml-auto text-sm text-muted hover:text-warning"
              >
                View all
              </NuxtLink>
            </div>
            <div
              class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              <ModelCard
                v-for="model in selectedType === 'all'
                  ? filteredModels.slice(0, 8)
                  : filteredModels"
                :key="model.id"
                :model="model"
              />
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <UCard v-else class="text-center py-12">
          <UIcon
            name="i-heroicons-magnifying-glass"
            class="size-12 text-muted mx-auto mb-4"
          />
          <h3 class="font-semibold mb-2">No results found</h3>
          <p class="text-muted mb-4">
            No content matches your search. Try different filters or be the
            first to contribute!
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
            <p class="text-muted max-w-2xl mx-auto">
              A community-driven initiative providing free, open resources for
              the automotive ECU enthusiast community.
            </p>
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
                  An open community that publishes and maintains adapters,
                  protocols, 3D models, and compatible tools.
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
                  YAML-based specifications that define adapters, protocols, and
                  models with JSON Schema validation.
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
                  Spec-compatible applications, tools, and resources that work
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
          <h2 class="text-2xl sm:text-3xl font-bold mb-4">What We Share</h2>
          <p class="text-muted max-w-2xl mx-auto">
            Free, community-maintained resources for ECU enthusiasts, tuners,
            and developers.
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <UCard
            v-for="feature in features"
            :key="feature.title"
            class="text-center"
          >
            <div class="flex flex-col items-center">
              <div
                :class="`bg-${feature.color}/10`"
                class="p-3 rounded-xl mb-4"
                aria-hidden="true"
              >
                <UIcon
                  :name="feature.icon"
                  :class="`size-6 text-${feature.color}`"
                />
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
            Applications built with OpenECU Spec support can use adapters,
            protocols, and models from this community.
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
              The OpenECU Spec makes it easy to add ECU support to your
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
                  <span>Parse any ECU log format with adapters</span>
                </li>
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-check"
                    class="size-4 text-success shrink-0 mt-0.5"
                  />
                  <span>Use CAN protocols with DBC export</span>
                </li>
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-check"
                    class="size-4 text-success shrink-0 mt-0.5"
                  />
                  <span>Leverage community-maintained resources</span>
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
                  <span>Add CAN protocol definitions</span>
                </li>
                <li class="flex items-start gap-2">
                  <UIcon
                    name="i-heroicons-plus"
                    class="size-4 text-primary shrink-0 mt-0.5"
                  />
                  <span>Share 3D printable models and designs</span>
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
