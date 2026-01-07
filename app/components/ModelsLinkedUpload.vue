<script setup lang="ts">
  import type { ModelCategory } from '~/types/model';
  import { ECU_VENDORS } from '~/types/model';

  const emit = defineEmits<{
    submitted: [{ modelId: string; slug: string; category: ModelCategory }];
  }>();

  const {
    currentStep,
    totalSteps,
    saving,
    fetching,
    error,
    // Step 1
    externalUrl,
    fetchedMetadata,
    name,
    description,
    // Step 2
    category,
    vendor,
    // Validation
    canProceedStep1,
    canProceedStep2,
    canSubmit,
    // Actions
    fetchMetadata,
    submitModel,
    nextStep,
    prevStep,
    goToStep,
  } = useLinkedModelUpload();

  const categories: {
    value: ModelCategory;
    label: string;
    description: string;
  }[] = [
    {
      value: 'mounts',
      label: 'Mounts',
      description: 'ECU mounting brackets and plates',
    },
    {
      value: 'enclosures',
      label: 'Enclosures',
      description: 'Protective cases and housings',
    },
    {
      value: 'brackets',
      label: 'Brackets',
      description: 'Support brackets and adapters',
    },
    {
      value: 'adapters',
      label: 'Adapters',
      description: 'Connector and interface adapters',
    },
    {
      value: 'accessories',
      label: 'Accessories',
      description: 'Other useful accessories',
    },
  ];

  const stepTitles = ['Link & Review', 'Category & Submit'];

  const canProceedCurrentStep = computed(() => {
    switch (currentStep.value) {
      case 1:
        return canProceedStep1.value;
      case 2:
        return canProceedStep2.value;
      default:
        return false;
    }
  });

  async function handleSubmit() {
    const result = await submitModel();
    if (result) {
      emit('submitted', result);
    }
  }

  // Helper to format print settings for display
  function formatPrintSetting(value: number | undefined, unit: string): string {
    if (value === undefined || value === null) return 'Not specified';
    return `${value}${unit}`;
  }
</script>

