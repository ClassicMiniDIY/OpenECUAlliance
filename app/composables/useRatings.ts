export interface RatingAuthor {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface Rating {
  userId: string;
  modelId: string;
  rating: number;
  review: string | null;
  author: RatingAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface RatingSummary {
  averageRating: number;
  totalRatings: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export function useRatings(modelId: Ref<string> | string) {
  const supabase = useSupabaseClient();
  const { currentUser, isAuthenticated } = useAuth();

  const ratings = ref<Rating[]>([]);
  const userRating = ref<Rating | null>(null);
  const summary = ref<RatingSummary>({
    averageRating: 0,
    totalRatings: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const loading = ref(false);
  const error = ref<string | null>(null);
  const submitting = ref(false);

  const modelIdValue = computed(() => (typeof modelId === 'string' ? modelId : modelId.value));

  /**
   * Fetch all ratings for the model
   */
  async function fetchRatings(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('model_ratings')
        .select(
          `
          user_id,
          model_id,
          rating,
          review,
          created_at,
          updated_at,
          profiles:user_id (
            id,
            username,
            display_name,
            avatar_url
          )
        `
        )
        .eq('model_id', modelIdValue.value)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mappedRatings: Rating[] = (data || []).map((item: any) => ({
        userId: item.user_id,
        modelId: item.model_id,
        rating: item.rating,
        review: item.review,
        author: {
          id: item.profiles?.id,
          username: item.profiles?.username,
          displayName: item.profiles?.display_name,
          avatarUrl: item.profiles?.avatar_url,
        },
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      ratings.value = mappedRatings;

      // Find user's rating if authenticated
      if (currentUser.value) {
        userRating.value = mappedRatings.find((r) => r.userId === currentUser.value!.id) || null;
      }

      // Calculate summary
      calculateSummary(mappedRatings);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load ratings';
    } finally {
      loading.value = false;
    }
  }

  /**
   * Calculate rating summary from ratings list
   */
  function calculateSummary(ratingsList: Rating[]): void {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;

    for (const r of ratingsList) {
      const stars = r.rating as 1 | 2 | 3 | 4 | 5;
      if (stars >= 1 && stars <= 5) {
        dist[stars]++;
        total += r.rating;
      }
    }

    summary.value = {
      averageRating: ratingsList.length > 0 ? total / ratingsList.length : 0,
      totalRatings: ratingsList.length,
      distribution: dist,
    };
  }

  /**
   * Get the current user's rating for this model
   */
  async function fetchUserRating(): Promise<Rating | null> {
    if (!currentUser.value) return null;

    try {
      const { data, error: fetchError } = await supabase
        .from('model_ratings')
        .select(
          `
          user_id,
          model_id,
          rating,
          review,
          created_at,
          updated_at,
          profiles:user_id (
            id,
            username,
            display_name,
            avatar_url
          )
        `
        )
        .eq('model_id', modelIdValue.value)
        .eq('user_id', currentUser.value.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        userRating.value = {
          userId: data.user_id,
          modelId: data.model_id,
          rating: data.rating,
          review: data.review,
          author: {
            id: (data.profiles as any)?.id,
            username: (data.profiles as any)?.username,
            displayName: (data.profiles as any)?.display_name,
            avatarUrl: (data.profiles as any)?.avatar_url,
          },
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        return userRating.value;
      }

      userRating.value = null;
      return null;
    } catch (err) {
      console.error('Failed to fetch user rating:', err);
      return null;
    }
  }

  /**
   * Submit or update a rating
   */
  async function submitRating(rating: number, review?: string): Promise<boolean> {
    if (!currentUser.value) {
      error.value = 'Not authenticated';
      return false;
    }

    if (rating < 1 || rating > 5) {
      error.value = 'Rating must be between 1 and 5';
      return false;
    }

    submitting.value = true;
    error.value = null;

    try {
      const { data, error: upsertError } = await supabase
        .from('model_ratings')
        .upsert(
          {
            model_id: modelIdValue.value,
            user_id: currentUser.value.id,
            rating,
            review: review?.trim() || null,
          },
          {
            onConflict: 'user_id,model_id',
          }
        )
        .select()
        .single();

      if (upsertError) throw upsertError;

      // Update local state
      const newRating: Rating = {
        userId: currentUser.value.id,
        modelId: modelIdValue.value,
        rating: data.rating,
        review: data.review,
        author: {
          id: currentUser.value.id,
          username: currentUser.value.profile?.username || '',
          displayName: currentUser.value.profile?.display_name || null,
          avatarUrl: currentUser.value.profile?.avatar_url || null,
        },
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      // Update or add to ratings list
      const existingIndex = ratings.value.findIndex((r) => r.userId === currentUser.value!.id);
      if (existingIndex !== -1) {
        ratings.value[existingIndex] = newRating;
      } else {
        ratings.value.unshift(newRating);
      }

      userRating.value = newRating;
      calculateSummary(ratings.value);

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to submit rating';
      return false;
    } finally {
      submitting.value = false;
    }
  }

  /**
   * Delete user's rating
   */
  async function deleteRating(): Promise<boolean> {
    if (!currentUser.value) return false;

    try {
      const { error: deleteError } = await supabase
        .from('model_ratings')
        .delete()
        .eq('model_id', modelIdValue.value)
        .eq('user_id', currentUser.value.id);

      if (deleteError) throw deleteError;

      // Remove from local state
      ratings.value = ratings.value.filter((r) => r.userId !== currentUser.value!.id);
      userRating.value = null;
      calculateSummary(ratings.value);

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete rating';
      return false;
    }
  }

  /**
   * Get ratings with reviews only
   */
  const ratingsWithReviews = computed(() => ratings.value.filter((r) => r.review && r.review.trim().length > 0));

  return {
    ratings,
    ratingsWithReviews,
    userRating,
    summary,
    loading,
    error,
    submitting,
    isAuthenticated,
    currentUser,
    fetchRatings,
    fetchUserRating,
    submitRating,
    deleteRating,
  };
}
