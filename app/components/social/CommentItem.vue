<script setup lang="ts">
import type { Comment } from "~/composables/useComments";

const props = defineProps<{
  comment: Comment;
  currentUserId?: string;
  depth?: number;
}>();

const emit = defineEmits<{
  reply: [parentId: string];
  edit: [commentId: string, content: string];
  delete: [commentId: string];
}>();

const maxDepth = 3;
const depth = computed(() => props.depth ?? 0);
const canNest = computed(() => depth.value < maxDepth);

const isEditing = ref(false);
const editContent = ref("");
const showReplies = ref(true);

function startEdit() {
  editContent.value = props.comment.content;
  isEditing.value = true;
}

function cancelEdit() {
  isEditing.value = false;
  editContent.value = "";
}

function submitEdit() {
  if (editContent.value.trim() && editContent.value !== props.comment.content) {
    emit("edit", props.comment.id, editContent.value.trim());
  }
  isEditing.value = false;
}

function handleReply() {
  emit("reply", props.comment.id);
}

function handleDelete() {
  emit("delete", props.comment.id);
}

const isOwner = computed(
  () => props.currentUserId && props.comment.author.id === props.currentUserId,
);

const formattedDate = computed(() => {
  const date = new Date(props.comment.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
});
</script>

<template>
  <div class="group">
    <div class="flex gap-3">
      <!-- Avatar -->
      <NuxtLink :to="`/users/${comment.author.username}`" class="shrink-0">
        <UAvatar
          :src="comment.author.avatarUrl || undefined"
          :alt="comment.author.displayName || comment.author.username"
          size="sm"
        />
      </NuxtLink>

      <div class="flex-1 min-w-0">
        <!-- Header -->
        <div class="flex items-center gap-2 text-sm">
          <NuxtLink
            :to="`/users/${comment.author.username}`"
            class="font-medium text-default hover:text-primary"
          >
            {{ comment.author.displayName || comment.author.username }}
          </NuxtLink>
          <span class="text-muted text-xs">
            {{ formattedDate }}
          </span>
          <span v-if="comment.isEdited" class="text-muted text-xs">
            (edited)
          </span>
        </div>

        <!-- Content or Edit Form -->
        <div v-if="isEditing" class="mt-2">
          <UTextarea v-model="editContent" :rows="3" class="w-full" autofocus />
          <div class="flex gap-2 mt-2">
            <UButton size="xs" @click="submitEdit"> Save </UButton>
            <UButton size="xs" variant="ghost" @click="cancelEdit">
              Cancel
            </UButton>
          </div>
        </div>
        <p v-else class="mt-1 text-sm text-default whitespace-pre-wrap">
          {{ comment.content }}
        </p>

        <!-- Actions -->
        <div v-if="!isEditing" class="flex items-center gap-3 mt-2 text-xs">
          <button
            v-if="canNest"
            class="text-muted hover:text-primary"
            @click="handleReply"
          >
            Reply
          </button>
          <template v-if="isOwner">
            <button class="text-muted hover:text-primary" @click="startEdit">
              Edit
            </button>
            <button class="text-muted hover:text-error" @click="handleDelete">
              Delete
            </button>
          </template>
        </div>

        <!-- Replies -->
        <div v-if="comment.replies.length > 0" class="mt-3">
          <button
            v-if="comment.replies.length > 0"
            class="text-xs text-muted hover:text-primary mb-2"
            @click="showReplies = !showReplies"
          >
            {{ showReplies ? "Hide" : "Show" }} {{ comment.replies.length }}
            {{ comment.replies.length === 1 ? "reply" : "replies" }}
          </button>

          <div
            v-if="showReplies"
            class="space-y-3 pl-4 border-l-2 border-muted/20"
          >
            <CommentItem
              v-for="reply in comment.replies"
              :key="reply.id"
              :comment="reply"
              :current-user-id="currentUserId"
              :depth="depth + 1"
              @reply="$emit('reply', $event)"
              @edit="$emit('edit', $event, arguments[1])"
              @delete="$emit('delete', $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
