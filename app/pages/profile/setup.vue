<script setup lang="ts">
definePageMeta({
  layout: "default",
  middleware: "auth",
});

useSeoMeta({
  title: "Complete Your Profile - OpenECU Alliance",
});

const { createProfile, checkUsernameAvailable, profile } = useAuth();

const username = ref("");
const displayName = ref("");
const loading = ref(false);
const checking = ref(false);
const error = ref<string | null>(null);
const submitError = ref<string | null>(null);
const usernameAvailable = ref<boolean | null>(null);

// Redirect if profile already exists
watch(
  profile,
  (p) => {
    if (p) {
      navigateTo("/profile");
    }
  },
  { immediate: true },
);

// Debounced username check
let checkTimeout: NodeJS.Timeout;
watch(username, (value) => {
  usernameAvailable.value = null;
  error.value = null;

  if (checkTimeout) clearTimeout(checkTimeout);

  if (!value || value.length < 3) return;

  // Validate format
  if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
    error.value =
      "Username can only contain letters, numbers, underscores, and hyphens";
    return;
  }

  checking.value = true;
  checkTimeout = setTimeout(async () => {
    try {
      usernameAvailable.value = await checkUsernameAvailable(value);
      if (!usernameAvailable.value) {
        error.value = "This username is already taken";
      }
    } catch (err) {
      error.value = "Failed to check username availability";
    } finally {
      checking.value = false;
    }
  }, 500);
});

const canSubmit = computed(() => {
  return (
    username.value.length >= 3 &&
    usernameAvailable.value === true &&
    !loading.value &&
    !checking.value
  );
});

async function handleSubmit() {
  if (!canSubmit.value) return;

  loading.value = true;
  submitError.value = null;

  try {
    console.log("Creating profile with username:", username.value);
    await createProfile(username.value, displayName.value || undefined);
    console.log("Profile created successfully");
    await navigateTo("/profile");
  } catch (err) {
    console.error("Profile creation failed:", err);
    submitError.value =
      err instanceof Error ? err.message : "Failed to create profile";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div
    class="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4"
  >
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <div
          class="size-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center"
        >
          <UIcon name="i-heroicons-user-circle" class="size-10 text-primary" />
        </div>
        <h1 class="text-2xl font-bold">Complete your profile</h1>
        <p class="text-muted mt-2">
          Choose a username to get started. This will be visible to others.
        </p>
      </div>

      <UCard>
        <!-- Submit Error Alert -->
        <UAlert
          v-if="submitError"
          color="error"
          icon="i-heroicons-exclamation-circle"
          :title="submitError"
          class="mb-4"
        />

        <form @submit.prevent="handleSubmit">
          <!-- Username -->
          <UFormField label="Username" required class="mb-4">
            <template #hint>
              <span v-if="checking" class="text-muted">Checking...</span>
              <span v-else-if="usernameAvailable === true" class="text-success"
                >Available</span
              >
              <span v-else-if="error" class="text-error">{{ error }}</span>
            </template>
            <UInput
              v-model="username"
              placeholder="cooltuner42"
              size="lg"
              :color="
                error
                  ? 'error'
                  : usernameAvailable === true
                    ? 'success'
                    : 'neutral'
              "
              required
              :disabled="loading"
            >
              <template #leading>
                <span class="text-muted">@</span>
              </template>
              <template #trailing>
                <UIcon
                  v-if="checking"
                  name="i-heroicons-arrow-path"
                  class="size-4 animate-spin text-muted"
                />
                <UIcon
                  v-else-if="usernameAvailable === true"
                  name="i-heroicons-check-circle"
                  class="size-4 text-success"
                />
                <UIcon
                  v-else-if="error && username.length >= 3"
                  name="i-heroicons-x-circle"
                  class="size-4 text-error"
                />
              </template>
            </UInput>
            <template #description>
              <span class="text-xs text-muted"
                >3+ characters. Letters, numbers, underscores, and hyphens
                only.</span
              >
            </template>
          </UFormField>

          <!-- Display Name -->
          <UFormField label="Display name" class="mb-6">
            <UInput
              v-model="displayName"
              placeholder="Your Name (optional)"
              size="lg"
              :disabled="loading"
            />
            <template #description>
              <span class="text-xs text-muted"
                >This is how your name will appear on your contributions.</span
              >
            </template>
          </UFormField>

          <UButton
            type="submit"
            block
            size="lg"
            :loading="loading"
            :disabled="!canSubmit"
          >
            Create profile
          </UButton>
        </form>
      </UCard>
    </div>
  </div>
</template>
