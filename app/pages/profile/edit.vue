<script setup lang="ts">
  import type { ProfileUpdateData } from '~/types/user';

  definePageMeta({
    layout: 'default',
    middleware: 'auth',
  });

  useSeoMeta({
    title: 'Edit Profile - OpenECU Alliance',
    description: 'Update your OpenECU Alliance profile information.',
    robots: 'noindex, nofollow',
  });

  const { profile, updateProfile, checkUsernameAvailable, uploadAvatar } = useAuth();
  const toast = useToast();

  const loading = ref(false);
  const avatarLoading = ref(false);
  const usernameChecking = ref(false);
  const usernameAvailable = ref<boolean | null>(null);
  const usernameError = ref<string | null>(null);

  // Form state
  const form = reactive({
    username: '',
    displayName: '',
    bio: '',
    website: '',
    location: '',
    githubUsername: '',
  });

  // Initialize form from profile
  watch(
    profile,
    (p) => {
      if (p) {
        form.username = p.username;
        form.displayName = p.display_name ?? '';
        form.bio = p.bio ?? '';
        form.website = p.website ?? '';
        form.location = p.location ?? '';
        form.githubUsername = p.github_username ?? '';
      }
    },
    { immediate: true }
  );

  // Debounced username check
  let checkTimeout: NodeJS.Timeout;
  watch(
    () => form.username,
    (value) => {
      usernameAvailable.value = null;
      usernameError.value = null;

      if (checkTimeout) clearTimeout(checkTimeout);

      // Skip check if unchanged from current
      if (value === profile.value?.username) {
        usernameAvailable.value = true;
        return;
      }

      if (!value || value.length < 3) return;

      // Validate format
      if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
        usernameError.value = 'Only letters, numbers, underscores, and hyphens allowed';
        return;
      }

      usernameChecking.value = true;
      checkTimeout = setTimeout(async () => {
        try {
          usernameAvailable.value = await checkUsernameAvailable(value);
          if (!usernameAvailable.value) {
            usernameError.value = 'This username is already taken';
          }
        } catch {
          usernameError.value = 'Failed to check availability';
        } finally {
          usernameChecking.value = false;
        }
      }, 500);
    }
  );

  const canSubmit = computed(() => {
    const usernameValid = form.username === profile.value?.username || usernameAvailable.value === true;
    return form.username.length >= 3 && usernameValid && !loading.value && !usernameChecking.value;
  });

  async function handleSubmit() {
    if (!canSubmit.value) return;

    loading.value = true;

    try {
      const data: ProfileUpdateData = {};

      // Only include changed fields
      if (form.username !== profile.value?.username) data.username = form.username;
      if (form.displayName !== (profile.value?.display_name ?? '')) data.displayName = form.displayName || undefined;
      if (form.bio !== (profile.value?.bio ?? '')) data.bio = form.bio || undefined;
      if (form.website !== (profile.value?.website ?? '')) data.website = form.website || undefined;
      if (form.location !== (profile.value?.location ?? '')) data.location = form.location || undefined;
      if (form.githubUsername !== (profile.value?.github_username ?? ''))
        data.githubUsername = form.githubUsername || undefined;

      await updateProfile(data);
      toast.add({
        title: 'Profile updated',
        description: 'Your changes have been saved.',
        color: 'success',
      });
      await navigateTo('/profile');
    } catch (err) {
      toast.add({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update profile',
        color: 'error',
      });
    } finally {
      loading.value = false;
    }
  }

  async function handleAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.add({
        title: 'Invalid file',
        description: 'Please select an image file.',
        color: 'error',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.add({
        title: 'File too large',
        description: 'Please select an image under 2MB.',
        color: 'error',
      });
      return;
    }

    avatarLoading.value = true;

    try {
      await uploadAvatar(file);
      toast.add({
        title: 'Avatar updated',
        description: 'Your profile picture has been changed.',
        color: 'success',
      });
    } catch (err) {
      toast.add({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to upload avatar',
        color: 'error',
      });
    } finally {
      avatarLoading.value = false;
      input.value = '';
    }
  }

  const avatarInitials = computed(() => {
    const name = form.displayName || form.username;
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  });
</script>

