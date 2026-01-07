export default defineNuxtRouteMiddleware(async () => {
  const { currentUser, isAuthenticated, isModerator } = useAuth();

  // Wait for auth to be ready
  if (!isAuthenticated.value) {
    return navigateTo('/login');
  }

  // Check if user has moderator or admin role
  if (!isModerator.value) {
    return navigateTo('/');
  }
});
