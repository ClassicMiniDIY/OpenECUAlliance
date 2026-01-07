<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      modelValue?: number;
      readonly?: boolean;
      size?: 'xs' | 'sm' | 'md' | 'lg';
      showValue?: boolean;
      showCount?: boolean;
      count?: number;
      precision?: 'full' | 'half';
    }>(),
    {
      modelValue: 0,
      readonly: false,
      size: 'md',
      showValue: false,
      showCount: false,
      count: 0,
      precision: 'full',
    }
  );

  const emit = defineEmits<{
    'update:modelValue': [value: number];
    change: [value: number];
  }>();

  const hoverValue = ref(0);
  const isHovering = ref(false);

  const displayValue = computed(() => {
    if (!props.readonly && isHovering.value) {
      return hoverValue.value;
    }
    return props.modelValue;
  });

  function handleClick(star: number) {
    if (props.readonly) return;
    emit('update:modelValue', star);
    emit('change', star);
  }

  function handleMouseEnter(star: number) {
    if (props.readonly) return;
    isHovering.value = true;
    hoverValue.value = star;
  }

  function handleMouseLeave() {
    if (props.readonly) return;
    isHovering.value = false;
    hoverValue.value = 0;
  }

  function getStarFill(star: number): 'full' | 'half' | 'empty' {
    const value = displayValue.value;

    if (value >= star) {
      return 'full';
    }

    if (props.precision === 'half' && value >= star - 0.5) {
      return 'half';
    }

    return 'empty';
  }

  const sizeClasses = computed(() => {
    switch (props.size) {
      case 'xs':
        return 'size-3';
      case 'sm':
        return 'size-4';
      case 'lg':
        return 'size-6';
      default:
        return 'size-5';
    }
  });

  const gapClasses = computed(() => {
    switch (props.size) {
      case 'xs':
        return 'gap-0.5';
      case 'sm':
        return 'gap-0.5';
      case 'lg':
        return 'gap-1.5';
      default:
        return 'gap-1';
    }
  });

  const textClasses = computed(() => {
    switch (props.size) {
      case 'xs':
        return 'text-xs';
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  });

  const formattedValue = computed(() => {
    return props.modelValue.toFixed(1);
  });
</script>

<template>
  <div class="inline-flex items-center" :class="gapClasses">
    <!-- Stars -->
    <div class="inline-flex" :class="[gapClasses, !readonly && 'cursor-pointer']" @mouseleave="handleMouseLeave">
      <button
        v-for="star in 5"
        :key="star"
        type="button"
        class="relative focus:outline-none"
        :class="[sizeClasses, !readonly && 'hover:scale-110 transition-transform']"
        :disabled="readonly"
        @click="handleClick(star)"
        @mouseenter="handleMouseEnter(star)"
      >
        <!-- Empty star (background) -->
        <UIcon name="i-heroicons-star" class="absolute inset-0 text-muted/30" :class="sizeClasses" />

        <!-- Half star -->
        <div v-if="getStarFill(star) === 'half'" class="absolute inset-0 overflow-hidden" style="width: 50%">
          <UIcon name="i-heroicons-star-solid" class="text-warning" :class="sizeClasses" />
        </div>

        <!-- Full star -->
        <UIcon
          v-if="getStarFill(star) === 'full'"
          name="i-heroicons-star-solid"
          class="absolute inset-0 text-warning"
          :class="sizeClasses"
        />
      </button>
    </div>

    <!-- Value display -->
    <span v-if="showValue" class="font-medium text-default ml-1" :class="textClasses">
      {{ formattedValue }}
    </span>

    <!-- Count display -->
    <span v-if="showCount" class="text-muted ml-1" :class="textClasses"> ({{ count }}) </span>
  </div>
</template>
