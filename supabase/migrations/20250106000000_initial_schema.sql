-- OpenECU Alliance Database Schema
-- This migration creates all tables for the 3D Models user system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- ENUMS
-- ===========================================

CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE model_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'flagged');
CREATE TYPE model_category AS ENUM ('mounts', 'enclosures', 'brackets', 'adapters', 'accessories');
CREATE TYPE file_format AS ENUM ('stl', 'step', 'stp', '3mf', 'obj', 'iges', 'igs', 'f3d', 'f3z');
CREATE TYPE image_type AS ENUM ('render', 'photo', 'diagram');
CREATE TYPE moderation_action AS ENUM ('new_submission', 'update', 'report', 'appeal');
CREATE TYPE moderation_status AS ENUM ('pending', 'in_progress', 'resolved');
CREATE TYPE moderation_resolution AS ENUM ('approved', 'rejected', 'needs_changes', 'escalated');
CREATE TYPE report_reason AS ENUM ('spam', 'inappropriate', 'copyright', 'incorrect_info', 'broken_files', 'duplicate', 'other');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

-- ===========================================
-- PROFILES
-- ===========================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  location TEXT,
  github_username TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  models_count INTEGER DEFAULT 0 NOT NULL,
  likes_received INTEGER DEFAULT 0 NOT NULL,
  email_notifications BOOLEAN DEFAULT true NOT NULL,
  is_banned BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$')
);

CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ===========================================
-- MODELS
-- ===========================================

CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  version TEXT DEFAULT '1.0.0' NOT NULL,
  description TEXT NOT NULL,
  category model_category NOT NULL,
  vendor TEXT,
  compatibility JSONB DEFAULT '[]'::JSONB,
  printing JSONB NOT NULL DEFAULT '{}'::JSONB,
  hardware JSONB DEFAULT '[]'::JSONB,
  assembly JSONB DEFAULT '[]'::JSONB,
  license TEXT DEFAULT 'CC-BY-SA-4.0' NOT NULL,

  -- Stats (denormalized for performance)
  likes_count INTEGER DEFAULT 0 NOT NULL,
  comments_count INTEGER DEFAULT 0 NOT NULL,
  downloads_count INTEGER DEFAULT 0 NOT NULL,
  average_rating DECIMAL(2,1) DEFAULT 0,
  ratings_count INTEGER DEFAULT 0 NOT NULL,

  -- Moderation
  status model_status DEFAULT 'draft' NOT NULL,
  moderation_notes TEXT,
  moderated_by UUID REFERENCES profiles(id),
  moderated_at TIMESTAMPTZ,

  -- Publishing
  is_published BOOLEAN DEFAULT false NOT NULL,
  featured BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ,

  CONSTRAINT name_length CHECK (char_length(name) >= 3 AND char_length(name) <= 100),
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE INDEX idx_models_author ON models(author_id);
CREATE INDEX idx_models_category ON models(category);
CREATE INDEX idx_models_status ON models(status);
CREATE INDEX idx_models_published ON models(is_published, published_at DESC);
CREATE INDEX idx_models_featured ON models(featured) WHERE featured = true;
CREATE INDEX idx_models_slug ON models(slug);

-- ===========================================
-- MODEL FILES
-- ===========================================

CREATE TABLE model_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  format file_format NOT NULL,
  storage_path TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  is_primary BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_model_files_model ON model_files(model_id);

-- ===========================================
-- MODEL IMAGES
-- ===========================================

CREATE TABLE model_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  type image_type DEFAULT 'render' NOT NULL,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  is_primary BOOLEAN DEFAULT false NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_model_images_model ON model_images(model_id);

-- ===========================================
-- MODEL LIKES
-- ===========================================

CREATE TABLE model_likes (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, model_id)
);

CREATE INDEX idx_model_likes_model ON model_likes(model_id);
CREATE INDEX idx_model_likes_user ON model_likes(user_id);

-- ===========================================
-- MODEL COMMENTS
-- ===========================================

