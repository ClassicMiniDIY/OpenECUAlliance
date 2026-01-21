<script setup lang="ts">
  import type { AdapterDetail } from '~/types/adapter';

  const route = useRoute();
  const vendor = route.params.vendor as string;
  const id = route.params.id as string;

  const {
    data: adapter,
    status,
    error,
  } = await useFetch<AdapterDetail>(`/api/adapters/${vendor}/${id}`, {
    key: `adapter-${vendor}-${id}`,
  });

  const { getVendorIcon } = useVendorIcons();

  // Group channels by category
  const channelsByCategory = computed(() => {
    if (!adapter.value?.channels) return {};

    const grouped: Record<string, typeof adapter.value.channels> = {};
    for (const channel of adapter.value.channels) {
      const category = channel.category;
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(channel);
    }
    return grouped;
  });

  const categories = computed(() => Object.keys(channelsByCategory.value).sort());

  useSeoMeta({
    title: () => (adapter.value ? `${adapter.value.name} Adapter - OpenECU Alliance` : 'Adapter - OpenECU Alliance'),
    description: () =>
      adapter.value?.description || 'Open source ECU log adapter specification for data parsing and analysis.',
    ogTitle: () => (adapter.value ? `${adapter.value.name} - ECU Log Adapter` : 'ECU Log Adapter'),
    ogDescription: () =>
      adapter.value?.description || 'Open source ECU log adapter specification for data parsing and analysis.',
    ogType: 'article',
    twitterCard: 'summary_large_image',
  });

  const fallbackIcon = computed(() => getVendorIcon(vendor));
</script>

