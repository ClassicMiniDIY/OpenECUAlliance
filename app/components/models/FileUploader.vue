<script setup lang="ts">
  import type { PendingFileUpload } from '~/types/model';

  const props = defineProps<{
    files: PendingFileUpload[];
    allowedFormats: string[];
    maxFileSize: number;
    maxTotalSize: number;
    totalSize: number;
  }>();

  const emit = defineEmits<{
    add: [files: FileList];
    remove: [id: string];
    setPrimary: [id: string];
    updateDescription: [id: string, description: string];
    updateVariant: [id: string, variant: string];
  }>();

  const dropZone = ref<HTMLElement | null>(null);
  const isDragging = ref(false);
  const fileInput = ref<HTMLInputElement | null>(null);

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
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
      emit('add', e.dataTransfer.files);
    }
  }

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      emit('add', input.files);
      input.value = '';
    }
  }

  function openFilePicker() {
    fileInput.value?.click();
  }

  const remainingSpace = computed(() => props.maxTotalSize - props.totalSize);
  const usagePercent = computed(() => (props.totalSize / props.maxTotalSize) * 100);
</script>

<template>
  <div class="space-y-4">
    <!-- Drop Zone -->
    <div
      ref="dropZone"
      :class="[
        'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
        isDragging ? 'border-primary bg-primary/5' : 'border-default hover:border-primary/50',
      ]"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="openFilePicker"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="allowedFormats.map((f) => `.${f}`).join(',')"
        multiple
        class="hidden"
        @change="handleFileSelect"
      />

      <UIcon
        name="i-heroicons-cloud-arrow-up"
        :class="['size-12 mx-auto mb-4', isDragging ? 'text-primary' : 'text-muted']"
      />
      <p class="font-medium mb-1">Drop files here or click to browse</p>
      <p class="text-sm text-muted">Supported: {{ allowedFormats.join(', ').toUpperCase() }}</p>
      <p class="text-xs text-muted mt-1">
        Max {{ formatBytes(maxFileSize) }} per file, {{ formatBytes(maxTotalSize) }} total
      </p>
    </div>

    <!-- Storage Usage -->
    <div v-if="files.length > 0" class="space-y-2">
      <div class="flex justify-between text-sm">
        <span class="text-muted">Storage used</span>
        <span :class="usagePercent > 90 ? 'text-error' : 'text-muted'">
          {{ formatBytes(totalSize) }} / {{ formatBytes(maxTotalSize) }}
        </span>
      </div>
    </div>

    <!-- File List -->
    <div v-if="files.length > 0" class="space-y-3">
      <div
        v-for="file in files"
        :key="file.id"
        class="flex items-start gap-3 p-3 rounded-lg bg-elevated border border-default"
      >
        <!-- File Icon -->
        <div class="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <UIcon name="i-heroicons-document" class="size-5 text-primary" />
        </div>

        <!-- File Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <p class="font-medium truncate">{{ file.filename }}</p>
            <UBadge v-if="file.isPrimary" color="primary" variant="subtle" size="xs"> Primary </UBadge>
            <UBadge color="neutral" variant="outline" size="xs">
              {{ file.format.toUpperCase() }}
            </UBadge>
          </div>
          <p class="text-sm text-muted">{{ formatBytes(file.sizeBytes) }}</p>

          <!-- Status -->
          <div v-if="file.status === 'uploading'" class="mt-2">
            <UProgress :value="file.progress" size="xs" />
          </div>
          <div v-else-if="file.status === 'error'" class="mt-2">
            <p class="text-xs text-error">{{ file.error }}</p>
          </div>
          <div v-else-if="file.status === 'complete'" class="mt-2">
            <p class="text-xs text-success flex items-center gap-1">
              <UIcon name="i-heroicons-check-circle" class="size-3" />
              Uploaded
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1 shrink-0">
          <UTooltip v-if="!file.isPrimary" text="Set as primary">
            <UButton
              variant="ghost"
              color="neutral"
              size="xs"
              icon="i-heroicons-star"
              @click="emit('setPrimary', file.id)"
            />
          </UTooltip>
          <UTooltip text="Remove">
            <UButton
              variant="ghost"
              color="error"
              size="xs"
              icon="i-heroicons-trash"
              @click="emit('remove', file.id)"
            />
          </UTooltip>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8 text-muted">
      <UIcon name="i-heroicons-document-plus" class="size-8 mx-auto mb-2" />
      <p>No files added yet</p>
    </div>
  </div>
</template>