CREATE TABLE model_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES model_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT false NOT NULL,
  is_edited BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 2000)
);

CREATE INDEX idx_model_comments_model ON model_comments(model_id);
CREATE INDEX idx_model_comments_author ON model_comments(author_id);
CREATE INDEX idx_model_comments_parent ON model_comments(parent_id);

-- ===========================================
-- MODEL RATINGS
-- ===========================================

CREATE TABLE model_ratings (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, model_id),

  CONSTRAINT rating_range CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT review_length CHECK (review IS NULL OR char_length(review) <= 2000)
);

CREATE INDEX idx_model_ratings_model ON model_ratings(model_id);

-- ===========================================
-- MODEL DOWNLOADS
-- ===========================================

CREATE TABLE model_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES model_files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_model_downloads_model ON model_downloads(model_id);
CREATE INDEX idx_model_downloads_date ON model_downloads(created_at);

-- ===========================================
-- MODERATION QUEUE
-- ===========================================

CREATE TABLE moderation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  action_type moderation_action NOT NULL,
  priority INTEGER DEFAULT 0 NOT NULL,
  status moderation_status DEFAULT 'pending' NOT NULL,
  resolution moderation_resolution,
  resolution_notes TEXT,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX idx_moderation_queue_model ON moderation_queue(model_id);
CREATE INDEX idx_moderation_queue_assigned ON moderation_queue(assigned_to) WHERE assigned_to IS NOT NULL;

-- ===========================================
-- MODEL REPORTS
-- ===========================================

CREATE TABLE model_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason report_reason NOT NULL,
  details TEXT,
  status report_status DEFAULT 'pending' NOT NULL,
  resolution_notes TEXT,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_model_reports_model ON model_reports(model_id);
CREATE INDEX idx_model_reports_status ON model_reports(status);

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update model likes count
CREATE OR REPLACE FUNCTION update_model_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE models SET likes_count = likes_count + 1 WHERE id = NEW.model_id;
    UPDATE profiles SET likes_received = likes_received + 1
      WHERE id = (SELECT author_id FROM models WHERE id = NEW.model_id);
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE models SET likes_count = likes_count - 1 WHERE id = OLD.model_id;
    UPDATE profiles SET likes_received = likes_received - 1
      WHERE id = (SELECT author_id FROM models WHERE id = OLD.model_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update model comments count
CREATE OR REPLACE FUNCTION update_model_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE models SET comments_count = comments_count + 1 WHERE id = NEW.model_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE models SET comments_count = comments_count - 1 WHERE id = OLD.model_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update model ratings stats
CREATE OR REPLACE FUNCTION update_model_ratings_stats()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(2,1);
  total_ratings INTEGER;
BEGIN
  SELECT AVG(rating)::DECIMAL(2,1), COUNT(*)
  INTO avg_rating, total_ratings
  FROM model_ratings
  WHERE model_id = COALESCE(NEW.model_id, OLD.model_id);

  UPDATE models
  SET average_rating = COALESCE(avg_rating, 0), ratings_count = total_ratings
  WHERE id = COALESCE(NEW.model_id, OLD.model_id);

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update user models count
CREATE OR REPLACE FUNCTION update_user_models_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.is_published = true THEN
    UPDATE profiles SET models_count = models_count + 1 WHERE id = NEW.author_id;
  ELSIF TG_OP = 'DELETE' AND OLD.is_published = true THEN
    UPDATE profiles SET models_count = models_count - 1 WHERE id = OLD.author_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_published = false AND NEW.is_published = true THEN
      UPDATE profiles SET models_count = models_count + 1 WHERE id = NEW.author_id;
    ELSIF OLD.is_published = true AND NEW.is_published = false THEN
      UPDATE profiles SET models_count = models_count - 1 WHERE id = NEW.author_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Updated at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_models_updated_at
  BEFORE UPDATE ON models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_model_comments_updated_at
  BEFORE UPDATE ON model_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_model_ratings_updated_at
  BEFORE UPDATE ON model_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_moderation_queue_updated_at
  BEFORE UPDATE ON moderation_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Stats triggers
CREATE TRIGGER update_likes_count
  AFTER INSERT OR DELETE ON model_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_model_likes_count();

CREATE TRIGGER update_comments_count
  AFTER INSERT OR DELETE ON model_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_model_comments_count();

CREATE TRIGGER update_ratings_stats
  AFTER INSERT OR UPDATE OR DELETE ON model_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_model_ratings_stats();

CREATE TRIGGER update_models_count
  AFTER INSERT OR UPDATE OR DELETE ON models
  FOR EACH ROW
  EXECUTE FUNCTION update_user_models_count();

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Models policies
CREATE POLICY "Published models are viewable by everyone"
  ON models FOR SELECT
  USING (is_published = true OR author_id = auth.uid());

CREATE POLICY "Users can create models"
  ON models FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own models"
  ON models FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own draft models"
  ON models FOR DELETE
  USING (auth.uid() = author_id AND status = 'draft');

-- Model files policies
CREATE POLICY "Files viewable for published models or by owner"
  ON model_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM models
      WHERE models.id = model_id
      AND (models.is_published = true OR models.author_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage files for own models"
  ON model_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM models
      WHERE models.id = model_id
      AND models.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete files from own models"
  ON model_files FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM models
      WHERE models.id = model_id
      AND models.author_id = auth.uid()
    )
  );

