<script setup lang="ts">
  definePageMeta({
    layout: 'default',
  });

  useSeoMeta({
    title: 'Signing in... - OpenECU Alliance',
    description: 'Completing your sign-in to OpenECU Alliance.',
    robots: 'noindex, nofollow',
  });

  const { isAuthenticated, profile, fetchProfile } = useAuth();
  const route = useRoute();
  const error = ref<string | null>(null);

  // Handle authentication callback
  onMounted(async () => {
    // Check for error in URL
    const errorParam = route.query.error as string | undefined;
    const errorDescription = route.query.error_description as string | undefined;

    if (errorParam) {
      error.value = errorDescription || errorParam;
      return;
    }

    // Wait for auth state to settle
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Fetch profile after auth
    if (isAuthenticated.value) {
      await fetchProfile();

      // If no profile exists, redirect to profile setup
      if (!profile.value) {
        await navigateTo('/profile/setup');
      } else {
        // Redirect to intended destination or profile
        // Check localStorage first (set by login page before OAuth)
        const storedRedirect = localStorage.getItem('auth_redirect');
        if (storedRedirect) {
          localStorage.removeItem('auth_redirect');
          await navigateTo(storedRedirect);
        } else {
          const redirect = route.query.redirect as string | undefined;
          await navigateTo(redirect || '/profile');
        }
      }
    } else {
      // Auth failed or not complete yet
      error.value = 'Authentication failed. Please try again.';
    }
  });
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-md text-center">
      <!-- Error State -->
      <template v-if="error">
        <div class="size-16 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
          <UIcon name="i-heroicons-exclamation-circle" class="size-8 text-error" />
        </div>
        <h1 class="text-xl font-bold mb-2">Sign in failed</h1>
        <p class="text-muted mb-6">{{ error }}</p>
        <UButton to="/login"> Try again </UButton>
      </template>

      <!-- Loading State -->
      <template v-else>
        <div class="size-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
          <UIcon name="i-heroicons-arrow-path" class="size-8 text-primary animate-spin" />
        </div>
        <h1 class="text-xl font-bold mb-2">Signing you in...</h1>
        <p class="text-muted">Please wait while we complete the sign in process.</p>
      </template>
    </div>
  </div>
</template>
