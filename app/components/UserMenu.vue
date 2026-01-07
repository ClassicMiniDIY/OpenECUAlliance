<script setup lang="ts">
const { isAuthenticated, currentUser, profile, signOut, isAdmin, isModerator } =
  useAuth();

const loading = ref(false);

const avatarUrl = computed(() => profile.value?.avatar_url);
const displayName = computed(
  () => profile.value?.display_name || profile.value?.username || "User",
);
const initials = computed(() => {
  const name = displayName.value;
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
});

const menuItems = computed(() => {
  const items: Array<
    Array<{
      label: string;
      icon?: string;
      to?: string;
      slot?: string;
      disabled?: boolean;
      onSelect?: () => void;
    }>
  > = [
    [
      {
        label: displayName.value,
        slot: "account",
        disabled: true,
      },
    ],
    [
      {
        label: "Profile",
        icon: "i-heroicons-user-circle",
        to: "/profile",
      },
      {
        label: "My Models",
        icon: "i-heroicons-cube",
        to: "/profile/models",
      },
      {
        label: "Liked Models",
        icon: "i-heroicons-heart",
        to: "/profile/likes",
      },
    ],
    [
      {
        label: "Settings",
        icon: "i-heroicons-cog-6-tooth",
        to: "/profile/settings",
      },
    ],
  ];

  // Add admin/moderator section if user has elevated privileges
  if (isModerator.value) {
    items.push([
      {
        label: "Moderation Queue",
        icon: "i-heroicons-shield-check",
        to: "/admin/queue",
      },
      ...(isAdmin.value
        ? [
            {
              label: "Admin Dashboard",
              icon: "i-heroicons-chart-bar-square",
              to: "/admin",
            },
          ]
        : []),
    ]);
  }

  // Sign out is always last
  items.push([
    {
      label: "Sign out",
      icon: "i-heroicons-arrow-right-on-rectangle",
      onSelect: handleSignOut,
    },
  ]);

  return items;
});

async function handleSignOut() {
  loading.value = true;
  try {
    await signOut();
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <!-- Sign In Button (not authenticated) -->
  <UButton
    v-if="!isAuthenticated"
    to="/login"
    color="primary"
    variant="soft"
    size="sm"
  >
    Sign in
  </UButton>

  <!-- User Dropdown (authenticated) -->
  <UDropdownMenu
    v-else
    :items="menuItems"
    :ui="{
      content: 'w-56',
      itemLeadingIcon: 'size-5 shrink-0',
      itemLabel: 'truncate',
    }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      class="p-1! flex items-center justify-center"
      :loading="loading"
    >
      <UAvatar v-if="avatarUrl" :src="avatarUrl" :alt="displayName" size="sm" />
      <div
        v-else
        class="size-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary"
      >
        {{ initials }}
      </div>
    </UButton>

    <template #account>
      <div class="flex items-center gap-3 px-2 py-1.5">
        <UAvatar
          v-if="avatarUrl"
          :src="avatarUrl"
          :alt="displayName"
          size="sm"
        />
        <div
          v-else
          class="size-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0"
        >
          {{ initials }}
        </div>
        <div class="min-w-0">
          <p class="font-medium truncate">{{ displayName }}</p>
          <p class="text-xs text-muted truncate">{{ currentUser?.email }}</p>
        </div>
      </div>
    </template>
  </UDropdownMenu>
</template>
