<script setup lang="ts">
useSeoMeta({
  title: 'Documentation - OpenECU Alliance',
  description: 'Learn how to create adapters and integrate with OpenECU Alliance.',
})

const guides = [
  {
    icon: 'i-heroicons-rocket-launch',
    title: 'Getting Started',
    description: 'Introduction to OpenECU Alliance and the adapter ecosystem.',
    to: '/docs/getting-started',
    status: 'coming-soon',
  },
  {
    icon: 'i-heroicons-document-plus',
    title: 'Creating Adapters',
    description: 'Step-by-step guide to creating your own adapter.',
    to: '/docs/creating-adapters',
    status: 'coming-soon',
  },
  {
    icon: 'i-heroicons-code-bracket-square',
    title: 'Integrating the Spec',
    description: 'How applications can consume OpenECU Alliance adapters.',
    to: '/docs/integrating',
    status: 'coming-soon',
  },
  {
    icon: 'i-heroicons-check-circle',
    title: 'Validation',
    description: 'Validating adapters against the JSON Schema.',
    to: '/docs/validation',
    status: 'coming-soon',
  },
]

const references = [
  {
    icon: 'i-heroicons-queue-list',
    title: 'Channel Reference',
    description: 'Complete list of canonical channel IDs and their meanings.',
    to: '/docs/channels',
    status: 'coming-soon',
  },
  {
    icon: 'i-heroicons-scale',
    title: 'Unit Reference',
    description: 'Standard units and conversion formulas.',
    to: '/docs/units',
    status: 'coming-soon',
  },
  {
    icon: 'i-heroicons-tag',
    title: 'Category Reference',
    description: 'Channel categories and their use cases.',
    to: '/docs/categories',
    status: 'coming-soon',
  },
]
</script>

<template>
  <div class="py-8 px-4">
    <UContainer>
      <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold mb-2">
          Documentation
        </h1>
        <p class="text-lg text-muted">
          Learn how to create adapters and integrate with OpenECU Alliance.
        </p>
      </div>

      <!-- Guides -->
      <section class="mb-12">
        <h2 class="text-xl font-semibold mb-4">Guides</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <UCard v-for="guide in guides" :key="guide.title">
            <div class="flex items-start gap-3">
              <div class="bg-primary/10 p-2 rounded-lg shrink-0">
                <UIcon :name="guide.icon" class="size-5 text-primary" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-semibold">{{ guide.title }}</h3>
                  <UBadge v-if="guide.status === 'coming-soon'" color="neutral" variant="subtle" size="xs">
                    Coming Soon
                  </UBadge>
                </div>
                <p class="text-sm text-muted">{{ guide.description }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <!-- Reference -->
      <section class="mb-12">
        <h2 class="text-xl font-semibold mb-4">Reference</h2>
        <div class="grid sm:grid-cols-3 gap-4">
          <UCard v-for="ref in references" :key="ref.title">
            <div class="flex flex-col items-center text-center">
              <div class="bg-muted/50 p-3 rounded-xl mb-3">
                <UIcon :name="ref.icon" class="size-5 text-muted" />
              </div>
              <h3 class="font-semibold mb-1">{{ ref.title }}</h3>
              <p class="text-sm text-muted">{{ ref.description }}</p>
              <UBadge v-if="ref.status === 'coming-soon'" color="neutral" variant="subtle" size="xs" class="mt-2">
                Coming Soon
              </UBadge>
            </div>
          </UCard>
        </div>
      </section>

      <!-- Resources -->
      <section>
        <h2 class="text-xl font-semibold mb-4">Resources</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <UCard to="https://github.com/ClassicMiniDIY/OECUASpecs" target="_blank">
            <div class="flex items-center gap-3">
              <UIcon name="i-simple-icons-github" class="size-6" />
              <div>
                <h3 class="font-semibold">GitHub Repository</h3>
                <p class="text-sm text-muted">Specification and adapter registry</p>
              </div>
            </div>
          </UCard>

          <UCard to="/spec">
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-document-text" class="size-6 text-primary" />
              <div>
                <h3 class="font-semibold">Specification</h3>
                <p class="text-sm text-muted">Formal specification document</p>
              </div>
            </div>
          </UCard>
        </div>
      </section>
    </UContainer>
  </div>
</template>
