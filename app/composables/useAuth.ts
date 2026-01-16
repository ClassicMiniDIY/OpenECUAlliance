import type { Profile, CurrentUser, AuthProvider, ProfileUpdateData } from '~/types/user';

export function useAuth() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  // Profile state
  const profile = useState<Profile | null>('user-profile', () => null);
  const profileLoading = useState<boolean>('profile-loading', () => false);
  const profileError = useState<string | null>('profile-error', () => null);

  // Current user computed
  const currentUser = computed<CurrentUser | null>(() => {
    if (!user.value) return null;
    return {
      id: user.value.id,
      email: user.value.email ?? '',
      profile: profile.value,
      isAdmin: profile.value?.role === 'admin',
      isModerator: profile.value?.role === 'moderator' || profile.value?.role === 'admin',
    };
  });

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => currentUser.value?.isAdmin ?? false);
  const isModerator = computed(() => currentUser.value?.isModerator ?? false);

  /**
   * Fetch the current user's profile
   */
  async function fetchProfile() {
    profileLoading.value = true;
    profileError.value = null;

    try {
      // Get user directly from Supabase auth to ensure we have the ID
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        profile.value = null;
        return null;
      }

      const { data, error } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();

      if (error) {
        // Profile might not exist yet for new users
        if (error.code === 'PGRST116') {
          profile.value = null;
          return null;
        }
        throw error;
      }

      profile.value = data;
      return data;
    } catch (err) {
      profileError.value = err instanceof Error ? err.message : 'Failed to fetch profile';
      return null;
    } finally {
      profileLoading.value = false;
    }
  }

  /**
   * Sign in with OAuth provider (Google or Apple)
   */
  async function signInWithOAuth(provider: 'google' | 'apple') {
    const siteConfig = useSiteConfig();
    const redirectUrl = siteConfig.url || window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${redirectUrl}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Sign in with magic link (passwordless email)
   */
  async function signInWithEmail(email: string) {
    const siteConfig = useSiteConfig();
    const redirectUrl = siteConfig.url || window.location.origin;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${redirectUrl}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Sign out the current user
   */
  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    profile.value = null;
    await navigateTo('/');
  }

  /**
   * Update the current user's profile
   */
  async function updateProfile(data: ProfileUpdateData) {
    // Get user directly from Supabase auth to ensure we have the ID
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      throw new Error('Not authenticated. Please log in again.');
    }

    const userId = authUser.id;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Convert camelCase to snake_case for database
    if (data.username !== undefined) updateData.username = data.username;
    if (data.displayName !== undefined) updateData.display_name = data.displayName;
    if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.githubUsername !== undefined) updateData.github_username = data.githubUsername;
    if (data.emailNotifications !== undefined) updateData.email_notifications = data.emailNotifications;

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    profile.value = updated;
    return updated;
  }

  /**
   * Create a profile for a new user
   */
  async function createProfile(username: string, displayName?: string) {
    console.log('useSupabaseUser value:', user.value);

    // Get user directly from Supabase auth to ensure we have the ID
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    console.log('supabase.auth.getUser result:', { authUser, authError });

    if (authError || !authUser) {
      throw new Error('Not authenticated. Please log in again.');
    }

    const userId = authUser.id;

    console.log('createProfile called with:', {
      userId,
      username,
      displayName,
    });

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username,
        display_name: displayName ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating profile:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      if (error.code === '23505') {
        throw new Error('Username is already taken');
      }
      throw new Error(error.message);
    }

    console.log('Profile created:', data);
    profile.value = data;
    return data;
  }

  /**
   * Check if a username is available
   */
  async function checkUsernameAvailable(username: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('username', username.toLowerCase());

    if (error) {
      throw new Error(error.message);
    }

    return count === 0;
  }

  /**
   * Upload avatar image
   */
  async function uploadAvatar(file: File): Promise<string> {
    // Get user directly from Supabase auth to ensure we have the ID
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      throw new Error('Not authenticated. Please log in again.');
    }

    const userId = authUser.id;
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);

    // Update profile with new avatar URL
    await updateProfile({ avatarUrl: data.publicUrl });

    return data.publicUrl;
  }

  // Fetch profile when user changes
  watch(
    user,
    async (newUser) => {
      if (newUser) {
        await fetchProfile();
      } else {
        profile.value = null;
      }
    },
    { immediate: true }
  );

  return {
    // State
    user,
    profile,
    currentUser,
    profileLoading,
    profileError,

    // Computed
    isAuthenticated,
    isAdmin,
    isModerator,

    // Methods
    signInWithOAuth,
    signInWithEmail,
    signOut,
    fetchProfile,
    updateProfile,
    createProfile,
    checkUsernameAvailable,
    uploadAvatar,
  };
}
