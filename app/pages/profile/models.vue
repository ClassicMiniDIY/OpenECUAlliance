<script setup lang="ts">
import type { UserModel, ModelStatus } from "~/types/model";

definePageMeta({
  layout: "default",
  middleware: "auth",
});

useSeoMeta({
  title: "My Models - OpenECU Alliance",
});

const supabase = useSupabaseClient();
const { currentUser } = useAuth();

const loading = ref(true);
const models = ref<UserModel[]>([]);
const selectedStatus = ref<ModelStatus | "all">("all");
const deleteModalOpen = ref(false);
const modelToDelete = ref<UserModel | null>(null);
const deleting = ref(false);

const statusFilters: {
  value: ModelStatus | "all";
  label: string;
  color: string;
}[] = [
  { value: "all", label: "All", color: "neutral" },
  { value: "draft", label: "Drafts", color: "neutral" },
  { value: "pending", label: "Pending Review", color: "warning" },
  { value: "approved", label: "Published", color: "success" },
  { value: "rejected", label: "Rejected", color: "error" },
];

const filteredModels = computed(() => {
  if (selectedStatus.value === "all") return models.value;
  return models.value.filter((m) => m.status === selectedStatus.value);
});

const statusCounts = computed(() => {
  const counts: Record<string, number> = { all: models.value.length };
  for (const model of models.value) {
    counts[model.status] = (counts[model.status] || 0) + 1;
  }
  return counts;
});

