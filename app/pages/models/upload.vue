<script setup lang="ts">
  import type { ModelCategory } from '~/types/model';
  import { ECU_VENDORS } from '~/types/model';

  definePageMeta({
    layout: 'default',
    middleware: 'auth',
  });

  useSeoMeta({
    title: 'Upload 3D Model - OpenECU Alliance',
    description: 'Share your 3D printable ECU mounts, enclosures, and accessories with the OpenECU Alliance community.',
    robots: 'noindex, nofollow',
  });

  const toast = useToast();
  const router = useRouter();

  // Upload mode: 'upload' for regular file upload, 'link' for external links
  const uploadMode = ref<'upload' | 'link'>('upload');

  const {
    currentStep,
    totalSteps,
    saving,
    error,
    // Step 1
    name,
    description,
    category,
    vendor,
    license,
    sourceUrl,
    remixOf,
    remixesAllowed,
    commercialUseAllowed,
    // Step 2
    pendingFiles,
    totalFilesSize,
    addFiles,
    removeFile,
    setPrimaryFile,
    ALLOWED_FILE_FORMATS,
    MAX_FILE_SIZE,
    MAX_TOTAL_FILES_SIZE,
    // Step 3
    pendingImages,
    addImages,
    removeImage,
    setPrimaryImage,
    setImageType,
    reorderImages,
    MAX_IMAGE_SIZE,
    // Step 4
    printing,
    // Step 5
    hardware,
    assembly,
    addHardwareItem,
    removeHardwareItem,
    addAssemblyStep,
    removeAssemblyStep,
    // Validation
    canProceedStep1,
    canProceedStep2,
    canProceedStep3,
    canProceedStep4,
    canSubmit,
    // Actions
    submitModel,
    nextStep,
    prevStep,
    goToStep,
  } = useModelUpload();

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

  const licenses = [
    {
      value: 'CC-BY-SA-4.0',
      label: 'CC BY-SA 4.0',
      description: 'Share alike with attribution',
    },
    { value: 'CC-BY-4.0', label: 'CC BY 4.0', description: 'Attribution only' },
    {
      value: 'CC-BY-NC-SA-4.0',
      label: 'CC BY-NC-SA 4.0',
      description: 'Non-commercial, share alike',
    },
    {
      value: 'CC0-1.0',
      label: 'CC0 (Public Domain)',
      description: 'No restrictions',
    },
    {
      value: 'MIT',
      label: 'MIT License',
      description: 'Permissive software license',
    },
  ];

  const materials = [
    'PLA',
    'PETG',
    'ABS',
    'ASA',
    'Nylon',
    'TPU',
    'PC',
    'Carbon Fiber PLA',
    'Carbon Fiber PETG',
    'Wood PLA',
    'Resin',
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', description: 'No special skills required' },
    {
      value: 'moderate',
      label: 'Moderate',
      description: 'Some experience helpful',
    },
    { value: 'advanced', label: 'Advanced', description: 'Requires expertise' },
  ];

  const stepTitles = ['Basic Information', '3D Files', 'Images', 'Print Settings', 'Hardware & Assembly'];

  const canProceedCurrentStep = computed(() => {
    switch (currentStep.value) {
      case 1:
        return canProceedStep1.value;
      case 2:
        return canProceedStep2.value;
      case 3:
        return canProceedStep3.value;
      case 4:
        return canProceedStep4.value;
      case 5:
        return true;
      default:
        return false;
    }
  });

  async function handleSubmit() {
    const modelId = await submitModel();
    if (modelId) {
      toast.add({
        title: 'Model submitted!',
        description: "Your model has been submitted for review. We'll notify you when it's approved.",
        color: 'success',
      });
      await router.push('/profile/models');
    }
  }

  async function handleLinkedSubmit(result: { modelId: string; slug: string; category: string }) {
    toast.add({
      title: 'Linked model submitted!',
      description: "Your linked model has been submitted for review. We'll notify you when it's approved.",
      color: 'success',
    });
    await router.push('/profile/models');
  }
</script>

