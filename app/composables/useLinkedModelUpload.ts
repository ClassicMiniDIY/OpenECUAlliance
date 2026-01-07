import type {
  ModelCategory,
  ModelCompatibility,
  ExternalPlatform,
  EcuVendor,
} from "~/types/model";

export interface FetchedPrintSettings {
  recommendedMaterial?: string;
  layerHeight?: number;
  infillPercent?: number;
  wallCount?: number;
  supportsRequired?: boolean;
  estimatedTimeHours?: number;
}

export interface FetchedMetadata {
  platform: ExternalPlatform;
  externalId: string;
  title: string;
  description: string;
  authorName: string;
  authorUrl: string | null;
  images: Array<{ url: string; isPrimary: boolean }>;
  license: string | null;
  tags: string[];
  remixesAllowed: boolean;
  commercialUseAllowed: boolean;
  normalizedUrl: string;
  printSettings?: FetchedPrintSettings;
}

export function useLinkedModelUpload() {
  // Form state - now only 2 steps (print settings come from source)
  const currentStep = ref(1);
  const totalSteps = 2;
  const saving = ref(false);
  const fetching = ref(false);
  const error = ref<string | null>(null);

  // Step 1: URL and fetched metadata
  const externalUrl = ref("");
  const fetchedMetadata = ref<FetchedMetadata | null>(null);

  // Editable fields from metadata (name and description only)
  const name = ref("");
  const description = ref("");

  // Step 2: ECU-specific fields
  const category = ref<ModelCategory>("mounts");
  const vendor = ref<EcuVendor | "">("");
  const compatibility = ref<ModelCompatibility>({});

  // Computed
  const canFetch = computed(() => {
    if (!externalUrl.value) return false;
    try {
      new URL(externalUrl.value);
      return true;
    } catch {
      return false;
    }
  });

  const canProceedStep1 = computed(
    () =>
      fetchedMetadata.value !== null &&
      name.value.trim().length >= 3 &&
      description.value.trim().length >= 10,
  );

  const canProceedStep2 = computed(() => category.value !== undefined);

  // Can submit when step 1 and 2 requirements are met
  const canSubmit = computed(
    () => canProceedStep1.value && canProceedStep2.value,
  );

  // Fetch metadata from external URL
  async function fetchMetadata() {
    if (!canFetch.value) return;

    fetching.value = true;
    error.value = null;

    try {
      const response = await $fetch<{
        success: boolean;
        data: FetchedMetadata;
      }>("/api/models/external/fetch", {
        method: "POST",
        body: { url: externalUrl.value },
      });

      if (response.success && response.data) {
        fetchedMetadata.value = response.data;

        // Pre-fill editable fields (name and description only)
        // License, remixes, commercial use, and print settings are locked to source values
        name.value = response.data.title;
        description.value = response.data.description;
      }
    } catch (err: any) {
      error.value =
        err.data?.message || err.message || "Failed to fetch model information";
      fetchedMetadata.value = null;
    } finally {
      fetching.value = false;
    }
  }

  // Submit linked model
  async function submitModel(): Promise<{
    modelId: string;
    slug: string;
    category: ModelCategory;
  } | null> {
    if (!canSubmit.value || !fetchedMetadata.value) return null;

    saving.value = true;
    error.value = null;

    try {
      const response = await $fetch<{
        success: boolean;
        data: { modelId: string; slug: string; category: ModelCategory };
      }>("/api/models/external/submit", {
        method: "POST",
        body: {
          url: fetchedMetadata.value.normalizedUrl,
          name: name.value.trim(),
          description: description.value.trim(),
          category: category.value,
          vendor: vendor.value.trim() || undefined,
          // Note: license/remixes/commercial/printing are NOT sent - server fetches fresh from source
          compatibility:
            Object.keys(compatibility.value).length > 0
              ? compatibility.value
              : undefined,
        },
      });

      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (err: any) {
      error.value =
        err.data?.message || err.message || "Failed to submit model";
      return null;
    } finally {
      saving.value = false;
    }
  }

  // Reset form
  function resetForm() {
    currentStep.value = 1;
    externalUrl.value = "";
    fetchedMetadata.value = null;
    name.value = "";
    description.value = "";
    category.value = "mounts";
    vendor.value = "";
    compatibility.value = {};
    error.value = null;
  }

  // Navigation
  function nextStep() {
    if (currentStep.value < totalSteps) {
      currentStep.value++;
    }
  }

  function prevStep() {
    if (currentStep.value > 1) {
      currentStep.value--;
    }
  }

  function goToStep(step: number) {
    if (step >= 1 && step <= totalSteps) {
      currentStep.value = step;
    }
  }

  return {
    // Step state
    currentStep,
    totalSteps,
    saving,
    fetching,
    error,

    // Step 1: URL and metadata
    externalUrl,
    fetchedMetadata,
    name,
    description,

    // Step 2: ECU fields
    category,
    vendor,
    compatibility,

    // Validation
    canFetch,
    canProceedStep1,
    canProceedStep2,
    canSubmit,

    // Actions
    fetchMetadata,
    submitModel,
    resetForm,
    nextStep,
    prevStep,
    goToStep,
  };
}
