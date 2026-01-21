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

  // Color class mappings for Tailwind (dynamic strings don't work with JIT)
  const colorClasses = {
    primary: {
      active: 'bg-primary/10 text-primary ring-2 ring-primary/30',
      badge: 'bg-primary/20',
    },
    success: {
      active: 'bg-success/10 text-success ring-2 ring-success/30',
      badge: 'bg-success/20',
    },
    warning: {
      active: 'bg-warning/10 text-warning ring-2 ring-warning/30',
      badge: 'bg-warning/20',
    },
  } as const;

  const tabs = computed(() => [
    {
      key: 'all' as const,
      label: 'All',
      count: props.counts.all,
      icon: 'i-heroicons-squares-2x2',
      color: 'primary' as const,
    },
    {
      key: 'adapter' as const,
      label: 'Adapters',
      count: props.counts.adapter,
      icon: 'i-heroicons-document-text',
      color: 'primary' as const,
    },
    {
      key: 'protocol' as const,
      label: 'Protocols',
      count: props.counts.protocol,
      icon: 'i-heroicons-signal',
      color: 'success' as const,
    },
    {
      key: 'model' as const,
      label: '3D Models',
      count: props.counts.model,
      icon: 'i-heroicons-cube',
      color: 'warning' as const,
    },
  ]);
</script>

<template>
  <div class="flex flex-wrap gap-2 justify-center" role="tablist" aria-label="Content type filter">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :id="`tab-${tab.key}`"
      role="tab"
      :aria-selected="selected === tab.key"
      :aria-controls="`tabpanel-${tab.key}`"
      :tabindex="selected === tab.key ? 0 : -1"
      class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
      :class="[
        selected === tab.key
          ? colorClasses[tab.color].active
          : 'bg-muted/30 text-muted hover:bg-muted/50 hover:text-default',
      ]"
      @click="emit('select', tab.key)"
    >
      <UIcon :name="tab.icon" class="size-4" aria-hidden="true" />
      <span>{{ tab.label }}</span>
      <span
        class="px-1.5 py-0.5 rounded text-xs"
        :class="[selected === tab.key ? colorClasses[tab.color].badge : 'bg-muted/50']"
      >
        {{ tab.count }}
      </span>
    </button>
  </div>
</template>
