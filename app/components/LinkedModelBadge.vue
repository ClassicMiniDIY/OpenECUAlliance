<script setup lang="ts">
  import { EXTERNAL_PLATFORMS, type ExternalPlatform } from '~/types/model';

  const props = defineProps<{
    platform: ExternalPlatform;
    size?: 'sm' | 'md' | 'lg';
    showName?: boolean;
  }>();

  const platformInfo = computed(() => EXTERNAL_PLATFORMS[props.platform]);

  const sizeClasses = computed(() => {
    switch (props.size) {
      case 'sm':
        return 'text-xs px-1.5 py-0.5';
      case 'lg':
        return 'text-sm px-3 py-1.5';
      default:
        return 'text-xs px-2 py-1';
    }
  });

  const iconSize = computed(() => {
    switch (props.size) {
      case 'sm':
        return 'size-3';
      case 'lg':
        return 'size-5';
      default:
        return 'size-4';
    }
  });
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full font-medium"
    :class="sizeClasses"
    :style="{
      backgroundColor: `${platformInfo.color}20`,
      color: platformInfo.color,
    }"
  >
    <UIcon :name="platformInfo.icon" :class="iconSize" />
    <span v-if="showName">{{ platformInfo.name }}</span>
  </span>
</template>
