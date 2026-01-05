<script setup lang="ts">
useSeoMeta({
  title: 'OpenECU Alliance - Standardizing ECU Log Data',
  description: 'An open specification for standardizing ECU log data channel definitions and file format adapters.',
})

const features = [
  {
    icon: 'i-heroicons-document-text',
    title: 'Open Specification',
    description: 'A standardized YAML format for describing ECU log file formats and channel mappings.',
  },
  {
    icon: 'i-heroicons-puzzle-piece',
    title: 'Adapter Marketplace',
    description: 'Browse and download community-contributed adapters for popular ECU systems.',
  },
  {
    icon: 'i-heroicons-code-bracket',
    title: 'Language Agnostic',
    description: 'YAML-based specs that can be parsed by any programming language.',
  },
  {
    icon: 'i-heroicons-users',
    title: 'Community Driven',
    description: 'Open contribution model - anyone can create and share adapters.',
  },
]

const vendors = [
  'Haltech',
  'Link',
  'AiM',
  'ECUMaster',
  'MoTeC',
  'AEM',
  'Holley',
  'FuelTech',
  'MegaSquirt',
  'Speeduino',
  'rusEFI',
]
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="py-24 px-4">
      <UContainer>
        <div class="text-center max-w-4xl mx-auto">
          <UBadge color="primary" variant="subtle" class="mb-4">
            Open Source Specification
          </UBadge>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Standardizing
            <span class="text-primary">ECU Log Data</span>
          </h1>
          <p class="text-lg sm:text-xl text-muted mb-8 max-w-2xl mx-auto">
            An open specification for describing ECU log file formats.
            One standard, every ECU system, any analysis tool.
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <UButton to="/adapters" size="lg">
              Browse Adapters
            </UButton>
            <UButton to="/spec" size="lg" color="neutral" variant="outline">
              Read the Spec
            </UButton>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Features Section -->
    <section class="py-16 px-4 bg-elevated">
      <UContainer>
        <div class="text-center mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold mb-4">
            Why OpenECU Alliance?
          </h2>
          <p class="text-muted max-w-2xl mx-auto">
            Every ECU uses different channel names for the same data.
            We're fixing that with a universal standard.
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <UCard v-for="feature in features" :key="feature.title" class="text-center">
            <div class="flex flex-col items-center">
              <div class="bg-primary/10 p-3 rounded-xl mb-4">
                <UIcon :name="feature.icon" class="size-6 text-primary" />
              </div>
              <h3 class="font-semibold mb-2">{{ feature.title }}</h3>
              <p class="text-sm text-muted">{{ feature.description }}</p>
            </div>
          </UCard>
        </div>
      </UContainer>
    </section>

    <!-- Supported Vendors -->
    <section class="py-16 px-4">
      <UContainer>
        <div class="text-center mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold mb-4">
            Supported ECU Systems
          </h2>
          <p class="text-muted max-w-2xl mx-auto">
            Adapters available or planned for these popular ECU manufacturers.
          </p>
        </div>

        <div class="flex flex-wrap justify-center gap-3">
          <UBadge
            v-for="vendor in vendors"
            :key="vendor"
            color="neutral"
            variant="subtle"
            size="lg"
          >
            {{ vendor }}
          </UBadge>
        </div>
      </UContainer>
    </section>

    <!-- CTA Section -->
    <section class="py-16 px-4 bg-elevated">
      <UContainer>
        <UCard class="text-center">
          <div class="py-8 px-4">
            <h2 class="text-2xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p class="text-muted mb-6 max-w-xl mx-auto">
              Browse existing adapters, read the specification, or contribute your own adapter for an ECU system.
            </p>
            <div class="flex flex-wrap justify-center gap-4">
              <UButton to="/adapters">
                Browse Adapters
              </UButton>
              <UButton to="/docs" color="neutral" variant="soft">
                Read the Docs
              </UButton>
            </div>
          </div>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>
