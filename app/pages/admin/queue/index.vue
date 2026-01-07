<script setup lang="ts">
  import type { QueueItem } from '~/composables/useModeration';

  definePageMeta({
    layout: 'default',
    middleware: 'admin',
  });

  useSeoMeta({
    title: 'Moderation Queue - OpenECU Alliance',
    description: 'Review and moderate pending model submissions.',
    robots: 'noindex, nofollow',
  });

  const route = useRoute();
  const { fetchQueue, assignToMe, unassign, loading, error } = useModeration();
  const { currentUser } = useAuth();
  const toast = useToast();

  const queue = ref<QueueItem[]>([]);

  const statusFilter = ref<'all' | 'pending' | 'in_progress' | 'resolved'>((route.query.status as any) || 'pending');
  const typeFilter = ref<'all' | 'new_submission' | 'update' | 'report' | 'appeal'>('all');
  const assignedFilter = ref<'all' | 'mine' | 'unassigned'>('all');

  const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
  ];

  const typeFilters = [
    { value: 'all', label: 'All Types' },
    { value: 'new_submission', label: 'New Submissions' },
    { value: 'update', label: 'Updates' },
    { value: 'report', label: 'Reports' },
    { value: 'appeal', label: 'Appeals' },
  ];

  const filteredQueue = computed(() => {
    return queue.value.filter((item) => {
      if (statusFilter.value !== 'all' && item.status !== statusFilter.value) return false;
      if (typeFilter.value !== 'all' && item.actionType !== typeFilter.value) return false;
      if (assignedFilter.value === 'mine' && item.assignedTo !== currentUser.value?.id) return false;
      if (assignedFilter.value === 'unassigned' && item.assignedTo !== null) return false;
      return true;
    });
  });

  const statusCounts = computed(() => {
    const counts: Record<string, number> = { all: queue.value.length };
    for (const item of queue.value) {
      counts[item.status] = (counts[item.status] || 0) + 1;
    }
    return counts;
  });

  function getActionTypeLabel(type: string): string {
    switch (type) {
      case 'new_submission':
        return 'New';
      case 'update':
        return 'Update';
      case 'report':
        return 'Report';
      case 'appeal':
        return 'Appeal';
      default:
        return type;
    }
  }

  function getActionTypeColor(type: string): string {
    switch (type) {
      case 'new_submission':
        return 'primary';
      case 'update':
        return 'info';
      case 'report':
        return 'error';
      case 'appeal':
        return 'warning';
      default:
        return 'neutral';
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'primary';
      case 'resolved':
        return 'success';
      default:
        return 'neutral';
    }
  }

  function getPriorityLabel(priority: number): string {
    if (priority >= 10) return 'High';
    if (priority >= 5) return 'Medium';
    return 'Normal';
  }

  function getPriorityColor(priority: number): string {
    if (priority >= 10) return 'error';
    if (priority >= 5) return 'warning';
    return 'neutral';
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

  async function handleAssign(item: QueueItem) {
    const success = await assignToMe(item.id);
    if (success) {
      toast.add({ title: 'Assigned to you', color: 'success' });
      await loadQueue();
    }
  }

  async function handleUnassign(item: QueueItem) {
    const success = await unassign(item.id);
    if (success) {
      toast.add({ title: 'Unassigned', color: 'success' });
      await loadQueue();
    }
  }

  async function loadQueue() {
    queue.value = await fetchQueue();
  }

  onMounted(() => {
    loadQueue();
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
            <h1 class="text-2xl font-bold">Moderation Queue</h1>
            <p class="text-muted">Review and approve model submissions</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-6">
        <!-- Status Filter -->
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

        <!-- Type Filter -->
        <USelectMenu v-model="typeFilter" :items="typeFilters" value-key="value" class="w-40" />

        <!-- Assignment Filter -->
        <USelectMenu
          v-model="assignedFilter"
          :items="[
            { value: 'all', label: 'All Assignments' },
            { value: 'mine', label: 'Assigned to Me' },
            { value: 'unassigned', label: 'Unassigned' },
          ]"
          value-key="value"
          class="w-44"
        />
      </div>

      <!-- Error -->
      <UAlert v-if="error" color="error" icon="i-heroicons-exclamation-circle" :title="error" class="mb-6" />

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-24">
        <UIcon name="i-heroicons-arrow-path" class="size-8 text-primary animate-spin" />
      </div>

      <!-- Queue List -->
      <div v-else-if="filteredQueue.length > 0" class="space-y-4">
        <UCard v-for="item in filteredQueue" :key="item.id" class="hover:ring-2 hover:ring-primary/50 transition-all">
          <div class="flex gap-4">
            <!-- Image -->
            <div class="size-20 rounded-lg bg-elevated shrink-0 overflow-hidden">
              <img
                v-if="item.model.primaryImage"
                :src="item.model.primaryImage"
                :alt="item.model.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <UIcon name="i-heroicons-cube" class="size-8 text-muted" />
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-semibold">{{ item.model.name }}</h3>
                    <UBadge :color="getActionTypeColor(item.actionType)" variant="subtle" size="xs">
                      {{ getActionTypeLabel(item.actionType) }}
                    </UBadge>
                    <UBadge :color="getStatusColor(item.status)" variant="outline" size="xs">
                      {{ item.status }}
                    </UBadge>
                    <UBadge
                      v-if="item.priority > 0"
                      :color="getPriorityColor(item.priority)"
                      variant="subtle"
                      size="xs"
                    >
                      {{ getPriorityLabel(item.priority) }}
                    </UBadge>
                  </div>
                  <p class="text-sm text-muted line-clamp-1">
                    {{ item.model.description }}
                  </p>
                </div>
              </div>

              <!-- Meta -->
              <div class="flex flex-wrap items-center gap-4 text-sm text-muted">
                <div class="flex items-center gap-1">
                  <UAvatar
                    v-if="item.model.author.avatarUrl"
                    :src="item.model.author.avatarUrl"
                    :alt="item.model.author.username"
                    size="2xs"
                  />
                  <span>{{ item.model.author.displayName || item.model.author.username }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <UIcon name="i-heroicons-folder" class="size-4" />
                  {{ item.model.category }}
                </div>
                <div class="flex items-center gap-1">
                  <UIcon name="i-heroicons-clock" class="size-4" />
                  {{ formatDate(item.createdAt) }}
                </div>
                <div v-if="item.assignedTo" class="flex items-center gap-1">
                  <UIcon name="i-heroicons-user" class="size-4" />
                  {{ item.assignedTo === currentUser?.id ? 'Assigned to you' : 'Assigned' }}
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-2 shrink-0">
              <UButton :to="`/admin/queue/${item.id}`" size="sm" icon="i-heroicons-eye"> Review </UButton>
              <UButton
                v-if="!item.assignedTo"
                variant="outline"
                size="sm"
                icon="i-heroicons-hand-raised"
                @click="handleAssign(item)"
              >
                Claim
              </UButton>
              <UButton
                v-else-if="item.assignedTo === currentUser?.id"
                variant="ghost"
                size="sm"
                color="neutral"
                @click="handleUnassign(item)"
              >
                Unclaim
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Empty State -->
      <UCard v-else class="text-center py-12">
        <UIcon name="i-heroicons-check-circle" class="size-16 text-success mx-auto mb-4" />
        <h3 class="font-semibold mb-2">Queue is empty</h3>
        <p class="text-muted">
          {{ statusFilter === 'pending' ? 'No pending items to review.' : 'No items match your filters.' }}
        </p>
      </UCard>
    </UContainer>
  </div>
</template>
