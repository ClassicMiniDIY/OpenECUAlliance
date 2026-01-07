import type { Tables } from './database.types';

/**
 * User profile from database
 */
export type Profile = Tables<'profiles'>;

/**
 * Public profile view (excludes sensitive fields)
 */
export interface PublicProfile {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  githubUsername: string | null;
  role: 'user' | 'moderator' | 'admin';
  modelsCount: number;
  likesReceived: number;
  createdAt: string;
}

/**
 * Current user with role info
 */
export interface CurrentUser {
  id: string;
  email: string;
  profile: Profile | null;
  isAdmin: boolean;
  isModerator: boolean;
}

/**
 * Comment with author info
 */
export interface Comment {
  id: string;
  modelId: string;
  author: PublicProfile;
  parentId: string | null;
  content: string;
  isHidden: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

/**
 * Rating with optional review
 */
export interface Rating {
  userId: string;
  modelId: string;
  rating: number;
  review: string | null;
  author: PublicProfile;
  createdAt: string;
}

/**
 * Moderation queue item
 */
export interface ModerationQueueItem {
  id: string;
  modelId: string;
  actionType: 'new_submission' | 'update' | 'report' | 'appeal';
  priority: number;
  status: 'pending' | 'in_progress' | 'resolved';
  resolution: 'approved' | 'rejected' | 'needs_changes' | 'escalated' | null;
  resolutionNotes: string | null;
  assignedTo: PublicProfile | null;
  resolvedBy: PublicProfile | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Model report
 */
export interface ModelReport {
  id: string;
  modelId: string;
  reporter: PublicProfile;
  reason: 'spam' | 'inappropriate' | 'copyright' | 'incorrect_info' | 'broken_files' | 'duplicate' | 'other';
  details: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  resolutionNotes: string | null;
  resolvedBy: PublicProfile | null;
  createdAt: string;
}

/**
 * Auth provider types
 */
export type AuthProvider = 'google' | 'apple' | 'email';

/**
 * Login form data
 */
export interface LoginFormData {
  email: string;
  provider?: AuthProvider;
}

/**
 * Profile update form data
 */
export interface ProfileUpdateData {
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  location?: string;
  githubUsername?: string;
  emailNotifications?: boolean;
}
