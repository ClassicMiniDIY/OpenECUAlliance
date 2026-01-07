<script setup lang="ts">
  import { EXTERNAL_PLATFORMS, type ExternalPlatform } from '~/types/model';

  const props = defineProps<{
    modelValue: string;
    disabled?: boolean;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: string];
    fetch: [];
  }>();

  const url = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  });

  const detectedPlatform = computed((): ExternalPlatform | null => {
    if (!url.value) return null;

    for (const [platformId, info] of Object.entries(EXTERNAL_PLATFORMS)) {
      if (info.urlPattern.test(url.value)) {
        return platformId as ExternalPlatform;
      }
    }
    return null;
  });

  const platformInfo = computed(() => (detectedPlatform.value ? EXTERNAL_PLATFORMS[detectedPlatform.value] : null));

  const isValidUrl = computed(() => {
    if (!url.value) return false;
    try {
      new URL(url.value);
      return detectedPlatform.value !== null;
    } catch {
      return false;
    }
  });

  function handleFetch() {
    if (isValidUrl.value) {
      emit('fetch');
    }
  }
</script>

<template>
  <div class="space-y-2">
    <div class="flex gap-2">
      <UInput
        v-model="url"
        placeholder="Paste URL from MakerWorld, Printables, Thingiverse, or Cults3D"
        :disabled="disabled"
        class="flex-1"
        size="lg"
        @keydown.enter="handleFetch"
      >
        <template #leading>
          <UIcon name="i-heroicons-link" class="size-5 text-muted" />
        </template>
        <template v-if="platformInfo" #trailing>
          <span class="flex items-center gap-1 text-xs font-medium" :style="{ color: platformInfo.color }">
            <UIcon :name="platformInfo.icon" class="size-4" />
            {{ platformInfo.name }}
          </span>
        </template>
      </UInput>
      <UButton :disabled="!isValidUrl || disabled" size="lg" @click="handleFetch"> Fetch </UButton>
    </div>

    <p class="text-xs text-muted">
      Supported platforms:
      <span v-for="(info, id) in EXTERNAL_PLATFORMS" :key="id" class="inline-flex items-center gap-0.5 mx-1">
        <UIcon :name="info.icon" class="size-3" :style="{ color: info.color }" />
        {{ info.name }}
      </span>
    </p>
  </div>
</template>
