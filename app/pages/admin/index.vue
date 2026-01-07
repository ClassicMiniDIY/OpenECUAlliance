<script setup lang="ts">
import type { QueueItem, ModerationStats } from "~/composables/useModeration";

definePageMeta({
  layout: "default",
  middleware: "admin",
});

useSeoMeta({
  title: "Admin Dashboard - OpenECU Alliance",
  description:
    "OpenECU Alliance admin dashboard for managing content, users, and moderation queue.",
  robots: "noindex, nofollow",
});

const { fetchQueue, fetchStats, loading } = useModeration();

const stats = ref<ModerationStats>({
  pending: 0,
  inProgress: 0,
  resolvedToday: 0,
  totalModels: 0,
  totalUsers: 0,
  pendingReports: 0,
});

const recentQueue = ref<QueueItem[]>([]);

const statCards = computed(() => [
  {
    label: "Pending Review",
    value: stats.value.pending,
    icon: "i-heroicons-clock",
    color: "warning",
    to: "/admin/queue?status=pending",
  },
  {
    label: "In Progress",
    value: stats.value.inProgress,
    icon: "i-heroicons-play",
    color: "primary",
    to: "/admin/queue?status=in_progress",
  },
  {
    label: "Resolved Today",
    value: stats.value.resolvedToday,
    icon: "i-heroicons-check-circle",
    color: "success",
  },
  {
    label: "Pending Reports",
    value: stats.value.pendingReports,
    icon: "i-heroicons-flag",
    color: "error",
    to: "/admin/reports",
  },
]);

const overviewCards = computed(() => [
  {
    label: "Total Models",
    value: stats.value.totalModels,
    icon: "i-heroicons-cube",
  },
  {
    label: "Total Users",
    value: stats.value.totalUsers,
    icon: "i-heroicons-users",
  },
]);

function getActionTypeLabel(type: string): string {
  switch (type) {
    case "new_submission":
      return "New Submission";
    case "update":
      return "Update";
    case "report":
      return "Report";
    case "appeal":
      return "Appeal";
    default:
      return type;
  }
}

function getActionTypeColor(type: string): string {
  switch (type) {
    case "new_submission":
      return "primary";
    case "update":
      return "info";
    case "report":
      return "error";
    case "appeal":
      return "warning";
    default:
      return "neutral";
  }
}

async function loadData() {
  const [statsData, queueData] = await Promise.all([
    fetchStats(),
    fetchQueue({ status: "pending", limit: 5 }),
  ]);
  stats.value = statsData;
  recentQueue.value = queueData;
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div>
    <UContainer class="py-12">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p class="text-muted">
          Overview of moderation activity and site statistics
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-24">
        <UIcon
          name="i-heroicons-arrow-path"
          class="size-8 text-primary animate-spin"
        />
      </div>

      <template v-else>
        <!-- Moderation Stats -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <UCard
            v-for="stat in statCards"
            :key="stat.label"
            :to="stat.to"
            :class="
              stat.to
                ? 'hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer'
                : ''
            "
          >
            <div class="flex items-center gap-4">
              <div
                :class="`size-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center`"
              >
                <UIcon :name="stat.icon" :class="`size-6 text-${stat.color}`" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ stat.value }}</p>
                <p class="text-sm text-muted">{{ stat.label }}</p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Quick Actions -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <UButton
            to="/admin/queue"
            block
            size="lg"
            variant="outline"
            icon="i-heroicons-queue-list"
          >
            Moderation Queue
          </UButton>
          <UButton
            to="/admin/reports"
            block
            size="lg"
            variant="outline"
            icon="i-heroicons-flag"
          >
            Reports
          </UButton>
          <UButton
            to="/admin/users"
            block
            size="lg"
            variant="outline"
            icon="i-heroicons-users"
          >
            User Management
          </UButton>
          <UButton
            to="/models"
            block
            size="lg"
            variant="outline"
            icon="i-heroicons-cube"
          >
            Browse Models
          </UButton>
        </div>

        <div class="grid lg:grid-cols-2 gap-6">
          <!-- Recent Queue Items -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="font-semibold">Recent Submissions</h2>
                <UButton to="/admin/queue" variant="ghost" size="sm">
                  View All
                </UButton>
              </div>
            </template>

            <div v-if="recentQueue.length > 0" class="space-y-4">
              <div
                v-for="item in recentQueue"
                :key="item.id"
                class="flex items-center gap-4"
              >
                <!-- Image -->
                <div
                  class="size-12 rounded-lg bg-elevated shrink-0 overflow-hidden"
                >
                  <img
                    v-if="item.model.primaryImage"
                    :src="item.model.primaryImage"
                    :alt="item.model.name"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center"
                  >
                    <UIcon name="i-heroicons-cube" class="size-5 text-muted" />
                  </div>
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <p class="font-medium truncate">{{ item.model.name }}</p>
                  <div class="flex items-center gap-2 text-sm text-muted">
                    <span
                      >by
                      {{
                        item.model.author.displayName ||
                        item.model.author.username
                      }}</span
                    >
                    <UBadge
                      :color="getActionTypeColor(item.actionType)"
                      variant="subtle"
                      size="xs"
                    >
                      {{ getActionTypeLabel(item.actionType) }}
                    </UBadge>
                  </div>
                </div>

                <!-- Action -->
                <UButton
                  :to="`/admin/queue/${item.id}`"
                  variant="ghost"
                  size="sm"
                  icon="i-heroicons-arrow-right"
                />
              </div>
            </div>

            <div v-else class="text-center py-8 text-muted">
              <UIcon
                name="i-heroicons-check-circle"
                class="size-8 mx-auto mb-2"
              />
              <p>No pending submissions</p>
            </div>
          </UCard>

          <!-- Site Overview -->
          <UCard>
            <template #header>
              <h2 class="font-semibold">Site Overview</h2>
            </template>

            <div class="space-y-4">
              <div
                v-for="stat in overviewCards"
                :key="stat.label"
                class="flex items-center justify-between p-4 rounded-lg bg-elevated"
              >
                <div class="flex items-center gap-3">
                  <UIcon :name="stat.icon" class="size-5 text-muted" />
                  <span>{{ stat.label }}</span>
                </div>
                <span class="font-bold">{{ stat.value }}</span>
              </div>
            </div>
          </UCard>
        </div>
      </template>
    </UContainer>
  </div>
</template>