<template>
  <div>
    <UContainer class="py-8">
      <!-- Loading state -->
      <div v-if="status === 'pending'" class="flex items-center justify-center py-24">
        <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin text-muted" />
      </div>

      <!-- Error state -->
      <div v-else-if="status === 'error' || !adapter" class="text-center py-24">
        <UIcon name="i-heroicons-exclamation-triangle" class="size-12 text-error mb-4" />
        <h2 class="text-xl font-bold mb-2">Adapter Not Found</h2>
        <p class="text-muted mb-4">The adapter you're looking for doesn't exist.</p>
        <UButton to="/adapters"> Back to Adapters </UButton>
      </div>

      <!-- Adapter detail -->
      <div v-else>
        <!-- Breadcrumb -->
        <nav class="mb-6">
          <UBreadcrumb>
            <UBreadcrumbItem to="/adapters"> Adapters </UBreadcrumbItem>
            <UBreadcrumbItem>
              {{ adapter.vendor }}
            </UBreadcrumbItem>
            <UBreadcrumbItem>
              {{ adapter.name }}
            </UBreadcrumbItem>
          </UBreadcrumb>
        </nav>

        <!-- Header -->
        <div class="mb-8">
          <!-- Logo -->
          <div class="flex justify-center mb-6">
            <div class="bg-muted/50 p-6 rounded-2xl flex items-center justify-center">
              <img
                v-if="adapter.branding?.logo"
                :src="adapter.branding.logo"
                :alt="`${adapter.vendor} logo`"
                class="h-20 max-w-48 object-contain"
              />
              <UIcon v-else :name="fallbackIcon" class="size-16 text-primary" />
            </div>
          </div>

          <!-- Title and metadata -->
          <div class="text-center mb-6">
            <div class="flex items-center justify-center gap-2 mb-2">
              <h1 class="text-2xl sm:text-3xl font-bold">{{ adapter.name }}</h1>
              <UBadge color="neutral" variant="subtle"> v{{ adapter.version }} </UBadge>
            </div>
            <p class="text-muted max-w-2xl mx-auto whitespace-pre-line">
              {{ adapter.description }}
            </p>
          </div>

          <!-- Stats -->
          <div class="flex flex-wrap justify-center gap-4 text-sm">
            <div class="flex items-center gap-1 text-muted">
              <UIcon name="i-heroicons-building-office" class="size-4" />
              <span class="capitalize">{{ adapter.vendor }}</span>
            </div>
            <div class="flex items-center gap-1 text-muted">
              <UIcon name="i-heroicons-queue-list" class="size-4" />
              <span>{{ adapter.channels.length }} channels</span>
            </div>
            <div class="flex items-center gap-1 text-muted">
              <UIcon name="i-heroicons-document" class="size-4" />
              <span class="uppercase">{{ adapter.fileFormat.type }}</span>
            </div>
            <a
              v-if="adapter.website"
              :href="adapter.website"
              target="_blank"
              class="flex items-center gap-1 text-primary hover:underline"
            >
              <UIcon name="i-heroicons-globe-alt" class="size-4" />
              <span>Website</span>
            </a>
          </div>
        </div>

        <!-- File Format Info -->
        <UCard class="mb-8">
          <template #header>
            <h2 class="font-semibold">File Format</h2>
          </template>
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <div class="text-muted mb-1">Type</div>
              <div class="font-medium uppercase">
                {{ adapter.fileFormat.type }}
              </div>
            </div>
            <div>
              <div class="text-muted mb-1">Extensions</div>
              <div class="font-medium">
                {{ adapter.fileFormat.extensions.join(', ') }}
              </div>
            </div>
            <div v-if="adapter.fileFormat.delimiter">
              <div class="text-muted mb-1">Delimiter</div>
              <div class="font-medium font-mono">
                {{
                  adapter.fileFormat.delimiter === ','
                    ? 'comma'
                    : adapter.fileFormat.delimiter === ';'
                      ? 'semicolon'
                      : adapter.fileFormat.delimiter
                }}
              </div>
            </div>
            <div v-if="adapter.fileFormat.endianness">
              <div class="text-muted mb-1">Endianness</div>
              <div class="font-medium capitalize">
                {{ adapter.fileFormat.endianness }}
              </div>
            </div>
          </div>
        </UCard>

        <!-- Channels -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold mb-4">Channels ({{ adapter.channels.length }})</h2>

          <div class="space-y-6">
            <div v-for="category in categories" :key="category">
              <h3 class="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                {{ category }}
              </h3>
              <div class="grid gap-2">
                <UCard v-for="channel in channelsByCategory[category]" :key="channel.id" class="p-3!">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <code class="text-sm font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          {{ channel.id }}
                        </code>
                        <span class="font-medium">{{ channel.name }}</span>
                      </div>
                      <p v-if="channel.description" class="text-sm text-muted mb-2">
                        {{ channel.description }}
                      </p>
                      <div class="flex flex-wrap gap-2 text-sm">
                        <UBadge color="neutral" variant="subtle" size="md">
                          {{ channel.unit }}
                        </UBadge>
                        <UBadge color="neutral" variant="subtle" size="md">
                          {{ channel.dataType }}
                        </UBadge>
                        <template v-if="channel.min !== undefined && channel.max !== undefined">
                          <UBadge color="neutral" variant="subtle" size="md">
                            {{ channel.min }} - {{ channel.max }}
                          </UBadge>
                        </template>
                      </div>
                    </div>
                    <UPopover>
                      <UButton icon="i-heroicons-eye" color="neutral" variant="ghost" size="md" />
                      <template #content>
                        <div class="p-3 max-w-xs">
                          <div class="text-sm font-medium mb-2">Source Names</div>
                          <div class="space-y-1">
                            <code
                              v-for="name in channel.sourceNames"
                              :key="name"
                              class="block text-sm font-mono bg-muted/50 px-2 py-1 rounded"
                            >
                              {{ name }}
                            </code>
                          </div>
                        </div>
                      </template>
                    </UPopover>
                  </div>
                </UCard>
              </div>
            </div>
          </div>
        </div>

        <!-- Metadata -->
        <UCard v-if="adapter.metadata">
          <template #header>
            <h2 class="font-semibold">Metadata</h2>
          </template>
          <div class="space-y-4">
            <div v-if="adapter.metadata.testedWith?.length">
              <div class="text-sm text-muted mb-2">Tested With</div>
              <div class="flex flex-wrap gap-2">
                <UBadge v-for="item in adapter.metadata.testedWith" :key="item" color="success" variant="subtle">
                  {{ item }}
                </UBadge>
              </div>
            </div>
            <div v-if="adapter.metadata.knownIssues?.length">
              <div class="text-sm text-muted mb-2">Known Issues</div>
              <ul class="list-disc list-inside text-sm space-y-1">
                <li v-for="issue in adapter.metadata.knownIssues" :key="issue">
                  {{ issue }}
                </li>
              </ul>
            </div>
          </div>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>
