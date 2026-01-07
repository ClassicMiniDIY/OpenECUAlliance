<script setup lang="ts">
import type { PendingImageUpload } from "~/types/model";

const props = defineProps<{
  images: PendingImageUpload[];
  maxImageSize: number;
}>();

const emit = defineEmits<{
  add: [files: FileList];
  remove: [id: string];
  setPrimary: [id: string];
  setType: [id: string, type: "render" | "photo" | "diagram" | "screenshot"];
  reorder: [fromIndex: number, toIndex: number];
}>();

const dropZone = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const imageTypes = [
  { value: "render", label: "3D Render" },
  { value: "photo", label: "Photo" },
  { value: "diagram", label: "Diagram" },
  { value: "screenshot", label: "Screenshot" },
] as const;

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  isDragging.value = true;
}

function handleDragLeave() {
  isDragging.value = false;
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  isDragging.value = false;
  if (e.dataTransfer?.files) {
    emit("add", e.dataTransfer.files);
  }
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files) {
    emit("add", input.files);
    input.value = "";
  }
}

function openFilePicker() {
  fileInput.value?.click();
}

// Drag and drop reordering
const draggedIndex = ref<number | null>(null);

function handleItemDragStart(index: number) {
  draggedIndex.value = index;
}

function handleItemDragOver(e: DragEvent, index: number) {
  e.preventDefault();
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    emit("reorder", draggedIndex.value, index);
    draggedIndex.value = index;
  }
}

function handleItemDragEnd() {
  draggedIndex.value = null;
}
</script>

<template>
  <div class="space-y-4">
    <!-- Drop Zone -->
    <div
      ref="dropZone"
      :class="[
        'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-default hover:border-primary/50',
      ]"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="openFilePicker"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        class="hidden"
        @change="handleFileSelect"
      />

      <UIcon
        name="i-heroicons-photo"
        :class="[
          'size-12 mx-auto mb-4',
          isDragging ? 'text-primary' : 'text-muted',
        ]"
      />
      <p class="font-medium mb-1">Drop images here or click to browse</p>
      <p class="text-sm text-muted">
        JPG, PNG, WebP, or GIF. Max {{ formatBytes(maxImageSize) }} each.
      </p>
    </div>

    <!-- Image Grid -->
    <div
      v-if="images.length > 0"
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      <div
        v-for="(image, index) in images"
        :key="image.id"
        :class="[
          'relative group rounded-lg overflow-hidden border-2 transition-all cursor-move',
          image.isPrimary
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-default',
          draggedIndex === index ? 'opacity-50' : '',
        ]"
        draggable="true"
        @dragstart="handleItemDragStart(index)"
        @dragover="(e) => handleItemDragOver(e, index)"
        @dragend="handleItemDragEnd"
      >
        <!-- Image Preview -->
        <div class="aspect-square bg-elevated">
          <img
            :src="image.previewUrl"
            :alt="image.filename"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Primary Badge -->
        <div v-if="image.isPrimary" class="absolute top-2 left-2">
          <UBadge color="primary" variant="solid" size="xs"> Primary </UBadge>
        </div>

        <!-- Type Badge -->
        <div class="absolute top-2 right-2">
          <UBadge color="neutral" variant="solid" size="xs">
            {{ imageTypes.find((t) => t.value === image.type)?.label }}
          </UBadge>
        </div>

        <!-- Hover Overlay -->
        <div
          class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3"
        >
          <!-- File Info -->
          <p class="text-white text-xs truncate mb-2">
            {{ image.filename }}
          </p>

          <!-- Actions -->
          <div class="flex gap-1">
            <UTooltip v-if="!image.isPrimary" text="Set as primary">
              <UButton
                size="xs"
                color="neutral"
                variant="solid"
                icon="i-heroicons-star"
                @click.stop="emit('setPrimary', image.id)"
              />
            </UTooltip>

            <UDropdownMenu
              :items="[
                [
                  ...imageTypes.map((t) => ({
                    label: t.label,
                    click: () => emit('setType', image.id, t.value),
                    active: image.type === t.value,
                  })),
                ],
              ]"
            >
              <UButton
                size="xs"
                color="neutral"
                variant="solid"
                icon="i-heroicons-tag"
                @click.stop
              />
            </UDropdownMenu>

            <UTooltip text="Remove">
              <UButton
                size="xs"
                color="error"
                variant="solid"
                icon="i-heroicons-trash"
                @click.stop="emit('remove', image.id)"
              />
            </UTooltip>
          </div>
        </div>

        <!-- Upload Status -->
        <div
          v-if="image.status === 'uploading'"
          class="absolute inset-0 bg-black/80 flex items-center justify-center"
        >
          <div class="text-center">
            <UIcon
              name="i-heroicons-arrow-path"
              class="size-8 text-white animate-spin"
            />
            <p class="text-white text-xs mt-2">{{ image.progress }}%</p>
          </div>
        </div>

        <div
          v-else-if="image.status === 'error'"
          class="absolute inset-0 bg-error/80 flex items-center justify-center p-2"
        >
          <p class="text-white text-xs text-center">{{ image.error }}</p>
        </div>

        <div
          v-else-if="image.status === 'complete'"
          class="absolute top-2 left-2"
        >
          <UIcon
            name="i-heroicons-check-circle-solid"
            class="size-5 text-success"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8 text-muted">
      <UIcon name="i-heroicons-photo" class="size-8 mx-auto mb-2" />
      <p>No images added yet</p>
      <p class="text-sm">Add at least one image to showcase your model</p>
    </div>

    <!-- Reorder Hint -->
    <p v-if="images.length > 1" class="text-xs text-muted text-center">
      Drag images to reorder. The primary image will be shown first.
    </p>
  </div>
</template>