<template>
  <div>
    <UContainer class="py-12 max-w-4xl">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <UButton to="/models" variant="ghost" icon="i-heroicons-arrow-left" size="sm" />
        <div>
          <h1 class="text-2xl font-bold">Submit Model</h1>
          <p class="text-muted">Share your 3D printable model with the community</p>
        </div>
      </div>

      <!-- Mode Toggle -->
      <div class="mb-8">
        <div class="flex rounded-lg border border-default p-1 bg-elevated">
          <button
            :class="[
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
              uploadMode === 'upload' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground',
            ]"
            @click="uploadMode = 'upload'"
          >
            <UIcon name="i-heroicons-arrow-up-tray" class="size-4" />
            Upload Files
          </button>
          <button
            :class="[
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
              uploadMode === 'link' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground',
            ]"
            @click="uploadMode = 'link'"
          >
            <UIcon name="i-heroicons-link" class="size-4" />
            Link External Model
          </button>
        </div>
        <p class="text-xs text-muted mt-2 text-center">
          {{
            uploadMode === 'upload'
              ? 'Upload your own 3D model files directly to our platform.'
              : 'Link to a model hosted on MakerWorld, Printables, Thingiverse, or Cults3D.'
          }}
        </p>
      </div>

      <!-- Linked Model Upload Flow -->
      <template v-if="uploadMode === 'link'">
        <ModelsLinkedUpload @submitted="handleLinkedSubmit" />
      </template>

      <!-- Regular Upload Flow -->
      <template v-else>
        <!-- Progress Steps -->
        <div class="mb-8">
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
        </div>

        <!-- Error Alert -->
        <UAlert
          v-if="error"
          color="error"
          icon="i-heroicons-exclamation-circle"
          :title="error"
          class="mb-6"
          :close-button="{
            icon: 'i-heroicons-x-mark',
            color: 'error',
            variant: 'link',
          }"
          @close="error = null"
        />

        <!-- Step Content -->
        <UCard>
          <template #header>
            <h2 class="font-semibold">{{ stepTitles[currentStep - 1] }}</h2>
          </template>

          <!-- Step 1: Basic Info -->
          <div v-show="currentStep === 1" class="space-y-6">
            <UFormField label="Model Name" required>
              <UInput v-model="name" placeholder="e.g., Haltech Elite 2500 ECU Mount" size="lg" />
              <template #description>
                <span class="text-xs">3-100 characters. Be descriptive and include the ECU/vehicle if applicable.</span>
              </template>
            </UFormField>

            <UFormField label="Description" required>
              <UTextarea
                v-model="description"
                placeholder="Describe your model, its purpose, and any important details..."
                :rows="4"
              />
              <template #description>
                <span class="text-xs">{{ description.length }}/2000 characters. Minimum 10 characters.</span>
              </template>
            </UFormField>

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

            <UFormField label="License" required>
              <USelectMenu
                v-model="license"
                :items="
                  licenses.map((l) => ({
                    label: `${l.label} - ${l.description}`,
                    value: l.value,
                  }))
                "
                value-key="value"
              />
            </UFormField>

            <div class="grid sm:grid-cols-2 gap-4">
              <div class="flex items-center justify-between p-3 rounded-lg bg-elevated">
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm">Allow Remixes</p>
                  <p class="text-xs text-muted">Others can modify and share</p>
                </div>
                <div class="shrink-0 ml-3">
                  <USwitch v-model="remixesAllowed" />
                </div>
              </div>
              <div class="flex items-center justify-between p-3 rounded-lg bg-elevated">
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm">Commercial Use</p>
                  <p class="text-xs text-muted">Can be used commercially</p>
                </div>
                <div class="shrink-0 ml-3">
                  <USwitch v-model="commercialUseAllowed" />
                </div>
              </div>
            </div>

            <UFormField label="Source URL">
              <UInput v-model="sourceUrl" type="url" placeholder="https://github.com/..." icon="i-heroicons-link" />
              <template #description>
                <span class="text-xs">Link to source files, GitHub repo, or original design.</span>
              </template>
            </UFormField>
          </div>

          <!-- Step 2: Files -->
          <div v-show="currentStep === 2">
            <ModelsFileUploader
              :files="pendingFiles"
              :allowed-formats="ALLOWED_FILE_FORMATS"
              :max-file-size="MAX_FILE_SIZE"
              :max-total-size="MAX_TOTAL_FILES_SIZE"
              :total-size="totalFilesSize"
              @add="addFiles"
              @remove="removeFile"
              @set-primary="setPrimaryFile"
            />
          </div>

          <!-- Step 3: Images -->
          <div v-show="currentStep === 3">
            <ModelsImageUploader
              :images="pendingImages"
              :max-image-size="MAX_IMAGE_SIZE"
              @add="addImages"
              @remove="removeImage"
              @set-primary="setPrimaryImage"
              @set-type="setImageType"
              @reorder="reorderImages"
            />
          </div>

          <!-- Step 4: Print Settings -->
          <div v-show="currentStep === 4" class="space-y-6">
            <UFormField label="Recommended Material" required>
              <USelectMenu v-model="printing.recommendedMaterial" :items="materials" />
            </UFormField>

            <div class="grid sm:grid-cols-2 gap-4">
              <UFormField label="Layer Height (mm)">
                <UInput v-model.number="printing.layerHeight" type="number" step="0.05" min="0.05" max="0.5" />
              </UFormField>
              <UFormField label="Infill (%)">
                <UInput v-model.number="printing.infillPercent" type="number" min="0" max="100" />
              </UFormField>
            </div>

            <div class="flex items-center justify-between p-3 rounded-lg bg-elevated">
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm">Supports Required</p>
                <p class="text-xs text-muted">Does this model need support structures?</p>
              </div>
              <div class="shrink-0 ml-3">
                <USwitch v-model="printing.supportsRequired" />
              </div>
            </div>

            <div v-if="printing.supportsRequired" class="grid sm:grid-cols-2 gap-4">
              <UFormField label="Support Type">
                <USelectMenu
                  v-model="printing.supportType"
                  :items="[
                    { label: 'Normal', value: 'normal' },
                    { label: 'Tree', value: 'tree' },
                    { label: 'Organic', value: 'organic' },
                  ]"
                  value-key="value"
                />
              </UFormField>
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
              <UFormField label="Estimated Print Time (hours)">
                <UInput v-model.number="printing.estimatedTimeHours" type="number" min="0" step="0.5" />
              </UFormField>
              <UFormField label="Estimated Filament (grams)">
                <UInput v-model.number="printing.estimatedFilamentGrams" type="number" min="0" />
              </UFormField>
            </div>

            <UFormField label="Print Notes">
              <UTextarea
                v-model="printing.notes"
                placeholder="Any special instructions or tips for printing..."
                :rows="3"
              />
            </UFormField>
          </div>

          <!-- Step 5: Hardware & Assembly -->
          <div v-show="currentStep === 5" class="space-y-6">
            <!-- Hardware -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="font-medium">Required Hardware</h3>
                  <p class="text-sm text-muted">List any screws, nuts, or other hardware needed</p>
                </div>
                <UButton variant="outline" size="sm" icon="i-heroicons-plus" @click="addHardwareItem">
                  Add Item
                </UButton>
              </div>

              <div v-if="hardware.length > 0" class="space-y-3">
                <div
                  v-for="(item, index) in hardware"
                  :key="index"
                  class="flex gap-3 items-start p-3 rounded-lg bg-elevated"
                >
                  <div class="flex-1 grid sm:grid-cols-3 gap-3">
                    <UInput v-model="item.item" placeholder="Item name (e.g., M4x10 screw)" />
                    <UInput v-model.number="item.quantity" type="number" min="1" placeholder="Qty" />
                    <div class="flex items-center gap-2">
                      <div class="shrink-0">
                        <USwitch v-model="item.optional" size="sm" />
                      </div>
                      <span class="text-sm text-muted">Optional</span>
                    </div>
                  </div>
                  <UButton
                    variant="ghost"
                    color="error"
                    size="xs"
                    icon="i-heroicons-trash"
                    @click="removeHardwareItem(index)"
                  />
                </div>
              </div>

              <p v-else class="text-sm text-muted text-center py-4">
                No hardware items added. Click "Add Item" if your model requires additional hardware.
              </p>
            </div>

            <USeparator />

            <!-- Assembly -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="font-medium">Assembly Instructions</h3>
                  <p class="text-sm text-muted">Optional step-by-step instructions</p>
                </div>
              </div>

              <UFormField label="Difficulty" class="mb-4">
                <div class="flex gap-2">
                  <button
                    v-for="diff in difficulties"
                    :key="diff.value"
                    type="button"
                    :class="[
                      'px-4 py-2 rounded-lg border-2 transition-all',
                      assembly.difficulty === diff.value
                        ? 'border-primary bg-primary/5'
                        : 'border-default hover:border-primary/50',
                    ]"
                    @click="assembly.difficulty = diff.value as 'easy' | 'moderate' | 'advanced'"
                  >
                    {{ diff.label }}
                  </button>
                </div>
              </UFormField>

              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium">Steps</label>
                  <UButton variant="ghost" size="xs" icon="i-heroicons-plus" @click="addAssemblyStep">
                    Add Step
                  </UButton>
                </div>

                <div v-if="assembly.steps?.length" class="space-y-2">
                  <div v-for="(step, index) in assembly.steps" :key="index" class="flex gap-2 items-center">
                    <span class="text-sm text-muted w-6">{{ index + 1 }}.</span>
                    <UInput v-model="assembly.steps[index]" placeholder="Describe this step..." class="flex-1" />
                    <UButton
                      variant="ghost"
                      color="error"
                      size="xs"
                      icon="i-heroicons-x-mark"
                      @click="removeAssemblyStep(index)"
                    />
                  </div>
                </div>
              </div>
            </div>
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

                <UButton v-else :loading="saving" :disabled="!canSubmit" @click="handleSubmit">
                  Submit for Review
                </UButton>
              </div>
            </div>
          </template>
        </UCard>

        <!-- Info Card -->
        <UCard class="mt-6">
          <div class="flex gap-4">
            <UIcon name="i-heroicons-information-circle" class="size-6 text-primary shrink-0" />
            <div class="text-sm text-muted">
              <p class="mb-2">
                <strong>What happens next?</strong>
              </p>
              <p>
                After you submit, your model will be reviewed by our moderation team. This usually takes 1-2 business
                days. You'll receive a notification when your model is approved and published.
              </p>
            </div>
          </div>
        </UCard>
      </template>
    </UContainer>
  </div>
</template>
