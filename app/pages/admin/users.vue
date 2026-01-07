<script setup lang="ts">
  definePageMeta({
    layout: 'default',
    middleware: 'admin',
  });

  useSeoMeta({
    title: 'User Management - OpenECU Alliance',
    description: 'Manage user accounts, roles, and permissions.',
    robots: 'noindex, nofollow',
  });

  const supabase = useSupabaseClient();
  const { isAdmin } = useAuth();
  const toast = useToast();

  interface User {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    role: 'user' | 'moderator' | 'admin';
    models_count: number;
    likes_received: number;
    is_banned: boolean;
    created_at: string;
  }

  const users = ref<User[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const search = ref('');
  const roleFilter = ref<'all' | 'user' | 'moderator' | 'admin'>('all');
  const processing = ref(false);

  const filteredUsers = computed(() => {
    let filtered = users.value;

    if (roleFilter.value !== 'all') {
      filtered = filtered.filter((u) => u.role === roleFilter.value);
    }

    if (search.value) {
      const searchLower = search.value.toLowerCase();
      filtered = filtered.filter(
        (u) => u.username.toLowerCase().includes(searchLower) || u.display_name?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  });

  const roleCounts = computed(() => {
    const counts: Record<string, number> = { all: users.value.length };
    for (const user of users.value) {
      counts[user.role] = (counts[user.role] || 0) + 1;
    }
    return counts;
  });

  function getRoleColor(role: string): string {
    switch (role) {
      case 'admin':
        return 'error';
      case 'moderator':
        return 'warning';
      default:
        return 'neutral';
    }
  }

  function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  async function updateUserRole(user: User, newRole: 'user' | 'moderator' | 'admin') {
    if (!isAdmin.value) {
      toast.add({ title: 'Only admins can change roles', color: 'error' });
      return;
    }

    processing.value = true;
    try {
      const { error: updateError } = await supabase.from('profiles').update({ role: newRole }).eq('id', user.id);

      if (updateError) throw updateError;

      user.role = newRole;
      toast.add({ title: `Role updated to ${newRole}`, color: 'success' });
    } catch (err) {
      toast.add({
        title: err instanceof Error ? err.message : 'Failed to update role',
        color: 'error',
      });
    } finally {
      processing.value = false;
    }
  }

  async function toggleBan(user: User) {
    if (!isAdmin.value) {
      toast.add({ title: 'Only admins can ban/unban users', color: 'error' });
      return;
    }

    processing.value = true;
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_banned: !user.is_banned })
        .eq('id', user.id);

      if (updateError) throw updateError;

      user.is_banned = !user.is_banned;
      toast.add({
        title: user.is_banned ? 'User banned' : 'User unbanned',
        color: 'success',
      });
    } catch (err) {
      toast.add({
        title: err instanceof Error ? err.message : 'Failed to update ban status',
        color: 'error',
      });
    } finally {
      processing.value = false;
    }
  }

  async function loadUsers() {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select(
          `
        id,
        username,
        display_name,
        avatar_url,
        role,
        models_count,
        likes_received,
        is_banned,
        created_at
      `
        )
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      users.value = data || [];
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load users';
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    loadUsers();
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
            <h1 class="text-2xl font-bold">User Management</h1>
            <p class="text-muted">Manage user roles and permissions</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-6">
        <!-- Search -->
        <UInput v-model="search" placeholder="Search users..." icon="i-heroicons-magnifying-glass" class="w-64" />

        <!-- Role Filter -->
        <div class="flex gap-1">
          <UButton
            v-for="filter in [
              { value: 'all', label: 'All' },
              { value: 'user', label: 'Users' },
              { value: 'moderator', label: 'Moderators' },
              { value: 'admin', label: 'Admins' },
            ]"
            :key="filter.value"
            :color="roleFilter === filter.value ? 'primary' : 'neutral'"
            :variant="roleFilter === filter.value ? 'solid' : 'outline'"
            size="sm"
            @click="roleFilter = filter.value as any"
          >
            {{ filter.label }}
            <UBadge
              v-if="roleCounts[filter.value]"
              :color="roleFilter === filter.value ? 'white' : 'neutral'"
              variant="solid"
              size="xs"
              class="ml-1"
            >
              {{ roleCounts[filter.value] }}
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

      <!-- Users Table -->
      <UCard v-else-if="filteredUsers.length > 0">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-default">
                <th class="text-left py-3 px-4 font-semibold">User</th>
                <th class="text-left py-3 px-4 font-semibold">Role</th>
                <th class="text-left py-3 px-4 font-semibold">Stats</th>
                <th class="text-left py-3 px-4 font-semibold">Joined</th>
                <th class="text-left py-3 px-4 font-semibold">Status</th>
                <th class="text-right py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in filteredUsers"
                :key="user.id"
                class="border-b border-default last:border-0 hover:bg-elevated/50"
              >
                <!-- User -->
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <UAvatar v-if="user.avatar_url" :src="user.avatar_url" :alt="user.username" size="sm" />
                    <div
                      v-else
                      class="size-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary"
                    >
                      {{ (user.display_name || user.username).substring(0, 2).toUpperCase() }}
                    </div>
                    <div>
                      <NuxtLink :to="`/users/${user.username}`" class="font-medium hover:text-primary">
                        {{ user.display_name || user.username }}
                      </NuxtLink>
                      <p class="text-xs text-muted">@{{ user.username }}</p>
                    </div>
                  </div>
                </td>

                <!-- Role -->
                <td class="py-3 px-4">
                  <UBadge :color="getRoleColor(user.role)" variant="subtle" size="sm">
                    {{ user.role }}
                  </UBadge>
                </td>

                <!-- Stats -->
                <td class="py-3 px-4">
                  <div class="flex items-center gap-4 text-sm text-muted">
                    <div class="flex items-center gap-1">
                      <UIcon name="i-heroicons-cube" class="size-4" />
                      {{ user.models_count }}
                    </div>
                    <div class="flex items-center gap-1">
                      <UIcon name="i-heroicons-heart" class="size-4" />
                      {{ user.likes_received }}
                    </div>
                  </div>
                </td>

                <!-- Joined -->
                <td class="py-3 px-4 text-sm text-muted">
                  {{ formatDate(user.created_at) }}
                </td>

                <!-- Status -->
                <td class="py-3 px-4">
                  <UBadge v-if="user.is_banned" color="error" variant="subtle" size="sm"> Banned </UBadge>
                  <UBadge v-else color="success" variant="subtle" size="sm"> Active </UBadge>
                </td>

                <!-- Actions -->
                <td class="py-3 px-4">
                  <div class="flex justify-end gap-2">
                    <UDropdownMenu
                      v-if="isAdmin"
                      :items="[
                        [
                          {
                            label: 'Set as User',
                            icon: 'i-heroicons-user',
                            disabled: user.role === 'user',
                            onSelect: () => updateUserRole(user, 'user'),
                          },
                          {
                            label: 'Set as Moderator',
                            icon: 'i-heroicons-shield-check',
                            disabled: user.role === 'moderator',
                            onSelect: () => updateUserRole(user, 'moderator'),
                          },
                          {
                            label: 'Set as Admin',
                            icon: 'i-heroicons-star',
                            disabled: user.role === 'admin',
                            onSelect: () => updateUserRole(user, 'admin'),
                          },
                        ],
                        [
                          {
                            label: user.is_banned ? 'Unban User' : 'Ban User',
                            icon: user.is_banned ? 'i-heroicons-check-circle' : 'i-heroicons-no-symbol',
                            color: user.is_banned ? 'success' : 'error',
                            onSelect: () => toggleBan(user),
                          },
                        ],
                      ]"
                    >
                      <UButton variant="ghost" size="sm" icon="i-heroicons-ellipsis-vertical" :loading="processing" />
                    </UDropdownMenu>
                    <UButton v-else :to="`/users/${user.username}`" variant="ghost" size="sm" icon="i-heroicons-eye" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>

      <!-- Empty State -->
      <UCard v-else class="text-center py-12">
        <UIcon name="i-heroicons-users" class="size-16 text-muted mx-auto mb-4" />
        <h3 class="font-semibold mb-2">No users found</h3>
        <p class="text-muted">
          {{ search ? 'No users match your search.' : 'No users registered yet.' }}
        </p>
      </UCard>
    </UContainer>
  </div>
</template>
