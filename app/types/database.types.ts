export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          website: string | null;
          location: string | null;
          github_username: string | null;
          email_notifications: boolean;
          models_count: number;
          likes_received: number;
          role: "user" | "moderator" | "admin";
          is_banned: boolean;
          banned_reason: string | null;
          banned_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          location?: string | null;
          github_username?: string | null;
          email_notifications?: boolean;
          models_count?: number;
          likes_received?: number;
          role?: "user" | "moderator" | "admin";
          is_banned?: boolean;
          banned_reason?: string | null;
          banned_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          location?: string | null;
          github_username?: string | null;
          email_notifications?: boolean;
          models_count?: number;
          likes_received?: number;
          role?: "user" | "moderator" | "admin";
          is_banned?: boolean;
          banned_reason?: string | null;
          banned_until?: string | null;
          updated_at?: string;
        };
      };
      models: {
        Row: {
          id: string;
          slug: string;
          author_id: string;
          name: string;
          version: string;
          description: string;
          category:
            | "mounts"
            | "enclosures"
            | "brackets"
            | "adapters"
            | "accessories";
          vendor: string | null;
          compatibility: Json | null;
          printing: Json;
          hardware: Json | null;
          assembly: Json | null;
          license: string;
          source_url: string | null;
          remix_of: string | null;
          remixes_allowed: boolean;
          commercial_use_allowed: boolean;
          likes_count: number;
          comments_count: number;
          downloads_count: number;
          average_rating: number;
          ratings_count: number;
          status: "pending" | "approved" | "rejected" | "flagged" | "archived";
          moderation_notes: string | null;
          moderated_by: string | null;
          moderated_at: string | null;
          is_published: boolean;
          featured: boolean;
          featured_at: string | null;
          created_at: string;
          updated_at: string;
          published_at: string | null;
          is_linked: boolean;
          external_platform: string | null;
          external_url: string | null;
          external_id: string | null;
          external_author_name: string | null;
          external_author_url: string | null;
          last_synced_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          author_id: string;
          name: string;
          version?: string;
          description: string;
          category:
            | "mounts"
            | "enclosures"
            | "brackets"
            | "adapters"
            | "accessories";
          vendor?: string | null;
          compatibility?: Json | null;
          printing: Json;
          hardware?: Json | null;
          assembly?: Json | null;
          license?: string;
          source_url?: string | null;
          remix_of?: string | null;
          remixes_allowed?: boolean;
          commercial_use_allowed?: boolean;
          likes_count?: number;
          comments_count?: number;
          downloads_count?: number;
          average_rating?: number;
          ratings_count?: number;
          status?: "pending" | "approved" | "rejected" | "flagged" | "archived";
          moderation_notes?: string | null;
          moderated_by?: string | null;
          moderated_at?: string | null;
          is_published?: boolean;
          featured?: boolean;
          featured_at?: string | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          is_linked?: boolean;
          external_platform?: string | null;
          external_url?: string | null;
          external_id?: string | null;
          external_author_name?: string | null;
          external_author_url?: string | null;
          last_synced_at?: string | null;
        };
        Update: {
          slug?: string;
          author_id?: string;
          name?: string;
          version?: string;
          description?: string;
          category?:
            | "mounts"
            | "enclosures"
            | "brackets"
            | "adapters"
            | "accessories";
          vendor?: string | null;
          compatibility?: Json | null;
          printing?: Json;
          hardware?: Json | null;
          assembly?: Json | null;
          license?: string;
          source_url?: string | null;
          remix_of?: string | null;
          remixes_allowed?: boolean;
          commercial_use_allowed?: boolean;
          likes_count?: number;
          comments_count?: number;
          downloads_count?: number;
          average_rating?: number;
          ratings_count?: number;
          status?: "pending" | "approved" | "rejected" | "flagged" | "archived";
          moderation_notes?: string | null;
          moderated_by?: string | null;
          moderated_at?: string | null;
          is_published?: boolean;
          featured?: boolean;
          featured_at?: string | null;
          updated_at?: string;
          published_at?: string | null;
          is_linked?: boolean;
          external_platform?: string | null;
          external_url?: string | null;
          external_id?: string | null;
          external_author_name?: string | null;
          external_author_url?: string | null;
          last_synced_at?: string | null;
        };
      };
      model_files: {
        Row: {
          id: string;
          model_id: string;
          filename: string;
          original_filename: string;
          format: string;
          description: string | null;
          variant: string | null;
          storage_path: string;
          size_bytes: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          model_id: string;
          filename: string;
          original_filename: string;
          format: string;
          description?: string | null;
          variant?: string | null;
          storage_path: string;
          size_bytes: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          model_id?: string;
          filename?: string;
          original_filename?: string;
          format?: string;
          description?: string | null;
          variant?: string | null;
          storage_path?: string;
          size_bytes?: number;
          is_primary?: boolean;
        };
      };
      model_images: {
        Row: {
          id: string;
          model_id: string;
          filename: string;
          original_filename: string;
          type: "render" | "photo" | "diagram" | "screenshot";
          description: string | null;
          storage_path: string;
          thumbnail_path: string | null;
          size_bytes: number;
          width: number | null;
          height: number | null;
          is_primary: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          model_id: string;
          filename: string;
          original_filename: string;
          type: "render" | "photo" | "diagram" | "screenshot";
          description?: string | null;
          storage_path: string;
          thumbnail_path?: string | null;
          size_bytes: number;
          width?: number | null;
          height?: number | null;
          is_primary?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          model_id?: string;
          filename?: string;
          original_filename?: string;
          type?: "render" | "photo" | "diagram" | "screenshot";
          description?: string | null;
          storage_path?: string;
          thumbnail_path?: string | null;
          size_bytes?: number;
          width?: number | null;
          height?: number | null;
          is_primary?: boolean;
          sort_order?: number;
        };
      };
      model_likes: {
        Row: {
          user_id: string;
          model_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          model_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          model_id?: string;
        };
      };
      model_comments: {
        Row: {
          id: string;
          model_id: string;
          author_id: string;
          parent_id: string | null;
          content: string;
          is_hidden: boolean;
          hidden_reason: string | null;
          hidden_by: string | null;
          is_edited: boolean;
          edited_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          model_id: string;
          author_id: string;
          parent_id?: string | null;
          content: string;
          is_hidden?: boolean;
          hidden_reason?: string | null;
          hidden_by?: string | null;
          is_edited?: boolean;
          edited_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          model_id?: string;
          author_id?: string;
          parent_id?: string | null;
          content?: string;
          is_hidden?: boolean;
          hidden_reason?: string | null;
          hidden_by?: string | null;
          is_edited?: boolean;
          edited_at?: string | null;
          updated_at?: string;
        };
      };
      model_ratings: {
        Row: {
          user_id: string;
          model_id: string;
          rating: number;
          review: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          model_id: string;
          rating: number;
          review?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          rating?: number;
          review?: string | null;
          updated_at?: string;
        };
      };
      model_downloads: {
        Row: {
          id: string;
          model_id: string;
          file_id: string;
          user_id: string | null;
          ip_hash: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          model_id: string;
          file_id: string;
          user_id?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          model_id?: string;
          file_id?: string;
          user_id?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
        };
      };
      moderation_queue: {
        Row: {
          id: string;
          model_id: string;
          action_type: "new_submission" | "update" | "report" | "appeal";
          priority: number;
          assigned_to: string | null;
          assigned_at: string | null;
          status: "pending" | "in_progress" | "resolved";
          resolution:
            | "approved"
            | "rejected"
            | "needs_changes"
            | "escalated"
            | null;
          resolution_notes: string | null;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          model_id: string;
          action_type: "new_submission" | "update" | "report" | "appeal";
          priority?: number;
          assigned_to?: string | null;
          assigned_at?: string | null;
          status?: "pending" | "in_progress" | "resolved";
          resolution?:
            | "approved"
            | "rejected"
            | "needs_changes"
            | "escalated"
            | null;
          resolution_notes?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          model_id?: string;
          action_type?: "new_submission" | "update" | "report" | "appeal";
          priority?: number;
          assigned_to?: string | null;
          assigned_at?: string | null;
          status?: "pending" | "in_progress" | "resolved";
          resolution?:
            | "approved"
            | "rejected"
            | "needs_changes"
            | "escalated"
            | null;
          resolution_notes?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          updated_at?: string;
        };
      };
      model_reports: {
        Row: {
          id: string;
          model_id: string;
          reporter_id: string;
          reason:
            | "spam"
            | "inappropriate"
            | "copyright"
            | "incorrect_info"
            | "broken_files"
            | "duplicate"
            | "other";
          details: string | null;
          status: "pending" | "reviewed" | "resolved" | "dismissed";
          resolution_notes: string | null;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          model_id: string;
          reporter_id: string;
          reason:
            | "spam"
            | "inappropriate"
            | "copyright"
            | "incorrect_info"
            | "broken_files"
            | "duplicate"
            | "other";
          details?: string | null;
          status?: "pending" | "reviewed" | "resolved" | "dismissed";
          resolution_notes?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          model_id?: string;
          reporter_id?: string;
          reason?:
            | "spam"
            | "inappropriate"
            | "copyright"
            | "incorrect_info"
            | "broken_files"
            | "duplicate"
            | "other";
          details?: string | null;
          status?: "pending" | "reviewed" | "resolved" | "dismissed";
          resolution_notes?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      model_category:
        | "mounts"
        | "enclosures"
        | "brackets"
        | "adapters"
        | "accessories";
      model_status:
        | "pending"
        | "approved"
        | "rejected"
        | "flagged"
        | "archived";
      user_role: "user" | "moderator" | "admin";
      image_type: "render" | "photo" | "diagram" | "screenshot";
      moderation_action: "new_submission" | "update" | "report" | "appeal";
      moderation_resolution:
        | "approved"
        | "rejected"
        | "needs_changes"
        | "escalated";
      report_reason:
        | "spam"
        | "inappropriate"
        | "copyright"
        | "incorrect_info"
        | "broken_files"
        | "duplicate"
        | "other";
      report_status: "pending" | "reviewed" | "resolved" | "dismissed";
      external_platform:
        | "makerworld"
        | "printables"
        | "thingiverse"
        | "cults3d";
    };
  };
};

// Helper types for easier usage
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
