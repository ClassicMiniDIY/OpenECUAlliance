<script setup lang="ts">
  useSeoMeta({
    title: 'Compliance Levels - OpenECU Alliance',
    description: 'Understanding Level 1-3 compliance for OpenECU Spec applications.',
  });

  const levels = [
    {
      level: 1,
      name: 'Adapter Reader',
      badge: 'Bronze',
      color: 'warning',
      description: 'Minimum viable implementation',
      useCase: 'Simple log viewers that use adapters to identify channels.',
      requirements: [
        'Parse adapter files (.adapter.yaml)',
        'Extract channel mappings using source_names',
        'Display canonical IDs to users',
        'Schema validation (recommended)',
      ],
    },
    {
      level: 2,
      name: 'Full Reader',
      badge: 'Silver',
      color: 'neutral',
      description: 'Complete read-side implementation',
      useCase: 'Full-featured log analysis tools.',
      requirements: [
        'All Level 1 requirements',
        'Apply unit conversions when source_unit differs',
        'Organize channels by category',
        'Show adapter name, version, description',
        'Support multiple adapters',
        'Auto-detect correct adapter from file format',
      ],
    },
    {
      level: 3,
      name: 'Full Implementation',
      badge: 'Gold',
      color: 'primary',
      description: 'Complete implementation including write capabilities',
      useCase: 'ECU software, adapter development tools.',
      requirements: [
        'All Level 2 requirements',
        'UI or API to create new adapters',
        'Validate adapters against schema before saving',
        'Export adapters in valid .adapter.yaml format',
        'Suggest canonical IDs when creating adapters',
        'Fetch adapters from OpenECU Alliance registry',
      ],
    },
  ];

  const complianceMatrix = [
    { feature: 'Parse adapter YAML', l1: true, l2: true, l3: true },
    { feature: 'Map source_names to channels', l1: true, l2: true, l3: true },
    { feature: 'Display canonical IDs', l1: true, l2: true, l3: true },
    { feature: 'Schema validation', l1: 'rec', l2: true, l3: true },
    { feature: 'Unit conversion', l1: false, l2: true, l3: true },
    { feature: 'Category grouping', l1: false, l2: true, l3: true },
    { feature: 'Metadata display', l1: false, l2: true, l3: true },
    { feature: 'Multi-adapter support', l1: false, l2: true, l3: true },
    { feature: 'Auto-detection', l1: false, l2: true, l3: true },
    { feature: 'Adapter creation', l1: false, l2: false, l3: true },
    { feature: 'Adapter export', l1: false, l2: false, l3: true },
    { feature: 'Registry integration', l1: false, l2: false, l3: true },
  ];
</script>

