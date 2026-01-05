<script setup lang="ts">
import type { Adapter } from "~/types/adapter";

const props = defineProps<{
  adapters: Adapter[];
}>();

const shuffleArray = (array: Adapter[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i]!, shuffled[j]!] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
};

const marqueeAdaptersData = useState<Adapter[][]>("marqueeAdapters", () => []);

const getRandomDelay = (rowIndex: number, index: number) => {
  const baseDelay = rowIndex * 0.3 + index * 0.05;
  const randomOffset = ((rowIndex * 13 + index) % 10) * 0.1;
  return baseDelay + randomOffset;
};

const { getVendorIcon } = useVendorIcons();

const initMarqueeAdapters = () => {
  if (marqueeAdaptersData.value.length) return;

  const allAdapters = props.adapters;
  // Duplicate adapters to fill the marquee if we don't have many
  const expandedAdapters =
    allAdapters.length < 20
      ? [...allAdapters, ...allAdapters, ...allAdapters, ...allAdapters]
      : allAdapters;

  const row1 = shuffleArray(expandedAdapters);
  const row2 = shuffleArray(expandedAdapters);
  const row3 = shuffleArray(expandedAdapters);

  marqueeAdaptersData.value = [row1, row2, row3];
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
  setTimeout(() => {
    isLoaded.value = true;
  }, 100);
});
</script>

<template>
  <div class="absolute isolate inset-0 overflow-hidden">
    <div class="flex flex-col justify-between pt-4">
      <div
        v-for="(row, rowIndex) in marqueeAdaptersData"
        :key="rowIndex"
        class="flex gap-4 mb-4 overflow-hidden"
        :class="
          rowIndex % 2 === 1 ? 'animate-marquee-reverse' : 'animate-marquee'
        "
      >
        <div
          v-for="(adapter, index) in row"
          :key="`${rowIndex}-${adapter.id}-${index}`"
          class="flex items-center justify-center size-16 rounded-lg bg-muted p-2 border border-default shadow-lg shrink-0 transition-all duration-500"
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
      </div>
    </div>

    <!-- Gradient overlays -->
    <div
      class="absolute left-0 top-0 bottom-0 w-1/2 z-10 bg-gradient-to-l from-transparent to-default"
    />
    <div
      class="absolute right-0 top-0 bottom-0 w-1/2 z-10 bg-gradient-to-r from-transparent to-default"
    />
    <div
      class="absolute top-0 left-0 right-0 size-full z-10 bg-gradient-to-t from-default via-default/80 to-transparent"
    />
  </div>
</template>

<style scoped>
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