async function fetchModels() {
  if (!currentUser.value) return;

  loading.value = true;
  try {
    // Get user ID directly from Supabase to ensure we have it
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      console.error("Not authenticated");
      return;
    }

    const { data, error } = await supabase
      .from("models")
      .select(
        `
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
        model_images (
          storage_path,
          thumbnail_path,
          is_primary
        ),
        model_files (
          format
        )
      `,
      )
      .eq("author_id", authUser.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    models.value = (data || []).map((model: any) => {
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
          id: currentUser.value!.id,
          username: currentUser.value!.profile?.username || "",
          displayName: currentUser.value!.profile?.display_name || null,
          avatarUrl: currentUser.value!.profile?.avatar_url || null,
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
    console.error("Failed to fetch models:", err);
  } finally {
    loading.value = false;
  }
}

function getStatusColor(status: ModelStatus): string {
  switch (status) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "error";
    case "flagged":
      return "error";
    case "draft":
      return "neutral";
    default:
      return "neutral";
  }
}

function getStatusLabel(status: ModelStatus): string {
  switch (status) {
    case "approved":
      return "Published";
    case "pending":
      return "Pending Review";
    case "rejected":
      return "Rejected";
    case "flagged":
      return "Flagged";
    case "draft":
      return "Draft";
    case "archived":
      return "Archived";
    default:
      return status;
  }
}

function confirmDeleteModel(model: UserModel) {
  modelToDelete.value = model;
  deleteModalOpen.value = true;
}

async function deleteModel() {
  if (!modelToDelete.value) return;

  deleting.value = true;
  try {
    const { error } = await supabase
      .from("models")
      .delete()
      .eq("id", modelToDelete.value.id);

    if (error) throw error;

    // Remove from local list
    models.value = models.value.filter((m) => m.id !== modelToDelete.value!.id);
    deleteModalOpen.value = false;
    modelToDelete.value = null;
  } catch (err) {
    console.error("Failed to delete model:", err);
  } finally {
    deleting.value = false;
  }
}

onMounted(() => {
  fetchModels();
});
</script>

<template>
  <div>
    <UContainer class="py-12">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <UButton
            to="/profile"
            variant="ghost"
            icon="i-heroicons-arrow-left"
            size="sm"
            class="size-8 p-0! flex items-center justify-center"
          />
          <div>
            <h1 class="text-2xl font-bold">My Models</h1>
            <p class="text-muted">Manage your submitted 3D models</p>
          </div>
        </div>
        <UButton to="/models/upload" icon="i-heroicons-plus">
          Upload Model
        </UButton>
      </div>

      <!-- Status Filters -->
      <div class="flex flex-wrap gap-2 mb-6">
        <UButton
          v-for="filter in statusFilters"
          :key="filter.value"
          :color="selectedStatus === filter.value ? 'primary' : 'neutral'"
          :variant="selectedStatus === filter.value ? 'solid' : 'outline'"
          size="sm"
          @click="selectedStatus = filter.value"
        >
          {{ filter.label }}
          <UBadge
            v-if="statusCounts[filter.value]"
            :color="selectedStatus === filter.value ? 'neutral' : 'neutral'"
            :variant="selectedStatus === filter.value ? 'solid' : 'outline'"
            size="xs"
            class="ml-1"
          >
            {{ statusCounts[filter.value] }}
          </UBadge>
        </UButton>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-24">
        <UIcon
          name="i-heroicons-arrow-path"
          class="size-8 text-primary animate-spin"
        />
      </div>

      <!-- Models List -->
      <div v-else-if="filteredModels.length > 0" class="space-y-4">
        <UCard
          v-for="model in filteredModels"
          :key="model.id"
          class="hover:ring-2 hover:ring-primary/50 transition-all"
        >
          <div class="flex gap-4">
            <!-- Image -->
            <div
              class="size-24 rounded-lg bg-elevated shrink-0 overflow-hidden"
            >
              <img
                v-if="model.primaryImage"
                :src="model.primaryImageThumbnail || model.primaryImage"
                :alt="model.name"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center"
              >
                <UIcon name="i-heroicons-cube" class="size-8 text-muted" />
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-semibold truncate">{{ model.name }}</h3>
                    <UBadge
                      :color="getStatusColor(model.status)"
                      variant="subtle"
                      size="xs"
                    >
                      {{ getStatusLabel(model.status) }}
                    </UBadge>
                    <UBadge
                      v-if="model.featured"
                      color="warning"
                      variant="subtle"
                      size="xs"
                    >
                      Featured
                    </UBadge>
                  </div>
                  <p class="text-sm text-muted line-clamp-2 mb-2">
                    {{ model.description }}
                  </p>
                </div>
              </div>

              <!-- Stats -->
              <div class="flex flex-wrap gap-4 text-sm text-muted">
                <div class="flex items-center gap-1">
                  <UIcon name="i-heroicons-heart" class="size-4" />
                  {{ model.likesCount }}
                </div>
                <div class="flex items-center gap-1">
                  <UIcon name="i-heroicons-chat-bubble-left" class="size-4" />
                  {{ model.commentsCount }}
                </div>
                <div class="flex items-center gap-1">
                  <UIcon name="i-heroicons-arrow-down-tray" class="size-4" />
                  {{ model.downloadsCount }}
                </div>
                <div
                  v-if="model.ratingsCount > 0"
                  class="flex items-center gap-1"
                >
                  <UIcon name="i-heroicons-star" class="size-4 text-warning" />
                  {{ model.averageRating.toFixed(1) }} ({{
                    model.ratingsCount
                  }})
                </div>
                <div class="flex items-center gap-1">
                  <UIcon name="i-heroicons-calendar" class="size-4" />
                  {{ new Date(model.createdAt).toLocaleDateString() }}
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-2 shrink-0">
              <UButton
                v-if="model.isPublished"
                :to="`/models/${model.category}/${model.slug}`"
                variant="outline"
                size="sm"
                icon="i-heroicons-eye"
              >
                View
              </UButton>
              <UButton
                v-if="model.status === 'pending'"
                :to="`/models/${model.category}/${model.slug}`"
                variant="outline"
                size="sm"
                icon="i-heroicons-eye"
              >
                Preview
              </UButton>
              <UButton
                v-if="model.status === 'draft' || model.status === 'rejected'"
                :to="`/models/${model.category}/${model.slug}/edit`"
                variant="outline"
                size="sm"
                icon="i-heroicons-pencil"
              >
                Edit
              </UButton>
              <UButton
                v-if="
                  model.status === 'draft' ||
                  model.status === 'pending' ||
                  model.status === 'rejected'
                "
                variant="ghost"
                color="error"
                size="sm"
                icon="i-heroicons-trash"
                @click="confirmDeleteModel(model)"
              >
                Delete
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Empty State -->
      <UCard v-else class="text-center py-12">
        <UIcon
          name="i-heroicons-cube"
          class="size-16 text-muted mx-auto mb-4"
        />
        <h3 class="font-semibold mb-2">
          {{
            selectedStatus === "all"
              ? "No models yet"
              : `No ${selectedStatus} models`
          }}
        </h3>
        <p class="text-muted mb-4">
          {{
            selectedStatus === "all"
              ? "Share your first 3D printable model with the community."
              : "Try selecting a different status filter."
          }}
        </p>
        <UButton v-if="selectedStatus === 'all'" to="/models/upload">
          Upload Your First Model
        </UButton>
      </UCard>
    </UContainer>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="deleteModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <div
                class="size-10 rounded-full bg-error/10 flex items-center justify-center"
              >
                <UIcon
                  name="i-heroicons-exclamation-triangle"
                  class="size-5 text-error"
                />
              </div>
              <div>
                <h3 class="font-semibold">Delete Model</h3>
                <p class="text-sm text-muted">This action cannot be undone</p>
              </div>
            </div>
          </template>

          <p class="text-muted">
            Are you sure you want to delete
            <span class="font-medium text-default">{{
              modelToDelete?.name
            }}</span
            >? All files and images will be permanently removed.
          </p>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                variant="outline"
                color="neutral"
                @click="deleteModalOpen = false"
              >
                Cancel
              </UButton>
              <UButton color="error" :loading="deleting" @click="deleteModel">
                Delete Model
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
