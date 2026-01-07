<script setup lang="ts">
  definePageMeta({
    layout: 'default',
    middleware: 'admin',
  });

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const supabase = useSupabaseClient();

  const queueId = computed(() => route.params.id as string);

  const {
    approveModel,
    rejectModel,
    requestChanges,
    assignToMe,
    loading: actionLoading,
    error: actionError,
  } = useModeration();
  const { currentUser } = useAuth();

  const loading = ref(true);
  const queueItem = ref<any>(null);
  const model = ref<any>(null);
  const files = ref<any[]>([]);
  const images = ref<any[]>([]);

  // Modal states
  const showApproveModal = ref(false);
  const showRejectModal = ref(false);
  const showChangesModal = ref(false);

  // Form states
  const approveNotes = ref('');
  const rejectReason = ref('');
  const changesFeedback = ref('');

  useSeoMeta({
    title: () => (model.value ? `Review: ${model.value.name} - OpenECU Alliance` : 'Review Model - OpenECU Alliance'),
    description: 'Review and moderate a model submission.',
    robots: 'noindex, nofollow',
  });

  async function fetchData() {
    loading.value = true;
    try {
      // Fetch queue item with model details
      const { data: queueData, error: queueError } = await supabase
        .from('moderation_queue')
        .select(
          `
        *,
        models:model_id (
          *,
          profiles:author_id (
            id,
            username,
            display_name,
            avatar_url,
            created_at
          )
        )
      `
        )
        .eq('id', queueId.value)
        .single();

      if (queueError) throw queueError;

      queueItem.value = queueData;
      model.value = queueData.models;

      // Fetch files
      const { data: filesData } = await supabase
        .from('model_files')
        .select('*')
        .eq('model_id', model.value.id)
        .order('is_primary', { ascending: false });

      files.value = (filesData || []).map((f: any) => ({
        ...f,
        downloadUrl: supabase.storage.from('model-files').getPublicUrl(f.storage_path).data.publicUrl,
      }));

      // Fetch images
      const { data: imagesData } = await supabase
        .from('model_images')
        .select('*')
        .eq('model_id', model.value.id)
        .order('sort_order');

      images.value = (imagesData || []).map((i: any) => ({
        ...i,
        url: supabase.storage.from('model-images').getPublicUrl(i.storage_path).data.publicUrl,
      }));
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast.add({ title: 'Failed to load model', color: 'error' });
    } finally {
      loading.value = false;
    }
  }

  async function handleApprove() {
    const success = await approveModel(queueId.value, model.value.id, approveNotes.value);
    if (success) {
      showApproveModal.value = false;
      toast.add({ title: 'Model approved and published!', color: 'success' });
      await router.push('/admin/queue');
    } else {
      toast.add({
        title: actionError.value || 'Failed to approve',
        color: 'error',
      });
    }
  }

  async function handleReject() {
    if (!rejectReason.value.trim()) {
      toast.add({ title: 'Please provide a reason', color: 'warning' });
      return;
    }
    const success = await rejectModel(queueId.value, model.value.id, rejectReason.value);
    if (success) {
      showRejectModal.value = false;
      toast.add({ title: 'Model rejected', color: 'success' });
      await router.push('/admin/queue');
    } else {
      toast.add({
        title: actionError.value || 'Failed to reject',
        color: 'error',
      });
    }
  }

  async function handleRequestChanges() {
    if (!changesFeedback.value.trim()) {
      toast.add({ title: 'Please provide feedback', color: 'warning' });
      return;
    }
    const success = await requestChanges(queueId.value, model.value.id, changesFeedback.value);
    if (success) {
      showChangesModal.value = false;
      toast.add({ title: 'Changes requested', color: 'success' });
      await router.push('/admin/queue');
    } else {
      toast.add({
        title: actionError.value || 'Failed to request changes',
        color: 'error',
      });
    }
  }

  async function handleClaim() {
    const success = await assignToMe(queueId.value);
    if (success) {
      toast.add({ title: 'Assigned to you', color: 'success' });
      await fetchData();
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  onMounted(() => {
    fetchData();
  });
</script>

<template>
  <div>
    <UContainer class="py-12">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-24">
        <UIcon name="i-heroicons-arrow-path" class="size-8 text-primary animate-spin" />
      </div>

      <template v-else-if="model">
        <!-- Header -->
        <div class="flex items-start justify-between gap-4 mb-8">
          <div class="flex items-start gap-4">
            <UButton to="/admin/queue" variant="ghost" icon="i-heroicons-arrow-left" size="sm" />
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h1 class="text-2xl font-bold">{{ model.name }}</h1>
                <UBadge color="warning" variant="subtle"> Pending Review </UBadge>
                <UBadge v-if="model.is_linked" color="info" variant="subtle"> Linked Model </UBadge>
              </div>
              <p class="text-muted">
                Submitted
                {{ new Date(model.created_at).toLocaleDateString() }} by
                {{ model.profiles.display_name || model.profiles.username }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="queueItem.status !== 'resolved'" class="flex gap-2">
            <UButton
              v-if="!queueItem.assigned_to"
              variant="outline"
              icon="i-heroicons-hand-raised"
              @click="handleClaim"
            >
              Claim
            </UButton>
            <UButton color="error" variant="outline" icon="i-heroicons-x-mark" @click="showRejectModal = true">
              Reject
            </UButton>
            <UButton color="warning" variant="outline" icon="i-heroicons-pencil" @click="showChangesModal = true">
              Request Changes
            </UButton>
            <UButton color="success" icon="i-heroicons-check" @click="showApproveModal = true"> Approve </UButton>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Images -->
            <UCard>
              <template #header>
                <h2 class="font-semibold">Images ({{ images.length }})</h2>
              </template>

              <div v-if="images.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div
                  v-for="image in images"
                  :key="image.id"
                  class="aspect-square rounded-lg overflow-hidden bg-elevated relative group"
                >
                  <img :src="image.url" :alt="image.filename" class="w-full h-full object-cover" />
                  <div class="absolute top-2 left-2 flex gap-1">
                    <UBadge v-if="image.is_primary" color="primary" variant="solid" size="xs"> Primary </UBadge>
                    <UBadge color="neutral" variant="solid" size="xs">
                      {{ image.type }}
                    </UBadge>
                  </div>
                </div>
              </div>

              <p v-else class="text-center py-8 text-muted">No images uploaded</p>
            </UCard>

            <!-- Description -->
            <UCard>
              <template #header>
                <h2 class="font-semibold">Description</h2>
              </template>
              <p class="whitespace-pre-wrap">{{ model.description }}</p>
            </UCard>

            <!-- Files -->
            <UCard>
              <template #header>
                <h2 class="font-semibold">Files ({{ files.length }})</h2>
              </template>

              <div v-if="files.length > 0" class="space-y-3">
                <div v-for="file in files" :key="file.id" class="flex items-center gap-3 p-3 rounded-lg bg-elevated">
                  <UIcon name="i-heroicons-document" class="size-5 text-muted" />
                  <div class="flex-1 min-w-0">
                    <p class="font-medium truncate">
                      {{ file.original_filename }}
                    </p>
                    <p class="text-sm text-muted">
                      {{ file.format.toUpperCase() }} -
                      {{ formatBytes(file.size_bytes) }}
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <UBadge v-if="file.is_primary" color="primary" variant="subtle" size="xs"> Primary </UBadge>
                    <UButton
                      :href="file.downloadUrl"
                      target="_blank"
                      variant="ghost"
                      size="xs"
                      icon="i-heroicons-arrow-down-tray"
                    />
                  </div>
                </div>
              </div>

              <p v-else class="text-center py-8 text-muted">No files uploaded</p>
            </UCard>

            <!-- Print Settings -->
            <UCard v-if="model.printing">
              <template #header>
                <h2 class="font-semibold">Print Settings</h2>
              </template>

              <div class="grid sm:grid-cols-2 gap-4">
                <div v-if="model.printing.recommended_material">
                  <p class="text-sm text-muted">Material</p>
                  <p class="font-medium">
                    {{ model.printing.recommended_material }}
                  </p>
                </div>
                <div v-if="model.printing.layer_height">
                  <p class="text-sm text-muted">Layer Height</p>
                  <p class="font-medium">{{ model.printing.layer_height }}mm</p>
                </div>
                <div v-if="model.printing.infill_percent">
                  <p class="text-sm text-muted">Infill</p>
                  <p class="font-medium">{{ model.printing.infill_percent }}%</p>
                </div>
                <div v-if="model.printing.supports_required !== undefined">
                  <p class="text-sm text-muted">Supports</p>
                  <p class="font-medium">
                    {{ model.printing.supports_required ? 'Required' : 'Not required' }}
                  </p>
                </div>
                <div v-if="model.printing.estimated_time_hours">
                  <p class="text-sm text-muted">Est. Print Time</p>
                  <p class="font-medium">{{ model.printing.estimated_time_hours }} hours</p>
                </div>
                <div v-if="model.printing.estimated_filament_grams">
                  <p class="text-sm text-muted">Est. Filament</p>
                  <p class="font-medium">{{ model.printing.estimated_filament_grams }}g</p>
                </div>
              </div>

              <p v-if="model.printing.notes" class="mt-4 text-sm text-muted">
                {{ model.printing.notes }}
              </p>
            </UCard>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Model Info -->
            <UCard>
              <template #header>
                <h2 class="font-semibold">Model Details</h2>
              </template>

              <div class="space-y-4">
                <div>
                  <p class="text-sm text-muted">Category</p>
                  <p class="font-medium capitalize">{{ model.category }}</p>
                </div>
                <div v-if="model.vendor">
                  <p class="text-sm text-muted">Vendor</p>
                  <p class="font-medium">{{ model.vendor }}</p>
                </div>
                <div>
                  <p class="text-sm text-muted">License</p>
                  <p class="font-medium">{{ model.license }}</p>
                </div>
                <div>
                  <p class="text-sm text-muted">Remixes Allowed</p>
                  <p class="font-medium">
                    {{ model.remixes_allowed ? 'Yes' : 'No' }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-muted">Commercial Use</p>
                  <p class="font-medium">
                    {{ model.commercial_use_allowed ? 'Yes' : 'No' }}
                  </p>
                </div>
                <div v-if="model.source_url">
                  <p class="text-sm text-muted">Source URL</p>
                  <a :href="model.source_url" target="_blank" class="text-primary hover:underline truncate block">
                    {{ model.source_url }}
                  </a>
                </div>
              </div>
            </UCard>

            <!-- External Link Info (for linked models) -->
            <UCard v-if="model.is_linked && model.external_url">
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-link" class="size-4 text-info" />
                  <h2 class="font-semibold">External Source</h2>
                </div>
              </template>

              <div class="space-y-4">
                <div>
                  <p class="text-sm text-muted">Platform</p>
                  <p class="font-medium capitalize">
                    {{ model.external_platform }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-muted">External URL</p>
                  <a :href="model.external_url" target="_blank" class="text-primary hover:underline break-all text-sm">
                    {{ model.external_url }}
                  </a>
                </div>
                <div v-if="model.external_author_name">
                  <p class="text-sm text-muted">Original Author</p>
                  <a
                    v-if="model.external_author_url"
                    :href="model.external_author_url"
                    target="_blank"
                    class="text-primary hover:underline"
                  >
                    {{ model.external_author_name }}
                  </a>
                  <p v-else class="font-medium">
                    {{ model.external_author_name }}
                  </p>
                </div>
                <UButton :href="model.external_url" target="_blank" variant="outline" size="sm" class="w-full">
                  <UIcon name="i-heroicons-arrow-top-right-on-square" class="size-4 mr-2" />
                  Verify on Original Site
                </UButton>
              </div>
            </UCard>

            <!-- Author Info -->
            <UCard>
              <template #header>
                <h2 class="font-semibold">Author</h2>
              </template>

              <div class="flex items-center gap-3">
                <UAvatar
                  v-if="model.profiles.avatar_url"
                  :src="model.profiles.avatar_url"
                  :alt="model.profiles.username"
                  size="lg"
                />
                <div
                  v-else
                  class="size-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary"
                >
                  {{ (model.profiles.display_name || model.profiles.username).substring(0, 1).toUpperCase() }}
                </div>
                <div>
                  <p class="font-medium">
                    {{ model.profiles.display_name || model.profiles.username }}
                  </p>
                  <p class="text-sm text-muted">@{{ model.profiles.username }}</p>
                  <p class="text-xs text-muted">
                    Member since
                    {{ new Date(model.profiles.created_at).toLocaleDateString() }}
                  </p>
                </div>
              </div>

              <UButton :to="`/users/${model.profiles.username}`" variant="outline" size="sm" class="mt-4 w-full">
                View Profile
              </UButton>
            </UCard>

            <!-- Hardware -->
            <UCard v-if="model.hardware?.length">
              <template #header>
                <h2 class="font-semibold">Required Hardware</h2>
              </template>

              <ul class="space-y-2">
                <li
                  v-for="(item, index) in model.hardware"
                  :key="index"
                  class="flex items-center justify-between text-sm"
                >
                  <span>{{ item.item }}</span>
                  <span class="text-muted">x{{ item.quantity }}</span>
                </li>
              </ul>
            </UCard>
          </div>
        </div>
      </template>

      <!-- Not Found -->
      <UCard v-else class="text-center py-12">
        <UIcon name="i-heroicons-exclamation-circle" class="size-16 text-error mx-auto mb-4" />
        <h2 class="font-semibold mb-2">Item Not Found</h2>
        <p class="text-muted mb-4">This queue item doesn't exist or has been removed.</p>
        <UButton to="/admin/queue">Back to Queue</UButton>
      </UCard>

      <!-- Approve Modal -->
      <UModal v-model:open="showApproveModal">
        <template #content>
          <UCard>
            <template #header>
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-full bg-success/10 flex items-center justify-center">
                  <UIcon name="i-heroicons-check" class="size-5 text-success" />
                </div>
                <h3 class="font-semibold">Approve Model</h3>
              </div>
            </template>

            <p class="text-muted mb-4">This will publish the model and make it visible to everyone.</p>

            <UFormField label="Notes (optional)" class="w-full">
              <UTextarea
                v-model="approveNotes"
                placeholder="Add any notes for the author..."
                :rows="3"
                class="w-full"
              />
            </UFormField>

            <template #footer>
              <div class="flex justify-end gap-2">
                <UButton variant="ghost" @click="showApproveModal = false"> Cancel </UButton>
                <UButton color="success" :loading="actionLoading" @click="handleApprove"> Approve & Publish </UButton>
              </div>
            </template>
          </UCard>
        </template>
      </UModal>

      <!-- Reject Modal -->
      <UModal v-model:open="showRejectModal">
        <template #content>
          <UCard>
            <template #header>
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-full bg-error/10 flex items-center justify-center">
                  <UIcon name="i-heroicons-x-mark" class="size-5 text-error" />
                </div>
                <h3 class="font-semibold">Reject Model</h3>
              </div>
            </template>

            <p class="text-muted mb-4">Please provide a reason for rejection. This will be shared with the author.</p>

            <UFormField label="Reason" required class="w-full">
              <UTextarea
                v-model="rejectReason"
                placeholder="Explain why the model is being rejected..."
                :rows="4"
                class="w-full"
              />
            </UFormField>

            <template #footer>
              <div class="flex justify-end gap-2">
                <UButton variant="ghost" @click="showRejectModal = false"> Cancel </UButton>
                <UButton color="error" :loading="actionLoading" @click="handleReject"> Reject Model </UButton>
              </div>
            </template>
          </UCard>
        </template>
      </UModal>

      <!-- Request Changes Modal -->
      <UModal v-model:open="showChangesModal">
        <template #content>
          <UCard>
            <template #header>
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <UIcon name="i-heroicons-pencil" class="size-5 text-warning" />
                </div>
                <h3 class="font-semibold">Request Changes</h3>
              </div>
            </template>

            <p class="text-muted mb-4">
              Describe what changes are needed. The author can resubmit after making updates.
            </p>

            <UFormField label="Feedback" required class="w-full">
              <UTextarea
                v-model="changesFeedback"
                placeholder="Describe the required changes..."
                :rows="4"
                class="w-full"
              />
            </UFormField>

            <template #footer>
              <div class="flex justify-end gap-2">
                <UButton variant="ghost" @click="showChangesModal = false"> Cancel </UButton>
                <UButton color="warning" :loading="actionLoading" @click="handleRequestChanges">
                  Request Changes
                </UButton>
              </div>
            </template>
          </UCard>
        </template>
      </UModal>
    </UContainer>
  </div>
</template>