<template>
  <div class="space-y-6">
    <!-- Progress Steps -->
    <div class="flex items-center justify-between mb-4">
      <template v-for="(title, index) in stepTitles" :key="index">
        <button
          :class="[
            'flex items-center gap-2 text-sm transition-colors',
            currentStep === index + 1
              ? 'text-primary font-medium'
              : index + 1 < currentStep
                ? 'text-success'
                : 'text-muted',
          ]"
          @click="goToStep(index + 1)"
        >
          <span
            :class="[
              'size-8 rounded-full flex items-center justify-center text-sm font-medium border-2',
              currentStep === index + 1
                ? 'border-primary bg-primary text-white'
                : index + 1 < currentStep
                  ? 'border-success bg-success text-white'
                  : 'border-default bg-elevated',
            ]"
          >
            <UIcon v-if="index + 1 < currentStep" name="i-heroicons-check" class="size-4" />
            <span v-else>{{ index + 1 }}</span>
          </span>
          <span class="hidden sm:inline">{{ title }}</span>
        </button>
        <div
          v-if="index < stepTitles.length - 1"
          :class="['flex-1 h-0.5 mx-2', index + 1 < currentStep ? 'bg-success' : 'bg-default']"
        />
      </template>
    </div>

    <!-- Error Alert -->
    <UAlert
      v-if="error"
      color="error"
      icon="i-heroicons-exclamation-circle"
      :title="error"
      :close-button="{
        icon: 'i-heroicons-x-mark',
        color: 'error',
        variant: 'link',
      }"
      @close="error = null"
    />

    <UCard>
      <template #header>
        <h2 class="font-semibold">{{ stepTitles[currentStep - 1] }}</h2>
      </template>

      <!-- Step 1: URL and Metadata -->
      <div v-show="currentStep === 1" class="space-y-6">
        <LinkedModelUrlInput v-model="externalUrl" :disabled="fetching" @fetch="fetchMetadata" />

        <div v-if="fetching" class="flex items-center justify-center py-8">
          <UIcon name="i-heroicons-arrow-path" class="size-6 animate-spin text-primary" />
          <span class="ml-2 text-muted">Fetching model information...</span>
        </div>

        <template v-if="fetchedMetadata && !fetching">
          <ExternalMetadataPreview :metadata="fetchedMetadata" />

          <USeparator label="Edit Details" />

          <UFormField label="Model Name" required class="w-full">
            <UInput v-model="name" placeholder="Model name" size="lg" class="w-full" />
            <template #description>
              <span class="text-xs">You can edit the name from the original source.</span>
            </template>
          </UFormField>

          <UFormField label="Description" required class="w-full">
            <UTextarea v-model="description" placeholder="Describe the model..." :rows="4" class="w-full" />
            <template #description>
              <span class="text-xs">{{ description.length }}/2000 characters. Minimum 10 characters.</span>
            </template>
          </UFormField>

          <!-- License info from source (read-only) -->
          <div class="p-4 rounded-lg bg-elevated border border-default">
            <div class="flex items-center gap-2 mb-3">
              <UIcon name="i-heroicons-shield-check" class="size-5 text-muted" />
              <p class="font-medium text-sm">License & Rights (from source)</p>
            </div>
            <div class="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p class="text-muted text-xs mb-1">License</p>
                <p class="font-medium">
                  {{ fetchedMetadata.license || 'Not specified' }}
                </p>
              </div>
              <div>
                <p class="text-muted text-xs mb-1">Remixes</p>
                <p class="font-medium">
                  <span v-if="fetchedMetadata.remixesAllowed" class="text-success">Allowed</span>
                  <span v-else class="text-error">Not allowed</span>
                </p>
              </div>
              <div>
                <p class="text-muted text-xs mb-1">Commercial Use</p>
                <p class="font-medium">
                  <span v-if="fetchedMetadata.commercialUseAllowed" class="text-success">Allowed</span>
                  <span v-else class="text-error">Not allowed</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Print Settings from source (read-only) -->
          <div class="p-4 rounded-lg bg-elevated border border-default">
            <div class="flex items-center gap-2 mb-3">
              <UIcon name="i-heroicons-cube" class="size-5 text-muted" />
              <p class="font-medium text-sm">Print Settings (from source)</p>
            </div>
            <div class="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p class="text-muted text-xs mb-1">Material</p>
                <p class="font-medium">
                  {{ fetchedMetadata.printSettings?.recommendedMaterial || 'PLA' }}
                </p>
              </div>
              <div>
                <p class="text-muted text-xs mb-1">Layer Height</p>
                <p class="font-medium">
                  {{ formatPrintSetting(fetchedMetadata.printSettings?.layerHeight, 'mm') }}
                </p>
              </div>
              <div>
                <p class="text-muted text-xs mb-1">Infill</p>
                <p class="font-medium">
                  {{ formatPrintSetting(fetchedMetadata.printSettings?.infillPercent, '%') }}
                </p>
              </div>
              <div v-if="fetchedMetadata.printSettings?.wallCount">
                <p class="text-muted text-xs mb-1">Walls</p>
                <p class="font-medium">
                  {{ fetchedMetadata.printSettings.wallCount }}
                </p>
              </div>
              <div v-if="fetchedMetadata.printSettings?.supportsRequired !== undefined">
                <p class="text-muted text-xs mb-1">Supports</p>
                <p class="font-medium">
                  <span v-if="fetchedMetadata.printSettings.supportsRequired" class="text-warning">Required</span>
                  <span v-else class="text-success">Not needed</span>
                </p>
              </div>
              <div v-if="fetchedMetadata.printSettings?.estimatedTimeHours">
                <p class="text-muted text-xs mb-1">Est. Time</p>
                <p class="font-medium">
                  {{ fetchedMetadata.printSettings.estimatedTimeHours.toFixed(1) }}
                  hours
                </p>
              </div>
            </div>
            <p class="text-xs text-muted mt-3">Print settings are imported from the original source.</p>
          </div>
        </template>
      </div>

      <!-- Step 2: Category & Details -->
      <div v-show="currentStep === 2" class="space-y-6">
        <UFormField label="Category" required>
          <div class="grid sm:grid-cols-2 gap-2">
            <button
              v-for="cat in categories"
              :key="cat.value"
              type="button"
              :class="[
                'p-3 rounded-lg border-2 text-left transition-all',
                category === cat.value ? 'border-primary bg-primary/5' : 'border-default hover:border-primary/50',
              ]"
              @click="category = cat.value"
            >
              <p class="font-medium">{{ cat.label }}</p>
              <p class="text-xs text-muted">{{ cat.description }}</p>
            </button>
          </div>
        </UFormField>

        <UFormField label="Vendor/Brand">
          <USelectMenu
            v-model="vendor"
            :items="[...ECU_VENDORS]"
            placeholder="Select vendor..."
            searchable
            searchable-placeholder="Search vendors..."
          />
          <template #description>
            <span class="text-xs"
              >The ECU or part manufacturer this model is designed for. Select "Other" if not listed.</span
            >
          </template>
        </UFormField>
      </div>

      <!-- Navigation -->
      <template #footer>
        <div class="flex justify-between">
          <UButton v-if="currentStep > 1" variant="ghost" icon="i-heroicons-arrow-left" @click="prevStep">
            Previous
          </UButton>
          <div v-else />

          <div class="flex gap-2">
            <UButton v-if="currentStep < totalSteps" :disabled="!canProceedCurrentStep" @click="nextStep">
              Continue
              <UIcon name="i-heroicons-arrow-right" class="size-4 ml-1" />
            </UButton>

            <UButton v-else :loading="saving" :disabled="!canSubmit" @click="handleSubmit"> Submit for Review </UButton>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>
