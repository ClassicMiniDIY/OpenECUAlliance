<script setup lang="ts">
  const props = defineProps<{
    modelId: string;
    initialRating?: number;
    initialCount?: number;
  }>();

  const {
    ratings,
    ratingsWithReviews,
    userRating,
    summary,
    loading,
    error,
    submitting,
    isAuthenticated,
    fetchRatings,
    submitRating,
    deleteRating,
  } = useRatings(props.modelId);

  const toast = useToast();

  const showReviewForm = ref(false);
  const selectedRating = ref(0);
  const reviewText = ref('');

  // Fetch ratings on mount
  onMounted(() => {
    fetchRatings();
  });

  // Watch for modelId changes
  watch(
    () => props.modelId,
    () => {
      fetchRatings();
    }
  );

  // Initialize form with user's existing rating
  watch(
    userRating,
    (rating) => {
      if (rating) {
        selectedRating.value = rating.rating;
        reviewText.value = rating.review || '';
      }
    },
    { immediate: true }
  );

  function openReviewForm() {
    if (userRating.value) {
      selectedRating.value = userRating.value.rating;
      reviewText.value = userRating.value.review || '';
    } else {
      selectedRating.value = 0;
      reviewText.value = '';
    }
    showReviewForm.value = true;
  }

  function closeReviewForm() {
    showReviewForm.value = false;
  }

  async function handleSubmit() {
    if (selectedRating.value < 1) {
      toast.add({
        title: 'Please select a rating',
        color: 'warning',
      });
      return;
    }

    const success = await submitRating(selectedRating.value, reviewText.value);

    if (success) {
      showReviewForm.value = false;
      toast.add({
        title: userRating.value ? 'Rating updated' : 'Rating submitted',
        color: 'success',
      });
    } else if (error.value) {
      toast.add({
        title: 'Error',
        description: error.value,
        color: 'error',
      });
    }
  }

  async function handleDelete() {
    const success = await deleteRating();

    if (success) {
      selectedRating.value = 0;
      reviewText.value = '';
      toast.add({
        title: 'Rating removed',
        color: 'success',
      });
    } else if (error.value) {
      toast.add({
        title: 'Error',
        description: error.value,
        color: 'error',
      });
    }
  }

  function getPercentage(count: number): number {
    if (summary.value.totalRatings === 0) return 0;
    return (count / summary.value.totalRatings) * 100;
  }

  const formattedDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };
</script>

<template>
  <div class="space-y-6">
    <!-- Summary Section -->
    <div class="flex gap-8 items-start">
      <!-- Average Rating -->
      <div class="text-center">
        <div class="text-4xl font-bold text-default">
          {{ summary.averageRating.toFixed(1) }}
        </div>
        <RatingStars :model-value="summary.averageRating" readonly precision="half" size="sm" class="mt-1" />
        <div class="text-sm text-muted mt-1">
          {{ summary.totalRatings }}
          {{ summary.totalRatings === 1 ? 'rating' : 'ratings' }}
        </div>
      </div>

      <!-- Distribution -->
      <div class="flex-1 space-y-1.5">
        <div v-for="stars in [5, 4, 3, 2, 1]" :key="stars" class="flex items-center gap-2 text-sm">
          <span class="w-3 text-muted">{{ stars }}</span>
          <UIcon name="i-heroicons-star-solid" class="size-3 text-warning" />
          <div class="flex-1 h-2 bg-muted/20 rounded-full overflow-hidden">
            <div
              class="h-full bg-warning rounded-full transition-all duration-300"
              :style="{
                width: `${getPercentage(summary.distribution[stars as 1 | 2 | 3 | 4 | 5])}%`,
              }"
            />
          </div>
          <span class="w-8 text-right text-muted">
            {{ summary.distribution[stars as 1 | 2 | 3 | 4 | 5] }}
          </span>
        </div>
      </div>
    </div>

    <!-- User Rating Action -->
    <div v-if="isAuthenticated" class="border-t border-muted/20 pt-4">
      <div v-if="userRating" class="flex items-center justify-between">
        <div>
          <span class="text-sm text-muted">Your rating:</span>
          <RatingStars :model-value="userRating.rating" readonly size="sm" class="ml-2" />
        </div>
        <div class="flex gap-2">
          <UButton size="sm" variant="ghost" @click="openReviewForm"> Edit </UButton>
          <UButton size="sm" variant="ghost" color="error" @click="handleDelete"> Remove </UButton>
        </div>
      </div>
      <UButton v-else variant="outline" @click="openReviewForm"> Rate this model </UButton>
    </div>

    <!-- Sign in prompt -->
    <div v-else class="border-t border-muted/20 pt-4 text-center">
      <p class="text-muted text-sm mb-2">Sign in to rate this model</p>
      <UButton to="/login" variant="outline" size="sm"> Sign In </UButton>
    </div>

    <!-- Review Form Modal -->
    <UModal v-model:open="showReviewForm">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">
            {{ userRating ? 'Update your rating' : 'Rate this model' }}
          </h3>

          <div class="space-y-4">
            <!-- Star Selection -->
            <div class="text-center">
              <RatingStars v-model="selectedRating" size="lg" />
              <p class="text-sm text-muted mt-2">
                {{
                  selectedRating === 0 ? 'Select a rating' : `${selectedRating} star${selectedRating !== 1 ? 's' : ''}`
                }}
              </p>
            </div>

            <!-- Review Text -->
            <div>
              <label class="block text-sm font-medium mb-1"> Review (optional) </label>
              <UTextarea v-model="reviewText" placeholder="Share your experience with this model..." :rows="4" />
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-2">
              <UButton variant="ghost" @click="closeReviewForm"> Cancel </UButton>
              <UButton :loading="submitting" :disabled="selectedRating < 1" @click="handleSubmit">
                {{ userRating ? 'Update' : 'Submit' }}
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Reviews List -->
    <div v-if="ratingsWithReviews.length > 0" class="border-t border-muted/20 pt-4">
      <h4 class="font-medium mb-4">Reviews ({{ ratingsWithReviews.length }})</h4>

      <div class="space-y-4">
        <div v-for="rating in ratingsWithReviews" :key="rating.userId" class="flex gap-3">
          <NuxtLink :to="`/users/${rating.author.username}`">
            <UAvatar
              :src="rating.author.avatarUrl || undefined"
              :alt="rating.author.displayName || rating.author.username"
              size="sm"
            />
          </NuxtLink>

          <div class="flex-1">
            <div class="flex items-center gap-2">
              <NuxtLink :to="`/users/${rating.author.username}`" class="font-medium text-sm hover:text-primary">
                {{ rating.author.displayName || rating.author.username }}
              </NuxtLink>
              <RatingStars :model-value="rating.rating" readonly size="xs" />
              <span class="text-xs text-muted">
                {{ formattedDate(rating.createdAt) }}
              </span>
            </div>
            <p class="text-sm text-default mt-1 whitespace-pre-wrap">
              {{ rating.review }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
