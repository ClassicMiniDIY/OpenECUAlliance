<script setup lang="ts">
  import type { ContentType } from '~/types/content';

  const props = defineProps<{
    selected: ContentType | 'all';
    counts: {
      all: number;
      adapter: number;
      protocol: number;
      model: number;
    };
  }>();

  const emit = defineEmits<{
    select: [type: ContentType | 'all'];
  }>();

  const tabs = computed(() => [
    {
      key: 'all' as const,
      label: 'All',
      count: props.counts.all,
      icon: 'i-heroicons-squares-2x2',
      color: 'primary',
    },
    {
      key: 'adapter' as const,
      label: 'Adapters',
      count: props.counts.adapter,
      icon: 'i-heroicons-document-text',
      color: 'primary',
    },
    {
      key: 'protocol' as const,
      label: 'Protocols',
      count: props.counts.protocol,
      icon: 'i-heroicons-signal',
      color: 'success',
    },
    {
      key: 'model' as const,
      label: '3D Models',
      count: props.counts.model,
      icon: 'i-heroicons-cube',
      color: 'warning',
    },
  ]);
</script>

<template>
  <div class="flex flex-wrap gap-2 justify-center" role="tablist" aria-label="Content type filter">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      role="tab"
      :aria-selected="selected === tab.key"
      :aria-controls="`${tab.key}-panel`"
      class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
      :class="[
        selected === tab.key
          ? `bg-${tab.color}/10 text-${tab.color} ring-2 ring-${tab.color}/30`
          : 'bg-muted/30 text-muted hover:bg-muted/50 hover:text-default',
      ]"
      @click="emit('select', tab.key)"
    >
      <UIcon :name="tab.icon" class="size-4" aria-hidden="true" />
      <span>{{ tab.label }}</span>
      <span
        class="px-1.5 py-0.5 rounded text-xs"
        :class="[selected === tab.key ? `bg-${tab.color}/20` : 'bg-muted/50']"
      >
        {{ tab.count }}
      </span>
    </button>
  </div>
</template>
