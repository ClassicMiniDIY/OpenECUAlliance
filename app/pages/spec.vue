<script setup lang="ts">
useSeoMeta({
  title: "Specification - OpenECU Alliance",
  description: "The formal OpenECU Alliance adapter specification document.",
});
</script>

<template>
  <div class="py-8 px-4">
    <UContainer class="max-w-4xl">
      <div class="mb-8">
        <UBadge color="primary" variant="subtle" class="mb-4">
          Version 1.0.0-draft
        </UBadge>
        <h1 class="text-3xl sm:text-4xl font-bold mb-2">Specification</h1>
        <p class="text-lg text-muted">
          The formal OpenECU Alliance adapter specification document.
        </p>
      </div>

      <UCard class="mb-8">
        <div class="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Coming Soon</h2>
          <p>
            The interactive specification viewer is under development. In the
            meantime, you can view the raw specification files:
          </p>
          <ul>
            <li>
              <a
                href="https://github.com/ClassicMiniDIY/OECUASpecs/blob/main/SPECIFICATION.md"
                target="_blank"
              >
                SPECIFICATION.md
              </a>
              - Full specification document
            </li>
            <li>
              <a
                href="https://github.com/ClassicMiniDIY/OECUASpecs/blob/main/schema/adapter.schema.json"
                target="_blank"
              >
                adapter.schema.json
              </a>
              - JSON Schema for validation
            </li>
          </ul>
        </div>
      </UCard>

      <!-- Quick Overview -->
      <div class="grid md:grid-cols-2 gap-6">
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-document-text"
                class="size-5 text-primary"
              />
              <span class="font-semibold">Adapter Structure</span>
            </div>
          </template>
          <div class="text-sm text-muted space-y-2">
            <p>Each adapter file contains:</p>
            <ul class="list-disc list-inside space-y-1">
              <li>Metadata (id, name, version, vendor)</li>
              <li>File format specification</li>
              <li>Channel definitions with mappings</li>
            </ul>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-code-bracket"
                class="size-5 text-primary"
              />
              <span class="font-semibold">File Format</span>
            </div>
          </template>
          <div class="text-sm text-muted space-y-2">
            <p>Adapters use YAML format:</p>
            <ul class="list-disc list-inside space-y-1">
              <li>Human-readable and editable</li>
              <li>Language-agnostic parsing</li>
              <li>JSON Schema validation</li>
            </ul>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-queue-list"
                class="size-5 text-primary"
              />
              <span class="font-semibold">Channel Definitions</span>
            </div>
          </template>
          <div class="text-sm text-muted space-y-2">
            <p>Each channel includes:</p>
            <ul class="list-disc list-inside space-y-1">
              <li>Canonical ID (snake_case)</li>
              <li>Data type, unit, min/max</li>
              <li>Source name mappings</li>
            </ul>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-check-badge"
                class="size-5 text-primary"
              />
              <span class="font-semibold">Validation</span>
            </div>
          </template>
          <div class="text-sm text-muted space-y-2">
            <p>Adapters are validated against:</p>
            <ul class="list-disc list-inside space-y-1">
              <li>JSON Schema for structure</li>
              <li>Required field presence</li>
              <li>Semver version format</li>
            </ul>
          </div>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>
