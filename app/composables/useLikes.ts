export function useLikes() {
  const supabase = useSupabaseClient();
  const { currentUser, isAuthenticated } = useAuth();

  /**
   * Check if the current user has liked a model
   */
  async function checkLiked(modelId: string): Promise<boolean> {
    if (!currentUser.value) return false;

    const { data, error } = await supabase
      .from("model_likes")
      .select("user_id")
      .eq("model_id", modelId)
      .eq("user_id", currentUser.value.id)
      .maybeSingle();

    if (error) {
      console.error("Failed to check like:", error);
      return false;
    }

    return !!data;
  }

  /**
   * Toggle like status for a model
   * Returns the new like state
   */
  async function toggleLike(
    modelId: string,
  ): Promise<{ liked: boolean; error?: string }> {
    if (!currentUser.value) {
      return { liked: false, error: "Not authenticated" };
    }

    // Check current state
    const isLiked = await checkLiked(modelId);

    if (isLiked) {
      // Unlike
      const { error } = await supabase
        .from("model_likes")
        .delete()
        .eq("model_id", modelId)
        .eq("user_id", currentUser.value.id);

      if (error) {
        return { liked: true, error: error.message };
      }
      return { liked: false };
    } else {
      // Like
      const { error } = await supabase.from("model_likes").insert({
        model_id: modelId,
        user_id: currentUser.value.id,
      });

      if (error) {
        return { liked: false, error: error.message };
      }
      return { liked: true };
    }
  }

  /**
   * Get like count for a model
   */
  async function getLikeCount(modelId: string): Promise<number> {
    const { count, error } = await supabase
      .from("model_likes")
      .select("*", { count: "exact", head: true })
      .eq("model_id", modelId);

    if (error) {
      console.error("Failed to get like count:", error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Get users who liked a model
   */
  async function getLikers(modelId: string, limit = 10) {
    const { data, error } = await supabase
      .from("model_likes")
      .select(
        `
        created_at,
        profiles:user_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `,
      )
      .eq("model_id", modelId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Failed to get likers:", error);
      return [];
    }

    return (data || []).map((item: any) => ({
      ...item.profiles,
      likedAt: item.created_at,
    }));
  }

  return {
    isAuthenticated,
    checkLiked,
    toggleLike,
    getLikeCount,
    getLikers,
  };
}
