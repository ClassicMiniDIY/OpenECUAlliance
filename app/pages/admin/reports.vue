<script setup lang="ts">
  definePageMeta({
    layout: 'default',
    middleware: 'admin',
  });

  useSeoMeta({
    title: 'Content Reports - OpenECU Alliance',
    description: 'Review and manage user-submitted content reports.',
    robots: 'noindex, nofollow',
  });

  const { fetchReports, resolveReport, loading, error } = useModeration();
  const toast = useToast();

  interface Report {
    id: string;
    model_id: string;
    reason: string;
    details: string | null;
    status: string;
    resolution_notes: string | null;
    created_at: string;
    resolved_at: string | null;
    profiles: {
      id: string;
      username: string;
      display_name: string | null;
    };
    models: {
      id: string;
      slug: string;
      name: string;
      category: string;
    };
  }

  const reports = ref<Report[]>([]);
  const statusFilter = ref<'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed'>('pending');
  const resolveModalOpen = ref(false);
  const selectedReport = ref<Report | null>(null);
  const resolutionType = ref<'reviewed' | 'resolved' | 'dismissed'>('resolved');
  const resolutionNotes = ref('');
  const processing = ref(false);

  const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'dismissed', label: 'Dismissed' },
  ];

  const filteredReports = computed(() => {
    if (statusFilter.value === 'all') return reports.value;
    return reports.value.filter((r) => r.status === statusFilter.value);
  });

  const statusCounts = computed(() => {
    const counts: Record<string, number> = { all: reports.value.length };
    for (const report of reports.value) {
      counts[report.status] = (counts[report.status] || 0) + 1;
    }
    return counts;
  });

  function getReasonLabel(reason: string): string {
    switch (reason) {
      case 'spam':
        return 'Spam';
      case 'inappropriate':
        return 'Inappropriate';
      case 'copyright':
        return 'Copyright';
      case 'incorrect_info':
        return 'Incorrect Info';
      case 'broken_files':
        return 'Broken Files';
      case 'duplicate':
        return 'Duplicate';
      case 'other':
        return 'Other';
      default:
        return reason;
    }
  }

  function getReasonColor(reason: string): string {
    switch (reason) {
      case 'spam':
        return 'error';
      case 'inappropriate':
        return 'error';
      case 'copyright':
        return 'warning';
      case 'incorrect_info':
        return 'info';
      case 'broken_files':
        return 'warning';
      case 'duplicate':
        return 'neutral';
      case 'other':
        return 'neutral';
      default:
        return 'neutral';
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'reviewed':
        return 'info';
      case 'resolved':
        return 'success';
      case 'dismissed':
        return 'neutral';
      default:
        return 'neutral';
    }
  }

  function formatDate(date: string): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  }

  function openResolveModal(report: Report) {
    selectedReport.value = report;
    resolutionType.value = 'resolved';
    resolutionNotes.value = '';
    resolveModalOpen.value = true;
  }

  async function handleResolve() {
    if (!selectedReport.value) return;

    processing.value = true;
    const success = await resolveReport(
      selectedReport.value.id,
      resolutionType.value,
      resolutionNotes.value || undefined
    );

    if (success) {
      toast.add({ title: 'Report resolved', color: 'success' });
      resolveModalOpen.value = false;
      await loadReports();
    } else {
      toast.add({ title: 'Failed to resolve report', color: 'error' });
    }
    processing.value = false;
  }

  async function loadReports() {
    reports.value = await fetchReports();
  }

  onMounted(() => {
    loadReports();
  });
</script>