<template>
  <div class="py-8 px-4">
    <UContainer class="max-w-4xl">
      <div class="mb-2">
        <NuxtLink to="/docs" class="text-sm text-muted hover:text-primary inline-flex items-center gap-1">
          <UIcon name="i-heroicons-arrow-left" class="size-4" />
          Back to Docs
        </NuxtLink>
      </div>

      <div class="mb-8">
        <UBadge color="primary" variant="subtle" class="mb-4"> Version 1.0.0 </UBadge>
        <h1 class="text-3xl sm:text-4xl font-bold mb-2">Compliance Levels</h1>
        <p class="text-lg text-muted">Understanding what it means to be "OpenECU Spec-Compatible".</p>
      </div>

      <!-- Overview -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Overview</h2>
        <UCard>
          <p class="text-muted mb-4">
            The OpenECU Spec defines a standard format for describing ECU log file formats. Applications that implement
            this specification can advertise their compliance level, helping users understand what to expect.
          </p>
          <div class="grid sm:grid-cols-3 gap-4 mt-4">
            <div class="flex items-start gap-2">
              <UIcon name="i-heroicons-link" class="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong class="text-sm">Interoperability</strong>
                <p class="text-sm text-muted">Share adapters across compatible apps</p>
              </div>
            </div>
            <div class="flex items-start gap-2">
              <UIcon name="i-heroicons-shield-check" class="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong class="text-sm">Quality Assurance</strong>
                <p class="text-sm text-muted">Compliance indicates completeness</p>
              </div>
            </div>
            <div class="flex items-start gap-2">
              <UIcon name="i-heroicons-arrow-trending-up" class="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong class="text-sm">Ecosystem Growth</strong>
                <p class="text-sm text-muted">Clear standards encourage development</p>
              </div>
            </div>
          </div>
        </UCard>
      </section>

      <!-- Compliance Levels -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">The Three Levels</h2>
        <div class="space-y-4">
          <UCard v-for="level in levels" :key="level.level">
            <div class="flex items-start gap-4">
              <div
                class="flex items-center justify-center size-12 bg-primary/10 text-primary rounded-xl font-bold text-xl shrink-0"
              >
                {{ level.level }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="text-lg font-semibold">Level {{ level.level }}: {{ level.name }}</h3>
                  <UBadge :color="level.color" variant="subtle" size="md">
                    {{ level.badge }}
                  </UBadge>
                </div>
                <p class="text-muted mb-3">{{ level.description }}</p>
                <div class="bg-muted/30 p-3 rounded-lg mb-3">
                  <p class="text-sm"><strong>Use Case:</strong> {{ level.useCase }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium mb-2">Requirements:</p>
                  <ul class="space-y-1">
                    <li v-for="req in level.requirements" :key="req" class="flex items-start gap-2 text-sm text-muted">
                      <UIcon name="i-heroicons-check" class="size-4 text-success shrink-0 mt-0.5" />
                      {{ req }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <!-- Compliance Matrix -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Compliance Matrix</h2>
        <UCard>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-default">
                  <th class="text-left py-2 pr-4 font-semibold">Feature</th>
                  <th class="text-center py-2 px-2 font-semibold">Level 1</th>
                  <th class="text-center py-2 px-2 font-semibold">Level 2</th>
                  <th class="text-center py-2 px-2 font-semibold">Level 3</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in complianceMatrix" :key="row.feature" class="border-b border-default">
                  <td class="py-2 pr-4 text-muted">{{ row.feature }}</td>
                  <td class="text-center py-2 px-2">
                    <UIcon v-if="row.l1 === true" name="i-heroicons-check" class="size-5 text-success" />
                    <span v-else-if="row.l1 === 'rec'" class="text-sm text-muted">Rec</span>
                    <UIcon v-else name="i-heroicons-minus" class="size-5 text-muted" />
                  </td>
                  <td class="text-center py-2 px-2">
                    <UIcon v-if="row.l2 === true" name="i-heroicons-check" class="size-5 text-success" />
                    <UIcon v-else name="i-heroicons-minus" class="size-5 text-muted" />
                  </td>
                  <td class="text-center py-2 px-2">
                    <UIcon v-if="row.l3 === true" name="i-heroicons-check" class="size-5 text-success" />
                    <UIcon v-else name="i-heroicons-minus" class="size-5 text-muted" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </section>

      <!-- Certification -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Certification Process</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <UCard>
            <h3 class="font-semibold mb-3">Self-Certification (Levels 1-2)</h3>
            <ol class="list-decimal list-inside space-y-2 text-sm text-muted">
              <li>Implement all requirements for claimed level</li>
              <li>Test against reference adapters</li>
              <li>Document compliance in application materials</li>
              <li>Use appropriate compliance badge</li>
            </ol>
          </UCard>
          <UCard>
            <h3 class="font-semibold mb-3">Formal Certification (Level 3)</h3>
            <ol class="list-decimal list-inside space-y-2 text-sm text-muted">
              <li>Submit application for review</li>
              <li>Demonstrate compliance via test suite</li>
              <li>Receive certification letter</li>
              <li>Be listed on OpenECU Alliance website</li>
            </ol>
          </UCard>
        </div>
      </section>

      <!-- FAQ -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">FAQ</h2>
        <div class="space-y-4">
          <UCard>
            <h4 class="font-semibold mb-2">Can I claim partial compliance?</h4>
            <p class="text-sm text-muted">No. You must meet ALL requirements for a level to claim it.</p>
          </UCard>
          <UCard>
            <h4 class="font-semibold mb-2">What if I exceed Level 2 but don't have all Level 3 features?</h4>
            <p class="text-sm text-muted">Claim Level 2. Partial Level 3 is still Level 2.</p>
          </UCard>
          <UCard>
            <h4 class="font-semibold mb-2">Is certification required to use "OpenECU Spec Compatible"?</h4>
            <p class="text-sm text-muted">
              Self-certification is acceptable for Levels 1-2. Level 3 and "Certified" require formal review.
            </p>
          </UCard>
        </div>
      </section>

      <!-- CTA -->
      <div class="flex flex-col sm:flex-row gap-4">
        <UButton to="/docs/branding" icon="i-heroicons-paint-brush" color="neutral" variant="outline" size="lg">
          Branding Guidelines
        </UButton>
        <UButton
          to="https://github.com/ClassicMiniDIY/OECUASpecs/blob/main/COMPLIANCE.md"
          target="_blank"
          icon="i-simple-icons-github"
          color="neutral"
          variant="outline"
          size="lg"
        >
          View on GitHub
        </UButton>
      </div>
    </UContainer>
  </div>
</template>
