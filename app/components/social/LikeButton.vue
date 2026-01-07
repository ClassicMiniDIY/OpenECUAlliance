<script setup lang="ts">
  const props = defineProps<{
    modelId: string;
    initialLiked?: boolean;
    initialCount?: number;
    size?: 'sm' | 'md' | 'lg';
    showCount?: boolean;
  }>();

  const emit = defineEmits<{
    change: [liked: boolean, count: number];
  }>();

  const { toggleLike, isAuthenticated } = useLikes();
  const toast = useToast();

  const liked = ref(props.initialLiked ?? false);
  const count = ref(props.initialCount ?? 0);
  const loading = ref(false);
  const animating = ref(false);

  // Sync with props
  watch(
    () => props.initialLiked,
    (val) => {
      if (val !== undefined) liked.value = val;
    }
  );

  watch(
    () => props.initialCount,
    (val) => {
      if (val !== undefined) count.value = val;
    }
  );

  async function handleClick() {
    if (!isAuthenticated.value) {
      toast.add({
        title: 'Sign in required',
        description: 'Please sign in to like models.',
        color: 'warning',
      });
      return;
    }

    // Optimistic update
    const wasLiked = liked.value;
    liked.value = !wasLiked;
    count.value = wasLiked ? count.value - 1 : count.value + 1;

    // Trigger animation
    if (!wasLiked) {
      animating.value = true;
      setTimeout(() => (animating.value = false), 300);
    }

    loading.value = true;

    const result = await toggleLike(props.modelId);

    if (result.error) {
      // Revert on error
      liked.value = wasLiked;
      count.value = wasLiked ? count.value + 1 : count.value - 1;
      toast.add({
        title: 'Error',
        description: result.error,
        color: 'error',
      });
    } else {
      emit('change', result.liked, count.value);
    }

    loading.value = false;
  }

  const sizeClasses = computed(() => {
    switch (props.size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  });

  const iconSize = computed(() => {
    switch (props.size) {
      case 'sm':
        return 'size-4';
      case 'lg':
        return 'size-6';
      default:
        return 'size-5';
    }
  });
</script>

<template>
  <button
    type="button"
    :class="[
      'inline-flex items-center gap-1.5 transition-colors',
      sizeClasses,
      liked ? 'text-error' : 'text-muted hover:text-error',
      loading ? 'opacity-50 cursor-wait' : 'cursor-pointer',
    ]"
    :disabled="loading"
    @click="handleClick"
  >
    <span class="relative">
      <UIcon
        :name="liked ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
        :class="[iconSize, 'transition-transform', animating ? 'scale-125' : 'scale-100']"
      />
      <!-- Burst animation -->
      <span v-if="animating" class="absolute inset-0 animate-ping">
        <UIcon name="i-heroicons-heart-solid" :class="[iconSize, 'text-error opacity-75']" />
      </span>
    </span>
    <span v-if="showCount !== false" class="tabular-nums">
      {{ count }}
    </span>
  </button>
</template>
