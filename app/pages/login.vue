<script setup lang="ts">
  definePageMeta({
    layout: 'default',
  });

  useSeoMeta({
    title: 'Sign In - OpenECU Alliance',
    description: 'Sign in to OpenECU Alliance to upload 3D models, track favorites, and engage with the community.',
  });

  const route = useRoute();
  const { signInWithEmail, isAuthenticated } = useAuth();

  const email = ref('');
  const loading = ref(false);
  const emailSent = ref(false);
  const error = ref<string | null>(null);

  // Get redirect destination from query params
  const redirectTo = computed(() => {
    const redirect = route.query.redirect as string | undefined;
    // Only allow internal redirects (starting with /)
    if (redirect && redirect.startsWith('/')) {
      return redirect;
    }
    return '/profile';
  });

  // Redirect if already authenticated
  watch(
    isAuthenticated,
    (authenticated) => {
      if (authenticated) {
        navigateTo(redirectTo.value);
      }
    },
    { immediate: true }
  );

  async function handleEmailSubmit() {
    if (!email.value) return;

    loading.value = true;
    error.value = null;

    try {
      // Store redirect URL for after magic link callback
      if (redirectTo.value !== '/profile') {
        localStorage.setItem('auth_redirect', redirectTo.value);
      } else {
        localStorage.removeItem('auth_redirect');
      }
      await signInWithEmail(email.value);
      emailSent.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send magic link';
    } finally {
      loading.value = false;
    }
  }

  function resetEmailForm() {
    emailSent.value = false;
    email.value = '';
    error.value = null;
  }
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-md">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-block mb-4">
          <UIcon name="i-heroicons-cpu-chip" class="size-12 text-primary" />
        </NuxtLink>
        <h1 class="text-2xl font-bold">Welcome to OpenECU Alliance</h1>
        <p class="text-muted mt-2">Sign in to upload models, save favorites, and engage with the community.</p>
      </div>

      <!-- Email Sent State -->
      <UCard v-if="emailSent" class="text-center">
        <div class="py-4">
          <div class="size-16 mx-auto mb-4 bg-success/10 rounded-full flex items-center justify-center">
            <UIcon name="i-heroicons-envelope" class="size-8 text-success" />
          </div>
          <h2 class="font-semibold text-lg mb-2">Check your email</h2>
          <p class="text-muted mb-4">
            We sent a magic link to
            <span class="font-medium text-default">{{ email }}</span
            >. Click the link in the email to sign in.
          </p>
          <UButton variant="ghost" @click="resetEmailForm"> Use a different email </UButton>
        </div>
      </UCard>

      <!-- Login Form -->
      <UCard v-else>
        <!-- Error Alert -->
        <UAlert v-if="error" color="error" icon="i-heroicons-exclamation-circle" :title="error" class="mb-4" />

        <!-- Email Form -->
        <form @submit.prevent="handleEmailSubmit">
          <UFormField label="Email address" class="mb-4">
            <UInput
              v-model="email"
              type="email"
              placeholder="you@example.com"
              size="lg"
              required
              :disabled="loading"
              class="w-full"
            />
          </UFormField>
          <UButton type="submit" block size="lg" :loading="loading" :disabled="!email"> Send magic link </UButton>
        </form>

        <!-- Terms -->
        <p class="text-xs text-muted text-center mt-6">
          By signing in, you agree to our
          <NuxtLink to="/docs/terms" class="text-primary hover:underline">Terms of Service</NuxtLink>
          and
          <NuxtLink to="/docs/privacy" class="text-primary hover:underline">Privacy Policy</NuxtLink>.
        </p>
      </UCard>

      <!-- Sign Up Prompt -->
      <p class="text-center text-sm text-muted mt-6">
        Don't have an account? No problem! Signing in will create one for you.
      </p>
    </div>
  </div>
</template>
