<script setup lang="ts">
  definePageMeta({
    layout: 'default',
    middleware: 'auth',
  });

  useSeoMeta({
    title: 'Profile - OpenECU Alliance',
    description: 'View your OpenECU Alliance profile, uploaded models, and community stats.',
    robots: 'noindex, nofollow',
  });

  const { currentUser, profile, profileLoading, isAdmin, isModerator } = useAuth();

  const roleBadge = computed(() => {
    if (isAdmin.value) {
      return { label: 'Admin', color: 'error' as const };
    }
    if (isModerator.value) {
      return { label: 'Moderator', color: 'warning' as const };
    }
    return null;
  });

  const stats = computed(() => [
    {
      label: 'Models',
      value: profile.value?.models_count ?? 0,
      icon: 'i-heroicons-cube',
      to: '/profile/models',
    },
    {
      label: 'Likes Received',
      value: profile.value?.likes_received ?? 0,
      icon: 'i-heroicons-heart',
    },
  ]);
</script>

<template>
  <div>
    <UContainer class="py-12">
      <!-- Loading -->
      <div v-if="profileLoading" class="flex justify-center py-24">
        <UIcon name="i-heroicons-arrow-path" class="size-8 text-primary animate-spin" />
      </div>

      <template v-else-if="profile">
        <!-- Profile Header -->
        <div class="flex flex-col md:flex-row gap-6 mb-8">
          <!-- Avatar -->
          <div class="shrink-0">
            <UAvatar
              v-if="profile.avatar_url"
              :src="profile.avatar_url"
              :alt="profile.display_name || profile.username"
              size="3xl"
            />
            <div
              v-else
              class="size-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary"
            >
              {{ (profile.display_name || profile.username).substring(0, 2).toUpperCase() }}
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1">
            <div class="flex items-start justify-between mb-2">
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-2xl font-bold">
                    {{ profile.display_name || profile.username }}
                  </h1>
                  <UBadge v-if="roleBadge" :color="roleBadge.color" variant="subtle" size="sm">
                    {{ roleBadge.label }}
                  </UBadge>
                </div>
                <p class="text-muted">@{{ profile.username }}</p>
              </div>
              <UButton to="/profile/edit" variant="outline" size="sm"> Edit Profile </UButton>
            </div>

            <p v-if="profile.bio" class="text-muted mb-4">
              {{ profile.bio }}
            </p>

            <div class="flex flex-wrap items-center gap-4 text-sm text-muted">
              <div v-if="profile.location" class="flex items-center gap-1.5">
                <UIcon name="i-heroicons-map-pin" class="size-4 shrink-0" />
                <span>{{ profile.location }}</span>
              </div>
              <div v-if="profile.website" class="flex items-center gap-1.5">
                <UIcon name="i-heroicons-link" class="size-4 shrink-0" />
                <a
                  :href="profile.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary hover:underline"
                >
                  {{ profile.website.replace(/^https?:\/\//, '') }}
                </a>
              </div>
              <div v-if="profile.github_username" class="flex items-center gap-1.5">
                <UIcon name="i-simple-icons-github" class="size-4 shrink-0" />
                <a
                  :href="`https://github.com/${profile.github_username}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary hover:underline"
                >
                  {{ profile.github_username }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-4 mb-8">
          <UCard
            v-for="stat in stats"
            :key="stat.label"
            :to="stat.to"
            :class="stat.to ? 'hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer' : ''"
          >
            <div class="flex items-center gap-4">
              <div class="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <UIcon :name="stat.icon" class="size-6 text-primary" />
              </div>
              <div>
                <p class="text-2xl font-bold">{{ stat.value }}</p>
                <p class="text-sm text-muted">{{ stat.label }}</p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Quick Actions -->
        <UCard>
          <h2 class="font-semibold mb-4">Quick Actions</h2>
          <div class="flex flex-wrap gap-2">
            <UButton to="/models/upload" icon="i-heroicons-plus"> Upload Model </UButton>
            <UButton to="/profile/models" variant="outline" icon="i-heroicons-cube"> My Models </UButton>
            <UButton to="/profile/likes" variant="outline" icon="i-heroicons-heart"> Liked Models </UButton>
            <UButton to="/profile/settings" variant="outline" icon="i-heroicons-cog-6-tooth"> Settings </UButton>
            <UButton v-if="isModerator" to="/admin/queue" variant="outline" icon="i-heroicons-shield-check">
              Moderation Queue
            </UButton>
          </div>
        </UCard>
      </template>

      <!-- No Profile -->
      <UCard v-else class="text-center py-12">
        <UIcon name="i-heroicons-exclamation-circle" class="size-12 text-warning mx-auto mb-4" />
        <h2 class="font-semibold mb-2">Profile Not Found</h2>
        <p class="text-muted mb-4">It looks like your profile hasn't been set up yet.</p>
        <UButton to="/profile/setup"> Complete Profile Setup </UButton>
      </UCard>
    </UContainer>
  </div>
</template>
