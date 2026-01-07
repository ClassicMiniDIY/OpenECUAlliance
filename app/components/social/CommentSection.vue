<script setup lang="ts">
const props = defineProps<{
  modelId: string;
}>();

const {
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
} = useComments(props.modelId);

const toast = useToast();

const newComment = ref("");
const replyingTo = ref<string | null>(null);
const replyContent = ref("");
const confirmDelete = ref<string | null>(null);

// Fetch comments on mount
onMounted(() => {
  fetchComments();
});

// Watch for modelId changes
watch(
  () => props.modelId,
  () => {
    fetchComments();
  },
);

async function submitComment() {
  if (!newComment.value.trim()) return;

  const result = await addComment(newComment.value);
  if (result) {
    newComment.value = "";
    toast.add({
      title: "Comment added",
      color: "success",
    });
  } else if (error.value) {
    toast.add({
      title: "Error",
      description: error.value,
      color: "error",
    });
  }
}

async function submitReply(parentId: string) {
  if (!replyContent.value.trim()) return;

  const result = await addComment(replyContent.value, parentId);
  if (result) {
    replyContent.value = "";
    replyingTo.value = null;
    toast.add({
      title: "Reply added",
      color: "success",
    });
  } else if (error.value) {
    toast.add({
      title: "Error",
      description: error.value,
      color: "error",
    });
  }
}

function startReply(parentId: string) {
  replyingTo.value = parentId;
  replyContent.value = "";
}

function cancelReply() {
  replyingTo.value = null;
  replyContent.value = "";
}

async function handleEdit(commentId: string, content: string) {
  const success = await editComment(commentId, content);
  if (success) {
    toast.add({
      title: "Comment updated",
      color: "success",
    });
  } else if (error.value) {
    toast.add({
      title: "Error",
      description: error.value,
      color: "error",
    });
  }
}

async function handleDelete(commentId: string) {
  if (confirmDelete.value !== commentId) {
    confirmDelete.value = commentId;
    return;
  }

  const success = await deleteComment(commentId);
  confirmDelete.value = null;

  if (success) {
    toast.add({
      title: "Comment deleted",
      color: "success",
    });
  } else if (error.value) {
    toast.add({
      title: "Error",
      description: error.value,
      color: "error",
    });
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">
        Comments
        <span v-if="commentCount > 0" class="text-muted font-normal">
          ({{ commentCount }})
        </span>
      </h3>
    </div>

    <!-- New Comment Form -->
    <div v-if="isAuthenticated" class="flex gap-3">
      <UAvatar
        :src="currentUser?.profile?.avatar_url || undefined"
        :alt="
          currentUser?.profile?.display_name || currentUser?.profile?.username
        "
        size="sm"
        class="shrink-0"
      />
      <div class="flex-1">
        <UTextarea
          v-model="newComment"
          placeholder="Write a comment..."
          :rows="3"
          class="w-full"
        />
        <div class="flex justify-end mt-2">
          <UButton
            :loading="submitting"
            :disabled="!newComment.trim()"
            @click="submitComment"
          >
            Post Comment
          </UButton>
        </div>
      </div>
    </div>

    <!-- Sign in prompt -->
    <div v-else class="text-center py-6 bg-muted/10 rounded-lg">
      <p class="text-muted mb-3">Sign in to leave a comment</p>
      <UButton to="/login" variant="outline"> Sign In </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <UIcon
        name="i-heroicons-arrow-path"
        class="size-6 animate-spin text-muted"
      />
    </div>

    <!-- Error State -->
    <UAlert v-else-if="error" color="error" :title="error" />

    <!-- Empty State -->
    <div v-else-if="comments.length === 0" class="text-center py-8 text-muted">
      <UIcon
        name="i-heroicons-chat-bubble-left-right"
        class="size-12 mx-auto mb-3 opacity-50"
      />
      <p>No comments yet</p>
      <p class="text-sm">Be the first to share your thoughts!</p>
    </div>

    <!-- Comments List -->
    <div v-else class="space-y-6">
      <div v-for="comment in comments" :key="comment.id" class="relative">
        <CommentItem
          :comment="comment"
          :current-user-id="currentUser?.id"
          @reply="startReply"
          @edit="handleEdit"
          @delete="handleDelete"
        />

        <!-- Reply Form (shown below the comment being replied to) -->
        <div
          v-if="replyingTo === comment.id"
          class="mt-4 ml-10 pl-4 border-l-2 border-primary/30"
        >
          <div class="flex gap-3">
            <UAvatar
              :src="currentUser?.profile?.avatar_url || undefined"
              :alt="
                currentUser?.profile?.display_name ||
                currentUser?.profile?.username
              "
              size="xs"
              class="shrink-0"
            />
            <div class="flex-1">
              <UTextarea
                v-model="replyContent"
                placeholder="Write a reply..."
                :rows="2"
                class="w-full"
                autofocus
              />
              <div class="flex gap-2 mt-2">
                <UButton
                  size="sm"
                  :loading="submitting"
                  :disabled="!replyContent.trim()"
                  @click="submitReply(comment.id)"
                >
                  Reply
                </UButton>
                <UButton size="sm" variant="ghost" @click="cancelReply">
                  Cancel
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Delete Confirmation -->
        <UModal v-model:open="confirmDelete" :ui="{ width: 'max-w-md' }">
          <template #content>
            <div class="p-6">
              <h3 class="text-lg font-semibold mb-2">Delete Comment?</h3>
              <p class="text-muted mb-4">
                This action cannot be undone. The comment and all its replies
                will be permanently deleted.
              </p>
              <div class="flex justify-end gap-2">
                <UButton variant="ghost" @click="confirmDelete = null">
                  Cancel
                </UButton>
                <UButton color="error" @click="handleDelete(confirmDelete!)">
                  Delete
                </UButton>
              </div>
            </div>
          </template>
        </UModal>
      </div>
    </div>
  </div>
</template>
