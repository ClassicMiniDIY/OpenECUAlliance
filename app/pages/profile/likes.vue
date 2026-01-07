<script setup lang="ts">
import type { UserModel } from "~/types/model";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

useSeoMeta({
  title: "Liked Models - OpenECU Alliance",
  description: "View your collection of liked 3D models.",
  robots: "noindex, nofollow",
});

const supabase = useSupabaseClient();
const { currentUser } = useAuth();

const loading = ref(true);
const models = ref<UserModel[]>([]);

async function fetchLikedModels() {
  if (!currentUser.value) return;

  loading.value = true;
  try {
    const { data, error } = await supabase
      .from("model_likes")
      .select(
        `
        created_at,
        models:model_id (
          id,
          slug,
          name,
          version,
          description,
          category,
          vendor,
          license,
          likes_count,
          comments_count,
          downloads_count,
          average_rating,
          ratings_count,
          status,
          is_published,
          featured,
          created_at,
          published_at,
          printing,
          profiles:author_id (
            id,
            username,
            display_name,
            avatar_url
          ),
          model_images (
            storage_path,
            thumbnail_path,
            is_primary
          ),
          model_files (
            format
          )
        )
      `,
      )
      .eq("user_id", currentUser.value.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    models.value = (data || [])
      .filter((item: any) => item.models && item.models.is_published)
      .map((item: any) => {
        const model = item.models;
        const author = model.profiles;
        const primaryImage = model.model_images?.find((i: any) => i.is_primary);
        const printing = model.printing as any;

        return {
          id: model.id,
          slug: model.slug,
          name: model.name,
          version: model.version,
          description: model.description,
          category: model.category,
          vendor: model.vendor,
          author: {
            id: author.id,
            username: author.username,
            displayName: author.display_name,
            avatarUrl: author.avatar_url,
          },
          primaryImage: primaryImage?.storage_path
            ? supabase.storage
                .from("model-images")
                .getPublicUrl(primaryImage.storage_path).data.publicUrl
            : null,
          primaryImageThumbnail: primaryImage?.thumbnail_path
            ? supabase.storage
                .from("model-images")
                .getPublicUrl(primaryImage.thumbnail_path).data.publicUrl
            : null,
          recommendedMaterial: printing?.recommended_material || "PLA",
          estimatedTimeHours: printing?.estimated_time_hours || null,
          fileFormats: [
            ...new Set((model.model_files || []).map((f: any) => f.format)),
          ],
          license: model.license,
          likesCount: model.likes_count,
          commentsCount: model.comments_count,
          downloadsCount: model.downloads_count,
          averageRating: model.average_rating,
          ratingsCount: model.ratings_count,
          status: model.status,
          isPublished: model.is_published,
          featured: model.featured,
          createdAt: model.created_at,
          publishedAt: model.published_at,
        } as UserModel;
      });
  } catch (err) {
    console.error("Failed to fetch liked models:", err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchLikedModels();
});
</script>

<template>
  <div>
    <UContainer class="py-12">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <UButton
          to="/profile"
          variant="ghost"
          icon="i-heroicons-arrow-left"
          size="sm"
        />
        <div>
          <h1 class="text-2xl font-bold">Liked Models</h1>
          <p class="text-muted">Models you've saved for later</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-24">
        <UIcon
          name="i-heroicons-arrow-path"
          class="size-8 text-primary animate-spin"
        />
      </div>

      <!-- Models Grid -->
      <div
        v-else-if="models.length > 0"
        class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <UCard
          v-for="model in models"
          :key="model.id"
          :to="`/models/${model.category}/${model.slug}`"
          class="hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer"
        >
          <!-- Image -->
          <div
            class="aspect-video bg-elevated rounded-lg overflow-hidden mb-4 -mx-4 -mt-4"
          >
            <img
              v-if="model.primaryImage"
              :src="model.primaryImageThumbnail || model.primaryImage"
              :alt="model.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon name="i-heroicons-cube" class="size-12 text-muted" />
            </div>
          </div>

          <!-- Info -->
          <div class="flex items-center gap-2 mb-2">
            <h3 class="font-semibold truncate">{{ model.name }}</h3>
            <UBadge
              v-if="model.featured"
              color="warning"
              variant="subtle"
              size="xs"
            >
              Featured
            </UBadge>
          </div>

          <p class="text-sm text-muted line-clamp-2 mb-3">
            {{ model.description }}
          </p>

          <!-- Author -->
          <div class="flex items-center gap-2 mb-3">
            <UAvatar
              v-if="model.author.avatarUrl"
              :src="model.author.avatarUrl"
              :alt="model.author.displayName || model.author.username"
              size="xs"
            />
            <div
              v-else
              class="size-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary"
            >
              {{
                (model.author.displayName || model.author.username)
                  .substring(0, 1)
                  .toUpperCase()
              }}
            </div>
            <span class="text-sm text-muted">
              {{ model.author.displayName || model.author.username }}
            </span>
          </div>

          <!-- Stats -->
          <div class="flex gap-4 text-sm text-muted">
            <div class="flex items-center gap-1">
              <UIcon name="i-heroicons-heart" class="size-4 text-error" />
              {{ model.likesCount }}
            </div>
            <div class="flex items-center gap-1">
              <UIcon name="i-heroicons-arrow-down-tray" class="size-4" />
              {{ model.downloadsCount }}
            </div>
            <div v-if="model.ratingsCount > 0" class="flex items-center gap-1">
              <UIcon name="i-heroicons-star" class="size-4 text-warning" />
              {{ model.averageRating.toFixed(1) }}
            </div>
          </div>
        </UCard>
      </div>

      <!-- Empty State -->
      <UCard v-else class="text-center py-12">
        <UIcon
          name="i-heroicons-heart"
          class="size-16 text-muted mx-auto mb-4"
        />
        <h3 class="font-semibold mb-2">No liked models yet</h3>
        <p class="text-muted mb-4">
          Browse models and click the heart to save them here.
        </p>
        <UButton to="/models"> Browse Models </UButton>
      </UCard>
    </UContainer>
  </div>
</template>
