import type {
  ModelCategory,
  ModelFormData,
  PrintSettings,
  HardwareItem,
  AssemblyInstructions,
  ModelCompatibility,
  PendingFileUpload,
  PendingImageUpload,
} from "~/types/model";

const ALLOWED_FILE_FORMATS = [
  "stl",
  "step",
  "stp",
  "3mf",
  "obj",
  "iges",
  "igs",
  "f3d",
  "f3z",
];
const ALLOWED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TOTAL_FILES_SIZE = 200 * 1024 * 1024; // 200MB total

export function useModelUpload() {
  const supabase = useSupabaseClient();
  const { currentUser } = useAuth();

  // Form state
  const currentStep = ref(1);
  const totalSteps = 5;
  const saving = ref(false);
  const error = ref<string | null>(null);

  // Step 1: Basic Info
  const name = ref("");
  const description = ref("");
  const category = ref<ModelCategory>("mounts");
  const vendor = ref("");
  const license = ref("CC-BY-SA-4.0");
  const sourceUrl = ref("");
  const remixOf = ref("");
  const remixesAllowed = ref(true);
  const commercialUseAllowed = ref(false);

  // Step 2: Files
  const pendingFiles = ref<PendingFileUpload[]>([]);

  // Step 3: Images
  const pendingImages = ref<PendingImageUpload[]>([]);

  // Step 4: Print Settings
  const printing = ref<PrintSettings>({
    recommendedMaterial: "PLA",
    layerHeight: 0.2,
    infillPercent: 20,
    supportsRequired: false,
  });

  // Step 5: Hardware & Assembly (optional)
  const hardware = ref<HardwareItem[]>([]);
  const assembly = ref<AssemblyInstructions>({
    difficulty: "easy",
    toolsRequired: [],
    steps: [],
  });
  const compatibility = ref<ModelCompatibility>({});

  // Computed
  const totalFilesSize = computed(() =>
    pendingFiles.value.reduce((sum, f) => sum + f.sizeBytes, 0),
  );

  const canProceedStep1 = computed(
    () =>
      name.value.trim().length >= 3 &&
      description.value.trim().length >= 10 &&
      category.value,
  );

  const canProceedStep2 = computed(
    () =>
      pendingFiles.value.length > 0 &&
      pendingFiles.value.some((f) => f.isPrimary) &&
      totalFilesSize.value <= MAX_TOTAL_FILES_SIZE,
  );

  const canProceedStep3 = computed(
    () =>
      pendingImages.value.length > 0 &&
      pendingImages.value.some((i) => i.isPrimary),
  );

  const canProceedStep4 = computed(
    () => printing.value.recommendedMaterial.trim().length > 0,
  );

  const canSubmit = computed(
    () =>
      canProceedStep1.value &&
      canProceedStep2.value &&
      canProceedStep3.value &&
      canProceedStep4.value,
  );

  // File handling
  function addFiles(files: FileList | File[]) {
    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!ALLOWED_FILE_FORMATS.includes(ext)) {
        error.value = `Invalid file format: ${ext}. Allowed: ${ALLOWED_FILE_FORMATS.join(", ")}`;
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        error.value = `File too large: ${file.name}. Max size is 50MB.`;
        continue;
      }
      if (totalFilesSize.value + file.size > MAX_TOTAL_FILES_SIZE) {
        error.value = "Total file size exceeds 200MB limit.";
        continue;
      }

      const isPrimary = pendingFiles.value.length === 0;
      pendingFiles.value.push({
        id: crypto.randomUUID(),
        file,
        filename: file.name,
        format: ext,
        sizeBytes: file.size,
        isPrimary,
        progress: 0,
        status: "pending",
      });
    }
  }

  function removeFile(id: string) {
    const index = pendingFiles.value.findIndex((f) => f.id === id);
    if (index !== -1) {
      const wasRemoved = pendingFiles.value.splice(index, 1)[0];
      // If primary was removed, make first file primary
      if (wasRemoved.isPrimary && pendingFiles.value.length > 0) {
        pendingFiles.value[0].isPrimary = true;
      }
    }
  }

  function setPrimaryFile(id: string) {
    pendingFiles.value.forEach((f) => {
      f.isPrimary = f.id === id;
    });
  }

  // Image handling
  function addImages(files: FileList | File[]) {
    for (const file of files) {
      if (!ALLOWED_IMAGE_FORMATS.includes(file.type)) {
        error.value = "Invalid image format. Allowed: JPG, PNG, WebP, GIF";
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        error.value = `Image too large: ${file.name}. Max size is 10MB.`;
        continue;
      }

      const isPrimary = pendingImages.value.length === 0;
      const previewUrl = URL.createObjectURL(file);

      pendingImages.value.push({
        id: crypto.randomUUID(),
        file,
        filename: file.name,
        type: "render",
        previewUrl,
        sizeBytes: file.size,
        isPrimary,
        sortOrder: pendingImages.value.length,
        progress: 0,
        status: "pending",
      });
    }
  }

  function removeImage(id: string) {
    const index = pendingImages.value.findIndex((i) => i.id === id);
    if (index !== -1) {
      const removed = pendingImages.value.splice(index, 1)[0];
      URL.revokeObjectURL(removed.previewUrl);
      // If primary was removed, make first image primary
      if (removed.isPrimary && pendingImages.value.length > 0) {
        pendingImages.value[0].isPrimary = true;
      }
      // Update sort orders
      pendingImages.value.forEach((img, idx) => {
        img.sortOrder = idx;
      });
    }
  }

  function setPrimaryImage(id: string) {
    pendingImages.value.forEach((i) => {
      i.isPrimary = i.id === id;
    });
  }

  function setImageType(
    id: string,
    type: "render" | "photo" | "diagram" | "screenshot",
  ) {
    const image = pendingImages.value.find((i) => i.id === id);
    if (image) image.type = type;
  }

  function reorderImages(fromIndex: number, toIndex: number) {
    const item = pendingImages.value.splice(fromIndex, 1)[0];
    pendingImages.value.splice(toIndex, 0, item);
    pendingImages.value.forEach((img, idx) => {
      img.sortOrder = idx;
    });
  }

  // Hardware handling
  function addHardwareItem() {
    hardware.value.push({
      item: "",
      quantity: 1,
      optional: false,
    });
  }

  function removeHardwareItem(index: number) {
    hardware.value.splice(index, 1);
  }

  // Assembly steps handling
  function addAssemblyStep() {
    if (!assembly.value.steps) assembly.value.steps = [];
    assembly.value.steps.push("");
  }

  function removeAssemblyStep(index: number) {
    assembly.value.steps?.splice(index, 1);
  }

  // Generate slug from name
  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 100);
  }

  // Submit model
  async function submitModel(): Promise<string | null> {
    if (!canSubmit.value) return null;

    saving.value = true;
    error.value = null;

    try {
      // Get user directly from Supabase auth to ensure we have the ID
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        throw new Error("Not authenticated. Please log in again.");
      }

      const slug = generateSlug(name.value);
      const modelId = crypto.randomUUID();

      // 1. Create the model record
      const printingData = {
        recommended_material: printing.value.recommendedMaterial,
        alternative_materials: printing.value.alternativeMaterials,
        not_recommended_materials: printing.value.notRecommendedMaterials,
        layer_height: printing.value.layerHeight,
        infill_percent: printing.value.infillPercent,
        infill_pattern: printing.value.infillPattern,
        wall_count: printing.value.wallCount,
        supports_required: printing.value.supportsRequired,
        support_type: printing.value.supportType,
        orientation: printing.value.orientation,
        bed_adhesion: printing.value.bedAdhesion,
        estimated_time_hours: printing.value.estimatedTimeHours,
        estimated_filament_grams: printing.value.estimatedFilamentGrams,
        nozzle_size: printing.value.nozzleSize,
        bed_temp_celsius: printing.value.bedTempCelsius,
        hotend_temp_celsius: printing.value.hotendTempCelsius,
        notes: printing.value.notes,
      };

      const { error: modelError } = await supabase.from("models").insert({
        id: modelId,
        slug,
        author_id: authUser.id,
        name: name.value.trim(),
        description: description.value.trim(),
        category: category.value,
        vendor: vendor.value.trim() || null,
        license: license.value,
        source_url: sourceUrl.value.trim() || null,
        remix_of: remixOf.value.trim() || null,
        remixes_allowed: remixesAllowed.value,
        commercial_use_allowed: commercialUseAllowed.value,
        compatibility:
          Object.keys(compatibility.value).length > 0
            ? compatibility.value
            : null,
        printing: printingData,
        hardware: hardware.value.length > 0 ? hardware.value : null,
        assembly: assembly.value.steps?.length ? assembly.value : null,
        status: "pending",
      });

      if (modelError) throw new Error(modelError.message);

      // 2. Upload files to storage and create records
      for (const pendingFile of pendingFiles.value) {
        pendingFile.status = "uploading";

        const storagePath = `${modelId}/${pendingFile.id}.${pendingFile.format}`;

        const { error: uploadError } = await supabase.storage
          .from("model-files")
          .upload(storagePath, pendingFile.file);

        if (uploadError) {
          pendingFile.status = "error";
          pendingFile.error = uploadError.message;
          continue;
        }

        const { error: fileRecordError } = await supabase
          .from("model_files")
          .insert({
            model_id: modelId,
            filename: `${pendingFile.id}.${pendingFile.format}`,
            original_filename: pendingFile.filename,
            format: pendingFile.format,
            storage_path: storagePath,
            size_bytes: pendingFile.sizeBytes,
            is_primary: pendingFile.isPrimary,
          });

        if (fileRecordError) {
          pendingFile.status = "error";
          pendingFile.error = fileRecordError.message;
        } else {
          pendingFile.status = "complete";
          pendingFile.progress = 100;
        }
      }

      // 3. Upload images to storage and create records
      for (const pendingImage of pendingImages.value) {
        pendingImage.status = "uploading";

        const ext = pendingImage.filename.split(".").pop() || "jpg";
        const storagePath = `${modelId}/${pendingImage.id}.${ext}`;

        console.log("[Upload] Uploading image to storage:", storagePath);

        const { error: uploadError } = await supabase.storage
          .from("model-images")
          .upload(storagePath, pendingImage.file);

        if (uploadError) {
          console.error("[Upload] Storage upload failed:", uploadError);
          pendingImage.status = "error";
          pendingImage.error = uploadError.message;
          continue;
        }

        console.log("[Upload] Storage upload successful, creating record...");

        const { error: imageRecordError } = await supabase
          .from("model_images")
          .insert({
            model_id: modelId,
            filename: `${pendingImage.id}.${ext}`,
            type: pendingImage.type,
            storage_path: storagePath,
            is_primary: pendingImage.isPrimary,
            sort_order: pendingImage.sortOrder,
          });

        if (imageRecordError) {
          console.error(
            "[Upload] Image record insert failed:",
            imageRecordError,
          );
          pendingImage.status = "error";
          pendingImage.error = imageRecordError.message;
        } else {
          console.log("[Upload] Image record created successfully");
          pendingImage.status = "complete";
          pendingImage.progress = 100;
        }
      }

      // 4. Create moderation queue entry
      await supabase.from("moderation_queue").insert({
        model_id: modelId,
        action_type: "new_submission",
        status: "pending",
      });

      return modelId;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to submit model";
      return null;
    } finally {
      saving.value = false;
    }
  }

  // Reset form
  function resetForm() {
    currentStep.value = 1;
    name.value = "";
    description.value = "";
    category.value = "mounts";
    vendor.value = "";
    license.value = "CC-BY-SA-4.0";
    sourceUrl.value = "";
    remixOf.value = "";
    remixesAllowed.value = true;
    commercialUseAllowed.value = false;

    // Clean up image preview URLs
    pendingImages.value.forEach((img) => URL.revokeObjectURL(img.previewUrl));

    pendingFiles.value = [];
    pendingImages.value = [];
    printing.value = {
      recommendedMaterial: "PLA",
      layerHeight: 0.2,
      infillPercent: 20,
      supportsRequired: false,
    };
    hardware.value = [];
    assembly.value = {
      difficulty: "easy",
      toolsRequired: [],
      steps: [],
    };
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

  // Cleanup on unmount
  onUnmounted(() => {
    pendingImages.value.forEach((img) => URL.revokeObjectURL(img.previewUrl));
  });

  return {
    // Step state
    currentStep,
    totalSteps,
    saving,
    error,

    // Step 1: Basic Info
    name,
    description,
    category,
    vendor,
    license,
    sourceUrl,
    remixOf,
    remixesAllowed,
    commercialUseAllowed,

    // Step 2: Files
    pendingFiles,
    totalFilesSize,
    addFiles,
    removeFile,
    setPrimaryFile,

    // Step 3: Images
    pendingImages,
    addImages,
    removeImage,
    setPrimaryImage,
    setImageType,
    reorderImages,

    // Step 4: Print Settings
    printing,

    // Step 5: Hardware & Assembly
    hardware,
    assembly,
    compatibility,
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
    resetForm,
    nextStep,
    prevStep,
    goToStep,

    // Constants
    ALLOWED_FILE_FORMATS,
    MAX_FILE_SIZE,
    MAX_IMAGE_SIZE,
    MAX_TOTAL_FILES_SIZE,
  };
}
