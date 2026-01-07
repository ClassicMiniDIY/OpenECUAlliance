import type { Tables } from '~/types/database.types';

export interface QueueItem {
  id: string;
  modelId: string;
  actionType: 'new_submission' | 'update' | 'report' | 'appeal';
  priority: number;
  status: 'pending' | 'in_progress' | 'resolved';
  resolution: 'approved' | 'rejected' | 'needs_changes' | 'escalated' | null;
  resolutionNotes: string | null;
  assignedTo: string | null;
  resolvedBy: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  model: {
    id: string;
    slug: string;
    name: string;
    description: string;
    category: string;
    status: string;
    author: {
      id: string;
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
    };
    primaryImage: string | null;
    createdAt: string;
  };
}

export interface ModerationStats {
  pending: number;
  inProgress: number;
  resolvedToday: number;
  totalModels: number;
  totalUsers: number;
  pendingReports: number;
}

export function useModeration() {
  const supabase = useSupabaseClient();
  const { currentUser } = useAuth();

  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetch moderation queue items
   */
  async function fetchQueue(options?: {
    status?: 'pending' | 'in_progress' | 'resolved';
    actionType?: 'new_submission' | 'update' | 'report' | 'appeal';
    assignedToMe?: boolean;
    limit?: number;
  }): Promise<QueueItem[]> {
    loading.value = true;
    error.value = null;

    try {
      let query = supabase
        .from('moderation_queue')
        .select(
          `
          id,
          model_id,
          action_type,
          priority,
          status,
          resolution,
          resolution_notes,
          assigned_to,
          resolved_by,
          created_at,
          updated_at,
          resolved_at,
          models:model_id (
            id,
            slug,
            name,
            description,
            category,
            status,
            created_at,
            profiles:author_id (
              id,
              username,
              display_name,
              avatar_url
            ),
            model_images (
              storage_path,
              is_primary
            )
          )
        `
        )
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.actionType) {
        query = query.eq('action_type', options.actionType);
      }

      if (options?.assignedToMe && currentUser.value) {
        query = query.eq('assigned_to', currentUser.value.id);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      return (data || []).map((item: any) => {
        const model = item.models;
        const author = model?.profiles;
        const primaryImage = model?.model_images?.find((i: any) => i.is_primary);

        return {
          id: item.id,
          modelId: item.model_id,
          actionType: item.action_type,
          priority: item.priority,
          status: item.status,
          resolution: item.resolution,
          resolutionNotes: item.resolution_notes,
          assignedTo: item.assigned_to,
          resolvedBy: item.resolved_by,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          resolvedAt: item.resolved_at,
          model: {
            id: model?.id,
            slug: model?.slug,
            name: model?.name,
            description: model?.description,
            category: model?.category,
            status: model?.status,
            author: {
              id: author?.id,
              username: author?.username,
              displayName: author?.display_name,
              avatarUrl: author?.avatar_url,
            },
            primaryImage: primaryImage?.storage_path
              ? supabase.storage.from('model-images').getPublicUrl(primaryImage.storage_path).data.publicUrl
              : null,
            createdAt: model?.created_at,
          },
        } as QueueItem;
      });
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch queue';
      return [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * Fetch moderation statistics
   */
  async function fetchStats(): Promise<ModerationStats> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [queueStats, modelCount, userCount, reportCount] = await Promise.all([
        supabase.from('moderation_queue').select('status, resolved_at', { count: 'exact' }),
        supabase.from('models').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('model_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      const queueData = queueStats.data || [];
      const pending = queueData.filter((q: any) => q.status === 'pending').length;
      const inProgress = queueData.filter((q: any) => q.status === 'in_progress').length;
      const resolvedToday = queueData.filter(
        (q: any) => q.status === 'resolved' && q.resolved_at && new Date(q.resolved_at) >= today
      ).length;

      return {
        pending,
        inProgress,
        resolvedToday,
        totalModels: modelCount.count || 0,
        totalUsers: userCount.count || 0,
        pendingReports: reportCount.count || 0,
      };
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      return {
        pending: 0,
        inProgress: 0,
        resolvedToday: 0,
        totalModels: 0,
        totalUsers: 0,
        pendingReports: 0,
      };
    }
  }

  /**
   * Assign a queue item to the current user
   */
  async function assignToMe(queueId: string): Promise<boolean> {
    if (!currentUser.value) return false;

    try {
      const { error: updateError } = await supabase
        .from('moderation_queue')
        .update({
          assigned_to: currentUser.value.id,
          assigned_at: new Date().toISOString(),
          status: 'in_progress',
        })
        .eq('id', queueId);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to assign';
      return false;
    }
  }

  /**
   * Unassign a queue item
   */
  async function unassign(queueId: string): Promise<boolean> {
    try {
      const { error: updateError } = await supabase
        .from('moderation_queue')
        .update({
          assigned_to: null,
          assigned_at: null,
          status: 'pending',
        })
        .eq('id', queueId);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to unassign';
      return false;
    }
  }

  /**
   * Approve a model
   */
  async function approveModel(queueId: string, modelId: string, notes?: string): Promise<boolean> {
    if (!currentUser.value) return false;

    try {
      // Update the model status
      const { error: modelError } = await supabase
        .from('models')
        .update({
          status: 'approved',
          is_published: true,
          published_at: new Date().toISOString(),
          moderated_by: currentUser.value.id,
          moderated_at: new Date().toISOString(),
          moderation_notes: notes || null,
        })
        .eq('id', modelId);

      if (modelError) throw modelError;

      // Update the queue item
      const { error: queueError } = await supabase
        .from('moderation_queue')
        .update({
          status: 'resolved',
          resolution: 'approved',
          resolution_notes: notes || null,
          resolved_by: currentUser.value.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', queueId);

      if (queueError) throw queueError;

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to approve';
      return false;
    }
  }

  /**
   * Reject a model
   */
  async function rejectModel(queueId: string, modelId: string, reason: string): Promise<boolean> {
    if (!currentUser.value || !reason) return false;

    try {
      // Update the model status
      const { error: modelError } = await supabase
        .from('models')
        .update({
          status: 'rejected',
          is_published: false,
          moderated_by: currentUser.value.id,
          moderated_at: new Date().toISOString(),
          moderation_notes: reason,
        })
        .eq('id', modelId);

      if (modelError) throw modelError;

      // Update the queue item
      const { error: queueError } = await supabase
        .from('moderation_queue')
        .update({
          status: 'resolved',
          resolution: 'rejected',
          resolution_notes: reason,
          resolved_by: currentUser.value.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', queueId);

      if (queueError) throw queueError;

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to reject';
      return false;
    }
  }

  /**
   * Request changes to a model
   */
  async function requestChanges(queueId: string, modelId: string, feedback: string): Promise<boolean> {
    if (!currentUser.value || !feedback) return false;

    try {
      // Update the model status
      const { error: modelError } = await supabase
        .from('models')
        .update({
          status: 'rejected',
          moderated_by: currentUser.value.id,
          moderated_at: new Date().toISOString(),
          moderation_notes: feedback,
        })
        .eq('id', modelId);

      if (modelError) throw modelError;

      // Update the queue item
      const { error: queueError } = await supabase
        .from('moderation_queue')
        .update({
          status: 'resolved',
          resolution: 'needs_changes',
          resolution_notes: feedback,
          resolved_by: currentUser.value.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', queueId);

      if (queueError) throw queueError;

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to request changes';
      return false;
    }
  }

  /**
   * Fetch pending reports
   */
  async function fetchReports(status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed') {
    try {
      let query = supabase
        .from('model_reports')
        .select(
          `
          id,
          model_id,
          reason,
          details,
          status,
          resolution_notes,
          created_at,
          resolved_at,
          profiles:reporter_id (
            id,
            username,
            display_name
          ),
          models:model_id (
            id,
            slug,
            name,
            category
          )
        `
        )
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch reports';
      return [];
    }
  }

  /**
   * Resolve a report
   */
  async function resolveReport(
    reportId: string,
    resolution: 'reviewed' | 'resolved' | 'dismissed',
    notes?: string
  ): Promise<boolean> {
    if (!currentUser.value) return false;

    try {
      const { error: updateError } = await supabase
        .from('model_reports')
        .update({
          status: resolution,
          resolution_notes: notes || null,
          resolved_by: currentUser.value.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to resolve report';
      return false;
    }
  }

  return {
    loading,
    error,
    fetchQueue,
    fetchStats,
    assignToMe,
    unassign,
    approveModel,
    rejectModel,
    requestChanges,
    fetchReports,
    resolveReport,
  };
}
