<script setup lang="ts">
useSeoMeta({
  title: 'Contribute - OpenECU Alliance',
  description: 'Learn how to contribute adapters to the OpenECU Alliance.',
})

const steps = [
  {
    number: 1,
    title: 'Read the Spec',
    description: 'Familiarize yourself with the adapter specification format and requirements.',
    icon: 'i-heroicons-document-text',
  },
  {
    number: 2,
    title: 'Create Your Adapter',
    description: 'Write a YAML adapter file for your ECU system following the spec.',
    icon: 'i-heroicons-code-bracket',
  },
  {
    number: 3,
    title: 'Validate',
    description: 'Ensure your adapter passes JSON Schema validation.',
    icon: 'i-heroicons-check-circle',
  },
  {
    number: 4,
    title: 'Submit PR',
    description: 'Open a pull request to add your adapter to the registry.',
    icon: 'i-heroicons-arrow-up-tray',
  },
]
</script>

<template>
  <div class="py-8 px-4">
    <UContainer class="max-w-4xl">
      <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold mb-2">
          Contribute
        </h1>
        <p class="text-lg text-muted">
          Help grow the OpenECU Alliance by contributing adapters for ECU systems.
        </p>
      </div>

      <!-- Why Contribute -->
      <UCard class="mb-8">
        <template #header>
          <span class="font-semibold">Why Contribute?</span>
        </template>
        <div class="text-muted space-y-3">
          <p>
            Your adapter helps the entire automotive tuning community. When you contribute an adapter:
          </p>
          <ul class="list-disc list-inside space-y-1">
            <li>Users of your ECU system can use any OpenECU-compatible tool</li>
            <li>You standardize channel names across the ecosystem</li>
            <li>Other developers can build on your work</li>
            <li>You're credited as the adapter author</li>
          </ul>
        </div>
      </UCard>

      <!-- Steps -->
      <section class="mb-12">
        <h2 class="text-xl font-semibold mb-6">How to Contribute</h2>
        <div class="space-y-4">
          <UCard v-for="step in steps" :key="step.number">
            <div class="flex items-start gap-4">
              <div class="flex items-center justify-center size-10 bg-primary text-primary-foreground rounded-full font-bold shrink-0">
                {{ step.number }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <UIcon :name="step.icon" class="size-5 text-primary" />
                  <h3 class="font-semibold">{{ step.title }}</h3>
                </div>
                <p class="text-muted">{{ step.description }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <!-- Example -->
      <section class="mb-12">
        <h2 class="text-xl font-semibold mb-4">Adapter Example</h2>
        <UCard>
          <pre class="text-sm overflow-x-auto"><code class="language-yaml">openecualliance: "1.0"
id: my-ecu-csv
name: "My ECU CSV Export"
version: "1.0.0"
vendor: myecu

file_format:
  type: csv
  extensions: [".csv"]
  delimiter: ","
  header_row: 0
  data_start_row: 1

channels:
  - id: rpm
    name: "Engine RPM"
    category: engine
    data_type: float
    unit: rpm
    source_names:
      - "Engine Speed"
      - "RPM"

  - id: coolant_temp
    name: "Coolant Temperature"
    category: temperature
    data_type: float
    unit: celsius
    source_names:
      - "ECT"
      - "Coolant"</code></pre>
        </UCard>
      </section>

      <!-- CTA -->
      <div class="flex flex-col sm:flex-row gap-4">
        <UButton
          to="https://github.com/openecualliance/adapters"
          target="_blank"
          icon="i-simple-icons-github"
          size="lg"
        >
          View on GitHub
        </UButton>
        <UButton
          to="/spec"
          color="neutral"
          variant="outline"
          icon="i-heroicons-document-text"
          size="lg"
        >
          Read the Spec
        </UButton>
      </div>
    </UContainer>
  </div>
</template>