<template>
  <div>
    <UContainer class="py-12">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <UButton to="/admin" variant="ghost" icon="i-heroicons-arrow-left" size="sm" />
          <div>
            <h1 class="text-2xl font-bold">Content Reports</h1>
            <p class="text-muted">Review reports submitted by users</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-6">
        <div class="flex gap-1">
          <UButton
            v-for="filter in statusFilters"
            :key="filter.value"
            :color="statusFilter === filter.value ? 'primary' : 'neutral'"
            :variant="statusFilter === filter.value ? 'solid' : 'outline'"
            size="sm"
            @click="statusFilter = filter.value as any"
          >
            {{ filter.label }}
            <UBadge
              v-if="statusCounts[filter.value]"
              :color="statusFilter === filter.value ? 'white' : 'neutral'"
              variant="solid"
              size="xs"
              class="ml-1"
            >
              {{ statusCounts[filter.value] }}
            </UBadge>
          </UButton>
        </div>
      </div>

      <!-- Error -->
      <UAlert v-if="error" color="error" icon="i-heroicons-exclamation-circle" :title="error" class="mb-6" />

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-24">
        <UIcon name="i-heroicons-arrow-path" class="size-8 text-primary animate-spin" />
      </div>

      <!-- Reports List -->
      <div v-else-if="filteredReports.length > 0" class="space-y-4">
        <UCard
          v-for="report in filteredReports"
          :key="report.id"
          class="hover:ring-2 hover:ring-primary/50 transition-all"
        >
          <div class="flex gap-4">
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-semibold">{{ report.models.name }}</h3>
                    <UBadge :color="getReasonColor(report.reason)" variant="subtle" size="xs">
                      {{ getReasonLabel(report.reason) }}
                    </UBadge>
                    <UBadge :color="getStatusColor(report.status)" variant="outline" size="xs">
                      {{ report.status }}
                    </UBadge>
                  </div>
                  <p v-if="report.details" class="text-sm text-muted line-clamp-2">
                    {{ report.details }}
                  </p>
                  <p v-else class="text-sm text-muted italic">No additional details provided</p>
                </div>
              </div>

              <!-- Meta -->
              <div class="flex flex-wrap items-center gap-4 text-sm text-muted">
                <div class="flex items-center gap-1">
                  <UIcon name="i-heroicons-user" class="size-4" />
                  <span>Reported by {{ report.profiles.display_name || report.profiles.username }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <UIcon name="i-heroicons-folder" class="size-4" />
                  {{ report.models.category }}
                </div>
                <div class="flex items-center gap-1">
                  <UIcon name="i-heroicons-clock" class="size-4" />
                  {{ formatDate(report.created_at) }}
                </div>
              </div>

              <!-- Resolution Notes -->
              <div
                v-if="report.resolution_notes && report.status !== 'pending'"
                class="mt-3 p-3 rounded-lg bg-elevated"
              >
                <p class="text-sm">
                  <span class="font-medium">Resolution:</span>
                  {{ report.resolution_notes }}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-2 shrink-0">
              <UButton
                :to="`/models/${report.models.category}/${report.models.slug}`"
                size="sm"
                variant="outline"
                icon="i-heroicons-eye"
              >
                View Model
              </UButton>
              <UButton
                v-if="report.status === 'pending'"
                size="sm"
                icon="i-heroicons-check"
                @click="openResolveModal(report)"
              >
                Resolve
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Empty State -->
      <UCard v-else class="text-center py-12">
        <UIcon name="i-heroicons-flag" class="size-16 text-muted mx-auto mb-4" />
        <h3 class="font-semibold mb-2">No reports</h3>
        <p class="text-muted">
          {{ statusFilter === 'pending' ? 'No pending reports to review.' : 'No reports match your filters.' }}
        </p>
      </UCard>
    </UContainer>

    <!-- Resolve Modal -->
    <UModal v-model:open="resolveModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="font-semibold">Resolve Report</h3>
          </template>

          <div class="space-y-4">
            <UFormField label="Resolution">
              <USelectMenu
                v-model="resolutionType"
                :items="[
                  { value: 'reviewed', label: 'Mark as Reviewed' },
                  { value: 'resolved', label: 'Resolved - Action Taken' },
                  { value: 'dismissed', label: 'Dismissed - No Action Needed' },
                ]"
                value-key="value"
              />
            </UFormField>

            <UFormField label="Notes (optional)">
              <UTextarea v-model="resolutionNotes" placeholder="Add any notes about the resolution..." :rows="3" />
            </UFormField>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton variant="ghost" color="neutral" @click="resolveModalOpen = false"> Cancel </UButton>
              <UButton :loading="processing" @click="handleResolve"> Resolve Report </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
