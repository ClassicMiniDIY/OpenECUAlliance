<script setup lang="ts">
  definePageMeta({
    layout: 'default',
    middleware: 'auth',
  });

  useSeoMeta({
    title: 'Settings - OpenECU Alliance',
    description: 'Manage your OpenECU Alliance account settings and preferences.',
    robots: 'noindex, nofollow',
  });

  const { profile, updateProfile, currentUser, signOut } = useAuth();
  const supabase = useSupabaseClient();
  const toast = useToast();

  const saving = ref(false);
  const showDeleteModal = ref(false);
  const deleteConfirmation = ref('');
  const deleting = ref(false);

  // Notification settings
  const emailNotifications = ref(true);

  watch(
    profile,
    (p) => {
      if (p) {
        emailNotifications.value = p.email_notifications;
      }
    },
    { immediate: true }
  );

  async function saveNotificationSettings() {
    saving.value = true;
    try {
      await updateProfile({ emailNotifications: emailNotifications.value });
      toast.add({
        title: 'Settings saved',
        color: 'success',
      });
    } catch (err) {
      toast.add({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save settings',
        color: 'error',
      });
    } finally {
      saving.value = false;
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmation.value !== profile.value?.username) return;

    deleting.value = true;
    try {
      // Get user ID directly from Supabase auth
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        throw new Error('Not authenticated');
      }

      // Delete profile (cascades to related data via foreign keys)
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', authUser.id);

      if (profileError) throw profileError;

      // Sign out and redirect
      await signOut();
      toast.add({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted.',
        color: 'success',
      });
    } catch (err) {
      toast.add({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete account',
        color: 'error',
      });
    } finally {
      deleting.value = false;
      showDeleteModal.value = false;
    }
  }
</script>

<template>
  <div>
    <UContainer class="py-12 max-w-2xl">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <UButton to="/profile" variant="ghost" icon="i-heroicons-arrow-left" size="sm" />
        <h1 class="text-2xl font-bold">Settings</h1>
      </div>

      <!-- Account Info -->
      <UCard class="mb-6">
        <template #header>
          <h2 class="font-semibold">Account</h2>
        </template>

        <div class="space-y-4">
          <div>
            <p class="text-sm text-muted">Email</p>
            <p class="font-medium">{{ currentUser?.email }}</p>
          </div>
          <div>
            <p class="text-sm text-muted">Member since</p>
            <p class="font-medium">
              {{ profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-' }}
            </p>
          </div>
        </div>
      </UCard>

      <!-- Notification Settings -->
      <UCard class="mb-6">
        <template #header>
          <h2 class="font-semibold">Notifications</h2>
        </template>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <p class="font-medium">Email notifications</p>
              <p class="text-sm text-muted">Receive emails about comments, likes, and updates to your models.</p>
            </div>
            <div class="shrink-0 ml-3">
              <USwitch v-model="emailNotifications" />
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton
              :loading="saving"
              :disabled="emailNotifications === profile?.email_notifications"
              @click="saveNotificationSettings"
            >
              Save
            </UButton>
          </div>
        </template>
      </UCard>

      <!-- Danger Zone -->
      <UCard>
        <template #header>
          <h2 class="font-semibold text-error">Danger Zone</h2>
        </template>

        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium">Delete account</p>
            <p class="text-sm text-muted">Permanently delete your account and all associated data.</p>
          </div>
          <UButton color="error" variant="outline" @click="showDeleteModal = true"> Delete Account </UButton>
        </div>
      </UCard>

      <!-- Delete Confirmation Modal -->
      <UModal v-model:open="showDeleteModal">
        <template #content>
          <UCard>
            <template #header>
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-full bg-error/10 flex items-center justify-center">
                  <UIcon name="i-heroicons-exclamation-triangle" class="size-5 text-error" />
                </div>
                <h3 class="font-semibold">Delete Account</h3>
              </div>
            </template>

            <div class="space-y-4">
              <p class="text-muted">
                This action cannot be undone. This will permanently delete your account, all your models, comments, and
                other associated data.
              </p>

              <UFormField :label="`Type '${profile?.username}' to confirm`">
                <UInput v-model="deleteConfirmation" :placeholder="profile?.username" />
              </UFormField>
            </div>

            <template #footer>
              <div class="flex justify-end gap-2">
                <UButton variant="ghost" @click="showDeleteModal = false"> Cancel </UButton>
                <UButton
                  color="error"
                  :loading="deleting"
                  :disabled="deleteConfirmation !== profile?.username"
                  @click="handleDeleteAccount"
                >
                  Delete Account
                </UButton>
              </div>
            </template>
          </UCard>
        </template>
      </UModal>
    </UContainer>
  </div>
</template>
