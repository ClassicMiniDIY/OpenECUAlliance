<script setup lang="ts">
import type { PublicProfile } from "~/types/user";

const route = useRoute();
const username = computed(() => route.params.username as string);

const {
  data: userProfile,
  status,
  error,
} = await useFetch<PublicProfile>(() => `/api/users/${username.value}`, {
  key: `user-${username.value}`,
});

useSeoMeta({
  title: () =>
    userProfile.value
      ? `${userProfile.value.displayName || userProfile.value.username} - OpenECU Alliance`
      : "User Profile - OpenECU Alliance",
  description: () =>
    userProfile.value?.bio ||
    `View ${username.value}'s profile on OpenECU Alliance`,
});

const stats = computed(() => {
  if (!userProfile.value) return [];
  return [
    {
      label: "Models",
      value: userProfile.value.modelsCount,
      icon: "i-heroicons-cube",
    },
    {
      label: "Likes Received",
      value: userProfile.value.likesReceived,
      icon: "i-heroicons-heart",
    },
  ];
});

const memberSince = computed(() => {
  if (!userProfile.value?.createdAt) return "";
  return new Date(userProfile.value.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
});

const roleBadge = computed(() => {
  if (!userProfile.value) return null;
  if (userProfile.value.role === "admin") {
    return { label: "Admin", color: "error" as const };
  }
  if (userProfile.value.role === "moderator") {
    return { label: "Moderator", color: "warning" as const };
  }
  return null;
});
</script>

<template>
  <div>
    <UContainer class="py-12">
      <!-- Loading -->
      <div v-if="status === 'pending'" class="flex justify-center py-24">
        <UIcon
          name="i-heroicons-arrow-path"
          class="size-8 text-primary animate-spin"
        />
      </div>

      <!-- Error -->
      <UCard v-else-if="error" class="text-center py-12">
        <UIcon
          name="i-heroicons-user-circle"
          class="size-16 text-muted mx-auto mb-4"
        />
        <h1 class="text-xl font-bold mb-2">User Not Found</h1>
        <p class="text-muted mb-4">
          The user @{{ username }} doesn't exist or their profile is not public.
        </p>
        <UButton to="/"> Back to Home </UButton>
      </UCard>

      <!-- Profile -->
      <template v-else-if="userProfile">
        <!-- Profile Header -->
        <div class="flex flex-col md:flex-row gap-6 mb-8">
          <!-- Avatar -->
          <div class="shrink-0">
            <UAvatar
              v-if="userProfile.avatarUrl"
              :src="userProfile.avatarUrl"
              :alt="userProfile.displayName || userProfile.username"
              size="3xl"
            />
            <div
              v-else
              class="size-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary"
            >
              {{
                (userProfile.displayName || userProfile.username)
                  .substring(0, 2)
                  .toUpperCase()
              }}
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h1 class="text-2xl font-bold">
                {{ userProfile.displayName || userProfile.username }}
              </h1>
              <UBadge
                v-if="roleBadge"
                :color="roleBadge.color"
                variant="subtle"
                size="sm"
              >
                {{ roleBadge.label }}
              </UBadge>
            </div>
            <p class="text-muted mb-4">@{{ userProfile.username }}</p>

            <p v-if="userProfile.bio" class="mb-4">
              {{ userProfile.bio }}
            </p>

            <div class="flex flex-wrap gap-4 text-sm text-muted">
              <div v-if="userProfile.location" class="flex items-center gap-1">
                <UIcon name="i-heroicons-map-pin" class="size-4" />
                {{ userProfile.location }}
              </div>
              <div v-if="userProfile.website" class="flex items-center gap-1">
                <UIcon name="i-heroicons-link" class="size-4" />
                <a
                  :href="userProfile.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary hover:underline"
                >
                  {{ userProfile.website.replace(/^https?:\/\//, "") }}
                </a>
              </div>
              <div
                v-if="userProfile.githubUsername"
                class="flex items-center gap-1"
              >
                <UIcon name="i-simple-icons-github" class="size-4" />
                <a
                  :href="`https://github.com/${userProfile.githubUsername}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary hover:underline"
                >
                  {{ userProfile.githubUsername }}
                </a>
              </div>
              <div class="flex items-center gap-1">
                <UIcon name="i-heroicons-calendar" class="size-4" />
                Member since {{ memberSince }}
              </div>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-4 mb-8">
          <UCard v-for="stat in stats" :key="stat.label">
            <div class="flex items-center gap-4">
              <div
                class="size-12 rounded-xl bg-primary/10 flex items-center justify-center"
              >
                <UIcon :name="stat.icon" class="size-6 text-primary" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ stat.value }}</p>
                <p class="text-sm text-muted">{{ stat.label }}</p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Models Section (placeholder for now) -->
        <UCard>
          <template #header>
            <h2 class="font-semibold">
              Models by {{ userProfile.displayName || userProfile.username }}
            </h2>
          </template>

          <div v-if="userProfile.modelsCount === 0" class="text-center py-8">
            <UIcon
              name="i-heroicons-cube"
              class="size-12 text-muted mx-auto mb-4"
            />
            <p class="text-muted">No models published yet.</p>
          </div>

          <div v-else class="text-center py-8 text-muted">
            Models list coming soon...
          </div>
        </UCard>
      </template>
    </UContainer>
  </div>
</template>
