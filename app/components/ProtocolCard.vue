<script setup lang="ts">
import type { Protocol } from "~/types/protocol";

const NuxtLink = resolveComponent("NuxtLink");

const props = defineProps<{
  protocol: Protocol;
}>();

const { getVendorIcon } = useVendorIcons();
const { formatBaudrate } = useProtocols();

const fallbackIcon = computed(() => getVendorIcon(props.protocol.vendor));

const accessibleDescription = computed(() => {
  const desc =
    props.protocol.description ||
    `CAN protocol definition for ${props.protocol.name}`;
  return `${props.protocol.name} by ${props.protocol.vendor}. ${desc} ${props.protocol.messageCount} messages, ${props.protocol.signalCount} signals. Version ${props.protocol.version}.`;
});

const formattedBaudrate = computed(() =>
  formatBaudrate(props.protocol.baudrate),
);

const protocolTypeLabel = computed(() => {
  const labels: Record<string, string> = {
    can: "CAN",
    canfd: "CAN FD",
    lin: "LIN",
    "k-line": "K-Line",
  };
  return labels[props.protocol.protocolType] || props.protocol.protocolType;
});
</script>

<template>
  <UCard
    :as="NuxtLink"
    :to="`/protocols/${protocol.vendor}/${protocol.id}`"
    class="hover:ring-2 hover:ring-success/50 transition-all cursor-pointer"
    :aria-label="accessibleDescription"
  >
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="flex items-start gap-3 mb-3">
        <div
          class="bg-success/10 p-2.5 rounded-lg shrink-0 flex items-center justify-center size-10"
          aria-hidden="true"
        >
          <img
            v-if="protocol.branding?.icon"
            :src="protocol.branding.icon"
            :alt="`${protocol.vendor} logo`"
            class="size-5 object-contain"
          />
          <UIcon
            v-else
            :name="fallbackIcon"
            class="size-5 text-success"
            aria-hidden="true"
          />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h3 class="font-semibold truncate">{{ protocol.name }}</h3>
            <UBadge color="success" variant="subtle" size="sm">
              {{ protocolTypeLabel }}
            </UBadge>
          </div>
          <p class="text-sm text-muted">{{ protocol.vendor }}</p>
        </div>
      </div>

      <!-- Description -->
      <p class="text-sm text-muted line-clamp-2 mb-4 flex-1">
        {{
          protocol.description || `CAN protocol definition for ${protocol.name}`
        }}
      </p>

      <!-- Footer -->
      <div
        class="flex items-center justify-between text-sm text-muted pt-3 border-t border-default"
      >
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1">
            <UIcon
              name="i-heroicons-envelope"
              class="size-3.5"
              aria-hidden="true"
            />
            <span>{{ protocol.messageCount }} msgs</span>
          </div>
          <div class="flex items-center gap-1">
            <UIcon
              name="i-heroicons-signal"
              class="size-3.5"
              aria-hidden="true"
            />
            <span>{{ protocol.signalCount }} sigs</span>
          </div>
        </div>
        <span class="text-xs">{{ formattedBaudrate }}</span>
      </div>
    </div>
  </UCard>
</template>