-- Model images policies
CREATE POLICY "Images viewable for published models or by owner"
  ON model_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM models
      WHERE models.id = model_id
      AND (models.is_published = true OR models.author_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage images for own models"
  ON model_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM models
      WHERE models.id = model_id
      AND models.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images from own models"
  ON model_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM models
      WHERE models.id = model_id
      AND models.author_id = auth.uid()
    )
  );

-- Model likes policies
CREATE POLICY "Likes are viewable by everyone"
  ON model_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like models"
  ON model_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike models"
  ON model_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Model comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON model_comments FOR SELECT
  USING (is_hidden = false OR author_id = auth.uid());

CREATE POLICY "Users can create comments"
  ON model_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own comments"
  ON model_comments FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments"
  ON model_comments FOR DELETE
  USING (auth.uid() = author_id);

-- Model ratings policies
CREATE POLICY "Ratings are viewable by everyone"
  ON model_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can rate models"
  ON model_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON model_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
  ON model_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Model downloads policies
CREATE POLICY "Downloads are insertable by anyone"
  ON model_downloads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Download stats viewable by model owner"
  ON model_downloads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM models
      WHERE models.id = model_id
      AND models.author_id = auth.uid()
    )
  );

-- Model reports policies
CREATE POLICY "Users can create reports"
  ON model_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
  ON model_reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- ===========================================
-- ADMIN POLICIES
-- ===========================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is moderator or admin
CREATE OR REPLACE FUNCTION is_moderator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('moderator', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin/Moderator policies for models
CREATE POLICY "Admins can view all models"
  ON models FOR SELECT
  USING (is_moderator());

CREATE POLICY "Admins can update any model"
  ON models FOR UPDATE
  USING (is_moderator());

-- Admin/Moderator policies for moderation queue
CREATE POLICY "Moderators can view queue"
  ON moderation_queue FOR SELECT
  USING (is_moderator());

CREATE POLICY "Moderators can update queue"
  ON moderation_queue FOR UPDATE
  USING (is_moderator());

CREATE POLICY "System can insert to queue"
  ON moderation_queue FOR INSERT
  WITH CHECK (true);

-- Admin policies for reports
CREATE POLICY "Moderators can view all reports"
  ON model_reports FOR SELECT
  USING (is_moderator());

CREATE POLICY "Moderators can update reports"
  ON model_reports FOR UPDATE
  USING (is_moderator());

-- Admin policies for comments (hide/unhide)
CREATE POLICY "Moderators can update any comment"
  ON model_comments FOR UPDATE
  USING (is_moderator());
