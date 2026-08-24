<script setup lang="ts">
  import type { ProtocolDetail } from '~/types/protocol';

  const route = useRoute();
  const vendor = route.params.vendor as string;
  const id = route.params.id as string;

  const { data: protocol, status } = await useFetch<ProtocolDetail>(`/api/protocols/${vendor}/${id}`, {
    key: `protocol-${vendor}-${id}`,
  });

  const { getVendorIcon } = useVendorIcons();
  const { formatBaudrate } = useProtocols();

  useSeoMeta({
    title: () =>
      protocol.value ? `${protocol.value.name} CAN Protocol - OpenECU Alliance` : 'Protocol - OpenECU Alliance',
    description: () =>
      protocol.value?.description || 'Open source CAN Bus protocol definition with DBC export for ECU communication.',
    ogTitle: () => (protocol.value ? `${protocol.value.name} - CAN Bus Protocol` : 'CAN Bus Protocol'),
    ogDescription: () =>
      protocol.value?.description || 'Open source CAN Bus protocol definition with DBC export for ECU communication.',
    ogType: 'article',
    twitterCard: 'summary_large_image',
  });

  const fallbackIcon = computed(() => getVendorIcon(vendor));

  const formattedBaudrate = computed(() => (protocol.value ? formatBaudrate(protocol.value.protocol.baudrate) : ''));

  const totalSignals = computed(() => {
    if (!protocol.value) return 0;
    return protocol.value.messages.reduce((total, msg) => total + msg.signals.length, 0);
  });

  // Message ID formatter
  function formatMessageId(id: number | string): string {
    const numId = typeof id === 'string' ? parseInt(id, 16) : id;
    return `0x${numId.toString(16).toUpperCase().padStart(3, '0')}`;
  }

  // Copy to clipboard
  const copied = ref<string | null>(null);
  async function copyToClipboard(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    copied.value = key;
    setTimeout(() => {
      copied.value = null;
    }, 2000);
  }

  // Expanded messages for viewing signals
  const expandedMessages = ref<Set<string>>(new Set());
  function toggleMessage(msgId: string) {
    if (expandedMessages.value.has(msgId)) {
      expandedMessages.value.delete(msgId);
    } else {
      expandedMessages.value.add(msgId);
    }
  }

  // Message and signal search. A protocol can carry hundreds of signals buried
  // inside collapsed messages, so the query has to reach into the signals too —
  // a message whose signals match is auto-expanded rather than left closed.
  const { fuzzyScoreFields } = useFuzzySearch();
  const messageQuery = ref('');

  const filteredMessages = computed(() => {
    const messages = protocol.value?.messages ?? [];
    const query = messageQuery.value.trim();

    if (!query) {
      return messages.map((msg) => ({ msg, signals: msg.signals, signalMatch: false }));
    }

    const results: Array<{ msg: (typeof messages)[number]; signals: (typeof messages)[number]['signals']; signalMatch: boolean }> =
      [];

    for (const msg of messages) {
      const msgMatch =
        fuzzyScoreFields([msg.name, msg.description, formatMessageId(msg.id), String(msg.id), msg.transmitter], query) > 0;
      const matchedSignals = msg.signals.filter(
        (sig) => fuzzyScoreFields([sig.name, sig.id, sig.description, sig.unit, sig.category], query) > 0
      );

      // Matching signals win the display: they are shown alone and the message
      // is auto-expanded, so the hit is visible without a click. A message that
      // matched only by name or description keeps its full, collapsed table.
      if (matchedSignals.length) {
        results.push({ msg, signals: matchedSignals, signalMatch: true });
      } else if (msgMatch) {
        results.push({ msg, signals: msg.signals, signalMatch: false });
      }
    }

    return results;
  });

  const matchedSignalCount = computed(() =>
    filteredMessages.value.reduce((total, entry) => total + entry.signals.length, 0)
  );

  function isExpanded(entry: { msg: { id: number | string }; signalMatch: boolean }): boolean {
    return entry.signalMatch || expandedMessages.value.has(String(entry.msg.id));
  }
</script>

