<script setup lang="ts">
import type { Adapter } from "~/types/adapter";

const props = defineProps<{
  adapters: Adapter[];
}>();

// Shuffle array ensuring no adjacent duplicates
const shuffleNoAdjacent = (array: Adapter[]): Adapter[] => {
  if (array.length <= 1) return [...array];

  const result: Adapter[] = [];
  const available = [...array];

  while (available.length > 0) {
    const lastId = result.length > 0 ? result[result.length - 1]!.id : null;

    // Find candidates that aren't the same as the last item
    const candidates = available.filter((a) => a.id !== lastId);

    if (candidates.length === 0) {
      // If stuck, just take any remaining item
      const idx = Math.floor(Math.random() * available.length);
      result.push(available.splice(idx, 1)[0]!);
    } else {
      const idx = Math.floor(Math.random() * candidates.length);
      const chosen = candidates[idx]!;
      result.push(chosen);
      const availableIdx = available.findIndex((a) => a.id === chosen.id);
      available.splice(availableIdx, 1);
    }
  }

  return result;
};

const marqueeAdaptersData = useState<Adapter[][]>("marqueeAdapters", () => []);

const getRandomDelay = (rowIndex: number, index: number) => {
  // Very fast staggered appearance - all icons visible within ~300ms
  return rowIndex * 0.05 + index * 0.01;
};

const { getVendorIcon } = useVendorIcons();

const initMarqueeAdapters = () => {
  if (marqueeAdaptersData.value.length) return;

  const allAdapters = props.adapters;
  if (allAdapters.length === 0) return;

  // Create enough items for a full row (around 16-20 items looks good)
  const targetCount = 16;
  const createRow = (): Adapter[] => {
    const items: Adapter[] = [];
    while (items.length < targetCount) {
      items.push(...allAdapters);
    }
    return shuffleNoAdjacent(items.slice(0, targetCount));
  };

  marqueeAdaptersData.value = [createRow(), createRow(), createRow()];
};

watch(
  () => props.adapters,
  (newVal?: Adapter[]) => {
    if (newVal?.length && !marqueeAdaptersData.value.length) {
      initMarqueeAdapters();
    }
  },
  { immediate: true },
);

const isLoaded = ref(false);
onMounted(() => {
  // Trigger fade-in immediately
  isLoaded.value = true;
});
</script>

<template>
  <div class="absolute isolate inset-0 overflow-hidden">
    <div class="flex flex-col justify-between pt-4">
      <div
        v-for="(row, rowIndex) in marqueeAdaptersData"
        :key="rowIndex"
        class="flex gap-4 mb-4"
        :class="
          rowIndex % 2 === 1 ? 'animate-marquee-reverse' : 'animate-marquee'
        "
      >
        <!-- First set of items -->
        <div
          v-for="(adapter, index) in row"
          :key="`${rowIndex}-a-${adapter.id}-${index}`"
          class="flex items-center justify-center size-16 rounded-lg bg-muted p-2 border border-default shadow-lg shrink-0 transition-all duration-200"
          :class="
            isLoaded
              ? 'opacity-100 scale-100 blur-0'
              : 'opacity-0 scale-50 blur-sm'
          "
          :style="{ transitionDelay: `${getRandomDelay(rowIndex, index)}s` }"
        >
          <img
            v-if="adapter.branding?.icon"
            :src="adapter.branding.icon"
            :alt="adapter.name"
            class="size-8 object-contain"
          />
          <UIcon
            v-else
            :name="getVendorIcon(adapter.vendor)"
            class="size-8 text-primary"
          />
        </div>
        <!-- Duplicate set for seamless loop -->
        <div
          v-for="(adapter, index) in row"
          :key="`${rowIndex}-b-${adapter.id}-${index}`"
          class="flex items-center justify-center size-16 rounded-lg bg-muted p-2 border border-default shadow-lg shrink-0 transition-all duration-200"
          :class="
            isLoaded
              ? 'opacity-100 scale-100 blur-0'
              : 'opacity-0 scale-50 blur-sm'
          "
          :style="{
            transitionDelay: `${getRandomDelay(rowIndex, index + row.length)}s`,
          }"
        >
          <img
            v-if="adapter.branding?.icon"
            :src="adapter.branding.icon"
            :alt="adapter.name"
            class="size-8 object-contain"
          />
          <UIcon
            v-else
            :name="getVendorIcon(adapter.vendor)"
            class="size-8 text-primary"
          />
        </div>
      </div>
    </div>

    <!-- Dark overlay for text legibility -->
    <div class="absolute inset-0 z-5 dark-overlay" />

    <!-- Gradient overlays -->
    <!-- Left fade -->
    <div
      class="absolute left-0 top-0 bottom-0 w-1/3 z-10 bg-linear-to-r from-default to-transparent"
    />
    <!-- Right fade -->
    <div
      class="absolute right-0 top-0 bottom-0 w-1/3 z-10 bg-linear-to-l from-default to-transparent"
    />
    <!-- Bottom fade -->
    <div
      class="absolute top-0 left-0 right-0 size-full z-10 bg-linear-to-t from-default via-default/80 to-transparent"
    />
    <!-- Center text protection - radial vignette for better text legibility -->
    <div class="absolute inset-0 z-10 text-protection" />
  </div>
</template>

<style scoped>
.dark-overlay {
  background-color: rgba(47, 47, 47, 0.6);
}

.text-protection {
  background: radial-gradient(
    ellipse 70% 60% at 50% 55%,
    var(--ui-bg) 0%,
    var(--ui-bg) 15%,
    transparent 65%
  );
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@keyframes marquee-reverse {
  0% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(0);
  }
}

.animate-marquee {
  animation: marquee 120s linear infinite;
}

.animate-marquee-reverse {
  animation: marquee-reverse 120s linear infinite;
}
</style>
