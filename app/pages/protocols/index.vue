<script setup lang="ts">
useSeoMeta({
  title: "CAN Bus Protocols - OpenECU Alliance",
  description:
    "Browse CAN Bus protocol definitions for ECU systems. Download DBC files for CANalyzer, PCAN-View, SavvyCAN, and more.",
  ogTitle: "CAN Bus Protocol Definitions - OpenECU Alliance",
  ogDescription:
    "Open source CAN Bus protocol definitions with DBC export for Haltech, ECUMaster, Link, and other ECU systems.",
  twitterCard: "summary_large_image",
});

const {
  protocols,
  vendors,
  protocolTypes,
  filterProtocols,
  loading,
  formatBaudrate,
} = useProtocols();

const search = ref("");
const selectedVendor = ref<string>();
const selectedType = ref<string>();

const filteredProtocols = computed(() => {
  return filterProtocols({
    search: search.value,
    vendor: selectedVendor.value,
    protocolType: selectedType.value,
  });
});

const hasActiveFilters = computed(() => {
  return search.value || selectedVendor.value || selectedType.value;
});

function clearFilters() {
  search.value = "";
  selectedVendor.value = undefined;
  selectedType.value = undefined;
}

const searchAnnouncement = computed(() => {
  if (loading.value) return "Loading protocols...";
  if (hasActiveFilters.value) {
    return `Showing ${filteredProtocols.value.length} of ${protocols.value.length} protocols`;
  }
  return `${protocols.value.length} protocols available`;
});
</script>

<template>
  <div>
    <UContainer class="py-12">
      <!-- Header -->
      <div class="text-center max-w-3xl mx-auto mb-12">
        <UBadge color="success" variant="subtle" class="mb-4">
          CAN Bus Protocols
        </UBadge>

        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          Protocol Definitions
        </h1>

        <p class="text-lg text-muted mb-8">
          Browse CAN Bus protocol definitions for real-time ECU communication.
          Download as DBC for use with industry tools.
        </p>

        <!-- Search -->
        <div class="max-w-xl mx-auto">
          <UInput
            v-model="search"
            icon="i-heroicons-magnifying-glass"
            placeholder="Search protocols..."
            size="lg"
            variant="subtle"
            class="w-full"
            aria-label="Search protocols"
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
            v-model="selectedType"
            :items="[
              { label: 'All Types', value: undefined },
              ...protocolTypes.map((t) => ({
                label: t.toUpperCase(),
                value: t,
              })),
            ]"
            value-key="value"
            size="md"
            color="neutral"
            variant="outline"
            placeholder="Type"
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
            Showing {{ filteredProtocols.length }} of
            {{ protocols.length }} protocols
          </span>
          <span v-else>{{ protocols.length }} protocols available</span>
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
          class="hidden md:flex items-center gap-1 hover:text-success transition-colors"
        >
          Submit a protocol
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
          class="size-8 text-success animate-spin mb-4"
        />
        <p class="text-muted">Loading protocols...</p>
      </div>

      <!-- Protocol Grid -->
      <div
        v-else-if="filteredProtocols.length > 0"
        class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <ProtocolCard
          v-for="protocol in filteredProtocols"
          :key="protocol.id"
          :protocol="protocol"
        />
      </div>

      <!-- Empty State -->
      <UCard v-else class="text-center py-12">
        <UIcon
          name="i-heroicons-signal-slash"
          class="size-12 text-muted mx-auto mb-4"
        />
        <h3 class="font-semibold mb-2">No protocols found</h3>
        <p class="text-muted mb-4">
          There's no protocol matching your search yet. Be the first to create
          it!
        </p>
        <div class="flex gap-2 justify-center">
          <UButton color="success" variant="soft" to="/contribute">
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
