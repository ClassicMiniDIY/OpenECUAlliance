export interface CommentAuthor {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface Comment {
  id: string;
  modelId: string;
  author: CommentAuthor;
  parentId: string | null;
  content: string;
  isHidden: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  replies: Comment[];
}

export function useComments(modelId: Ref<string> | string) {
  const supabase = useSupabaseClient();
  const { currentUser, isAuthenticated } = useAuth();

  const comments = ref<Comment[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const submitting = ref(false);

  const modelIdValue = computed(() => (typeof modelId === 'string' ? modelId : modelId.value));

  /**
   * Fetch all comments for the model
   */
  async function fetchComments(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('model_comments')
        .select(
          `
          id,
          model_id,
          parent_id,
          content,
          is_hidden,
          is_edited,
          created_at,
          updated_at,
          profiles:author_id (
            id,
            username,
            display_name,
            avatar_url
          )
        `
        )
        .eq('model_id', modelIdValue.value)
        .eq('is_hidden', false)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // Build comment tree
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      // First pass: create all comments
      for (const item of data || []) {
        const comment: Comment = {
          id: item.id,
          modelId: item.model_id,
          author: {
            id: (item.profiles as any)?.id,
            username: (item.profiles as any)?.username,
            displayName: (item.profiles as any)?.display_name,
            avatarUrl: (item.profiles as any)?.avatar_url,
          },
          parentId: item.parent_id,
          content: item.content,
          isHidden: item.is_hidden,
          isEdited: item.is_edited,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          replies: [],
        };
        commentMap.set(item.id, comment);
      }

      // Second pass: build tree structure
      for (const comment of commentMap.values()) {
        if (comment.parentId && commentMap.has(comment.parentId)) {
          commentMap.get(comment.parentId)!.replies.push(comment);
        } else {
          rootComments.push(comment);
        }
      }

      comments.value = rootComments;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load comments';
    } finally {
      loading.value = false;
    }
  }

  /**
   * Add a new comment
   */
  async function addComment(content: string, parentId?: string): Promise<Comment | null> {
    if (!currentUser.value) {
      error.value = 'Not authenticated';
      return null;
    }

    if (!content.trim()) {
      error.value = 'Comment cannot be empty';
      return null;
    }

    submitting.value = true;
    error.value = null;

    try {
      const { data, error: insertError } = await supabase
        .from('model_comments')
        .insert({
          model_id: modelIdValue.value,
          author_id: currentUser.value.id,
          parent_id: parentId || null,
          content: content.trim(),
        })
        .select(
          `
          id,
          model_id,
          parent_id,
          content,
          is_hidden,
          is_edited,
          created_at,
          updated_at
        `
        )
        .single();

      if (insertError) throw insertError;

      const newComment: Comment = {
        id: data.id,
        modelId: data.model_id,
        author: {
          id: currentUser.value.id,
          username: currentUser.value.profile?.username || '',
          displayName: currentUser.value.profile?.display_name || null,
          avatarUrl: currentUser.value.profile?.avatar_url || null,
        },
        parentId: data.parent_id,
        content: data.content,
        isHidden: data.is_hidden,
        isEdited: data.is_edited,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        replies: [],
      };

      // Add to local state
      if (parentId) {
        const parent = findComment(comments.value, parentId);
        if (parent) {
          parent.replies.push(newComment);
        }
      } else {
        comments.value.push(newComment);
      }

      return newComment;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add comment';
      return null;
    } finally {
      submitting.value = false;
    }
  }

  /**
   * Edit a comment
   */
  async function editComment(commentId: string, content: string): Promise<boolean> {
    if (!currentUser.value) return false;

    try {
      const { error: updateError } = await supabase
        .from('model_comments')
        .update({
          content: content.trim(),
          is_edited: true,
          edited_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .eq('author_id', currentUser.value.id);

      if (updateError) throw updateError;

      // Update local state
      const comment = findComment(comments.value, commentId);
      if (comment) {
        comment.content = content.trim();
        comment.isEdited = true;
      }

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to edit comment';
      return false;
    }
  }

  /**
   * Delete a comment
   */
  async function deleteComment(commentId: string): Promise<boolean> {
    if (!currentUser.value) return false;

    try {
      const { error: deleteError } = await supabase
        .from('model_comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', currentUser.value.id);

      if (deleteError) throw deleteError;

      // Remove from local state
      removeComment(comments.value, commentId);

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete comment';
      return false;
    }
  }

  /**
   * Helper: Find a comment in the tree
   */
  function findComment(list: Comment[], id: string): Comment | null {
    for (const comment of list) {
      if (comment.id === id) return comment;
      const found = findComment(comment.replies, id);
      if (found) return found;
    }
    return null;
  }

  /**
   * Helper: Remove a comment from the tree
   */
  function removeComment(list: Comment[], id: string): boolean {
    const index = list.findIndex((c) => c.id === id);
    if (index !== -1) {
      list.splice(index, 1);
      return true;
    }
    for (const comment of list) {
      if (removeComment(comment.replies, id)) return true;
    }
    return false;
  }

  const commentCount = computed(() => {
    function count(list: Comment[]): number {
      return list.reduce((sum, c) => sum + 1 + count(c.replies), 0);
    }
    return count(comments.value);
  });

  return {
    comments,
    commentCount,
    loading,
    error,
    submitting,
    isAuthenticated,
    currentUser,
    fetchComments,
    addComment,
    editComment,
    deleteComment,
  };
}