<template>
  <div>
    <UContainer class="py-12 max-w-2xl">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <UButton to="/profile" variant="ghost" icon="i-heroicons-arrow-left" size="sm" />
        <h1 class="text-2xl font-bold">Edit Profile</h1>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Avatar Section -->
        <UCard class="mb-6">
          <div class="flex items-center gap-6">
            <div class="relative">
              <UAvatar
                v-if="profile?.avatar_url"
                :src="profile.avatar_url"
                :alt="form.displayName || form.username"
                size="xl"
              />
              <div
                v-else
                class="size-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary"
              >
                {{ avatarInitials }}
              </div>
              <div
                v-if="avatarLoading"
                class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"
              >
                <UIcon name="i-heroicons-arrow-path" class="size-6 text-white animate-spin" />
              </div>
            </div>
            <div>
              <h3 class="font-medium mb-1">Profile Picture</h3>
              <p class="text-sm text-muted mb-3">JPG, PNG or GIF. Max 2MB.</p>
              <label>
                <UButton as="span" variant="outline" size="sm" :disabled="avatarLoading" class="cursor-pointer">
                  {{ profile?.avatar_url ? 'Change' : 'Upload' }}
                </UButton>
                <input type="file" accept="image/*" class="hidden" @change="handleAvatarChange" />
              </label>
            </div>
          </div>
        </UCard>

        <!-- Profile Info -->
        <UCard>
          <div class="space-y-6">
            <!-- Username -->
            <UFormField label="Username" required>
              <template #hint>
                <span v-if="usernameChecking" class="text-muted">Checking...</span>
                <span v-else-if="usernameAvailable === true && form.username !== profile?.username" class="text-success"
                  >Available</span
                >
                <span v-else-if="usernameError" class="text-error">{{ usernameError }}</span>
              </template>
              <UInput
                v-model="form.username"
                placeholder="username"
                :color="usernameError ? 'error' : usernameAvailable === true ? 'success' : 'neutral'"
              >
                <template #leading>
                  <span class="text-muted">@</span>
                </template>
                <template #trailing>
                  <UIcon v-if="usernameChecking" name="i-heroicons-arrow-path" class="size-4 animate-spin text-muted" />
                  <UIcon
                    v-else-if="usernameAvailable === true"
                    name="i-heroicons-check-circle"
                    class="size-4 text-success"
                  />
                </template>
              </UInput>
              <template #description>
                <span class="text-xs text-muted">Your unique username on OpenECU Alliance.</span>
              </template>
            </UFormField>

            <!-- Display Name -->
            <UFormField label="Display Name">
              <UInput v-model="form.displayName" placeholder="Your Name" />
              <template #description>
                <span class="text-xs text-muted">This is how your name appears on your contributions.</span>
              </template>
            </UFormField>

            <!-- Bio -->
            <UFormField label="Bio">
              <UTextarea v-model="form.bio" placeholder="Tell us about yourself..." :rows="3" :maxlength="500" />
              <template #description>
                <span class="text-xs text-muted">{{ form.bio.length }}/500 characters</span>
              </template>
            </UFormField>

            <!-- Location -->
            <UFormField label="Location">
              <UInput v-model="form.location" placeholder="City, Country" icon="i-heroicons-map-pin" />
            </UFormField>

            <!-- Website -->
            <UFormField label="Website">
              <UInput v-model="form.website" type="url" placeholder="https://yourwebsite.com" icon="i-heroicons-link" />
            </UFormField>

            <!-- GitHub -->
            <UFormField label="GitHub Username">
              <UInput v-model="form.githubUsername" placeholder="username" icon="i-simple-icons-github" />
            </UFormField>
          </div>

          <!-- Actions -->
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton to="/profile" variant="ghost" :disabled="loading"> Cancel </UButton>
              <UButton type="submit" :loading="loading" :disabled="!canSubmit"> Save Changes </UButton>
            </div>
          </template>
        </UCard>
      </form>
    </UContainer>
  </div>
</template>