<template>
  <div>
    <UContainer class="py-8">
      <!-- Breadcrumb -->
      <nav class="mb-6" aria-label="Breadcrumb">
        <ol class="flex items-center gap-2 text-sm text-muted">
          <li>
            <NuxtLink to="/protocols" class="hover:text-primary"> Protocols </NuxtLink>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <NuxtLink :to="`/protocols?vendor=${vendor}`" class="hover:text-primary capitalize">
              {{ vendor }}
            </NuxtLink>
          </li>
          <li aria-hidden="true">/</li>
          <li class="text-default font-medium truncate">
            {{ protocol?.name || id }}
          </li>
        </ol>
      </nav>

      <!-- Loading -->
      <div v-if="status === 'pending'" class="flex items-center justify-center py-24">
        <UIcon name="i-heroicons-arrow-path" class="size-8 text-success animate-spin" />
      </div>

      <!-- Error -->
      <UCard v-else-if="status === 'error'" class="text-center py-12">
        <UIcon name="i-heroicons-exclamation-triangle" class="size-12 text-error mx-auto mb-4" />
        <h2 class="font-semibold mb-2">Protocol not found</h2>
        <p class="text-muted mb-4">The protocol "{{ id }}" could not be found.</p>
        <UButton to="/protocols" variant="soft">Back to Protocols</UButton>
      </UCard>

      <!-- Protocol Detail -->
      <div v-else-if="protocol">
        <!-- Header -->
        <div class="flex items-start gap-4 mb-8">
          <div class="bg-success/10 p-4 rounded-xl shrink-0" aria-hidden="true">
            <img
              v-if="protocol.branding?.icon"
              :src="protocol.branding.icon"
              :alt="`${vendor} logo`"
              class="size-12 object-contain"
            />
            <UIcon v-else :name="fallbackIcon" class="size-12 text-success" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-2xl sm:text-3xl font-bold">
                {{ protocol.name }}
              </h1>
              <UBadge color="success" variant="subtle">
                {{ protocol.protocol.type.toUpperCase() }}
              </UBadge>
            </div>
            <p class="text-muted capitalize mb-4">{{ vendor }}</p>
            <p v-if="protocol.description" class="text-muted max-w-2xl">
              {{ protocol.description }}
            </p>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <UCard>
            <div class="text-center">
              <div class="text-2xl font-bold text-success">
                {{ formattedBaudrate }}
              </div>
              <div class="text-sm text-muted">Baud Rate</div>
            </div>
          </UCard>
          <UCard>
            <div class="text-center">
              <div class="text-2xl font-bold">
                {{ protocol.messages.length }}
              </div>
              <div class="text-sm text-muted">Messages</div>
            </div>
          </UCard>
          <UCard>
            <div class="text-center">
              <div class="text-2xl font-bold">{{ totalSignals }}</div>
              <div class="text-sm text-muted">Signals</div>
            </div>
          </UCard>
          <UCard>
            <div class="text-center">
              <div class="text-2xl font-bold">v{{ protocol.version }}</div>
              <div class="text-sm text-muted">Version</div>
            </div>
          </UCard>
        </div>

        <!-- Messages -->
        <div class="mb-8">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 class="text-xl font-semibold">
              Messages
              <span class="text-muted font-normal">
                ({{
                  messageQuery
                    ? `${filteredMessages.length} of ${protocol.messages.length}, ${matchedSignalCount} signals`
                    : protocol.messages.length
                }})
              </span>
            </h2>
            <UInput
              v-model="messageQuery"
              icon="i-heroicons-magnifying-glass"
              placeholder="Search messages, signals, CAN IDs..."
              variant="subtle"
              class="w-full sm:w-80"
              aria-label="Search messages and signals"
            >
              <template #trailing>
                <UButton
                  v-if="messageQuery"
                  color="neutral"
                  variant="link"
                  icon="i-heroicons-x-mark"
                  aria-label="Clear message search"
                  @click="messageQuery = ''"
                />
              </template>
            </UInput>
          </div>

          <div v-if="messageQuery && !filteredMessages.length" class="text-center py-12 text-muted">
            <UIcon name="i-heroicons-magnifying-glass" class="size-8 mb-2" />
            <p>No messages or signals match "{{ messageQuery }}".</p>
          </div>

          <div v-else class="space-y-3">
            <UCard v-for="entry in filteredMessages" :key="String(entry.msg.id)" class="overflow-hidden">
              <!-- Message Header -->
              <button
                class="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                @click="toggleMessage(String(entry.msg.id))"
              >
                <div class="flex items-center gap-4">
                  <code
                    class="bg-success/10 text-success px-2 py-1 rounded font-mono text-sm cursor-pointer hover:bg-success/20"
                    @click.stop="copyToClipboard(formatMessageId(entry.msg.id), String(entry.msg.id))"
                  >
                    {{ formatMessageId(entry.msg.id) }}
                    <UIcon v-if="copied === String(entry.msg.id)" name="i-heroicons-check" class="size-3 ml-1" />
                  </code>
                  <div>
                    <div class="font-medium">{{ entry.msg.name }}</div>
                    <div class="text-sm text-muted">
                      {{ entry.msg.length }} bytes
                      <span v-if="entry.msg.intervalMs"> • {{ entry.msg.intervalMs }}ms interval </span>
                      •
                      <span v-if="entry.signalMatch">
                        {{ entry.signals.length }} of {{ entry.msg.signals.length }} signals match
                      </span>
                      <span v-else>{{ entry.msg.signals.length }} signals</span>
                    </div>
                  </div>
                </div>
                <UIcon
                  :name="isExpanded(entry) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                  class="size-5 text-muted"
                />
              </button>

              <!-- Signals (expanded) -->
              <div v-if="isExpanded(entry)" class="border-t border-default">
                <table class="w-full text-sm">
                  <thead class="bg-muted/30">
                    <tr>
                      <th class="text-left p-3 font-medium">Signal</th>
                      <th class="text-left p-3 font-medium">Canonical ID</th>
                      <th class="text-left p-3 font-medium">Bits</th>
                      <th class="text-left p-3 font-medium">Type</th>
                      <th class="text-left p-3 font-medium">Scale</th>
                      <th class="text-left p-3 font-medium">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="sig in entry.signals" :key="sig.name" class="border-t border-default">
                      <td class="p-3">
                        <div class="font-medium">{{ sig.name }}</div>
                        <div v-if="sig.description" class="text-xs text-muted truncate max-w-xs">
                          {{ sig.description }}
                        </div>
                      </td>
                      <!-- The canonical id is what makes a CAN signal comparable
                           to the same measurement from a log adapter. Signals
                           without one are labelled rather than left blank, so a
                           gap in the mapping is visibly different from padding. -->
                      <td class="p-3">
                        <NuxtLink
                          v-if="sig.id"
                          :to="`/spec#${sig.id}`"
                          class="font-mono text-xs text-primary hover:underline"
                        >
                          {{ sig.id }}
                        </NuxtLink>
                        <UBadge v-else-if="sig.reserved" color="neutral" variant="subtle" size="sm">reserved</UBadge>
                        <UTooltip v-else-if="sig.vendorSpecific" text="A real measurement with no canonical equivalent in the OpenECU Spec.">
                          <UBadge color="warning" variant="subtle" size="sm">vendor-specific</UBadge>
                        </UTooltip>
                        <span v-else class="text-muted text-xs">—</span>
                      </td>
                      <td class="p-3 font-mono text-xs">{{ sig.startBit }}:{{ sig.length }}</td>
                      <td class="p-3 text-xs">
                        <UBadge color="neutral" variant="subtle" size="sm">
                          {{ sig.dataType }}
                        </UBadge>
                      </td>
                      <td class="p-3 font-mono text-xs">
                        <span v-if="sig.scale !== 1 || sig.offset !== 0">
                          {{ sig.scale || 1 }}x +{{ sig.offset || 0 }}
                        </span>
                        <span v-else class="text-muted">-</span>
                      </td>
                      <td class="p-3">{{ sig.unit || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </UCard>
          </div>
        </div>

        <!-- Metadata -->
        <div v-if="protocol.metadata" class="grid md:grid-cols-2 gap-6">
          <!-- Tested With -->
          <UCard v-if="protocol.metadata.testedWith?.length">
            <template #header>
              <h3 class="font-semibold">Tested With</h3>
            </template>
            <ul class="space-y-1">
              <li v-for="ecu in protocol.metadata.testedWith" :key="ecu" class="flex items-center gap-2 text-sm">
                <UIcon name="i-heroicons-check-circle" class="size-4 text-success" />
                {{ ecu }}
              </li>
            </ul>
          </UCard>

          <!-- Compatible Tools -->
          <UCard v-if="protocol.metadata.compatibleTools?.length">
            <template #header>
              <h3 class="font-semibold">Compatible Tools</h3>
            </template>
            <div class="flex flex-wrap gap-2">
              <UBadge v-for="tool in protocol.metadata.compatibleTools" :key="tool" color="neutral" variant="subtle">
                {{ tool }}
              </UBadge>
            </div>
          </UCard>
        </div>
      </div>
    </UContainer>
  </div>
</template>
