<script setup lang="ts">
  useSeoMeta({
    title: 'Ecosystem - Apps & Tools - OpenECU Alliance',
    description:
      'Discover applications and tools compatible with the OpenECU Spec, including log viewers, tuning software, and analysis tools.',
    ogTitle: 'OpenECU Alliance Ecosystem',
    ogDescription:
      'Applications and tools compatible with the OpenECU Spec for ECU data logging, analysis, and tuning.',
    twitterCard: 'summary_large_image',
  });

  const compatibleApps = [
    {
      name: 'UltraLog',
      description:
        'High-performance ECU log viewer with multi-format support, computed channels, scatter plots, and export.',
      url: 'https://ultralog.co',
      logo: '/ultralog-logo.png',
      status: 'available' as const,
      features: ['Multi-file tabs', 'Computed channels', 'Scatter plots', 'PNG/PDF export'],
    },
  ];

  const libraries = [
    {
      name: 'openecuspec',
      description: 'Reference implementation library for parsing OpenECU Spec adapters.',
      languages: ['Rust', 'TypeScript'],
      status: 'planned' as const,
    },
  ];
</script>

<template>
  <div>
    <UContainer class="py-12">
      <!-- Header -->
      <div class="text-center max-w-3xl mx-auto mb-12">
        <UBadge color="primary" variant="subtle" class="mb-4"> Ecosystem </UBadge>
        <h1 class="text-3xl sm:text-4xl font-bold mb-4">Compatible Applications</h1>
        <p class="text-lg text-muted">Applications and libraries built with OpenECU Spec support.</p>
      </div>

      <!-- Compatible Applications -->
      <section class="mb-12">
        <h2 class="text-xl font-semibold mb-4">Applications</h2>
        <div class="grid gap-4">
          <UCard
            v-for="app in compatibleApps"
            :key="app.name"
            class="hover:ring-2 hover:ring-primary/50 transition-all"
          >
            <div class="flex flex-col sm:flex-row gap-4">
              <div class="bg-primary/10 p-4 rounded-xl shrink-0 self-start">
                <img v-if="app.logo" :src="app.logo" :alt="app.name" class="size-12 object-contain" />
                <UIcon v-else name="i-heroicons-cube" class="size-12 text-primary" />
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="text-lg font-semibold">{{ app.name }}</h3>
                  <UBadge :color="app.status === 'available' ? 'success' : 'warning'" variant="subtle" size="md">
                    {{ app.status === 'available' ? 'Available' : 'Coming Soon' }}
                  </UBadge>
                </div>
                <p class="text-muted mb-3">{{ app.description }}</p>
                <div class="flex flex-wrap gap-1.5 mb-4">
                  <UBadge v-for="feature in app.features" :key="feature" color="neutral" variant="subtle" size="sm">
                    {{ feature }}
                  </UBadge>
                </div>
                <UButton :to="app.url" target="_blank" size="sm">
                  Visit Website
                  <UIcon name="i-heroicons-arrow-top-right-on-square" class="size-4 ml-1" />
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <!-- Libraries -->
      <section class="mb-12">
        <h2 class="text-xl font-semibold mb-4">Libraries & SDKs</h2>
        <div class="grid gap-4">
          <UCard v-for="lib in libraries" :key="lib.name">
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="font-semibold">{{ lib.name }}</h3>
                  <UBadge color="warning" variant="subtle" size="md">
                    {{ lib.status }}
                  </UBadge>
                </div>
                <p class="text-sm text-muted mb-2">{{ lib.description }}</p>
                <div class="flex gap-1.5">
                  <UBadge v-for="lang in lib.languages" :key="lang" color="neutral" variant="outline" size="sm">
                    {{ lang }}
                  </UBadge>
                </div>
              </div>
            </div>
          </UCard>
        </div>
        <p class="text-sm text-muted mt-4">
          Building a library or SDK?
          <NuxtLink to="/contribute" class="text-primary hover:underline"> Let us know </NuxtLink>
          and we'll add it here.
        </p>
      </section>

      <!-- CTA -->
      <UCard class="text-center">
        <div class="py-6">
          <h2 class="text-lg font-bold mb-2">Building Something Spec-Compatible?</h2>
          <p class="text-muted mb-4 max-w-lg mx-auto">
            If your application uses OpenECU Spec adapters, protocols, or models, we'd love to feature it here.
          </p>
          <UButton to="/contribute">Get Listed</UButton>
        </div>
      </UCard>
    </UContainer>
  </div>
</template>
