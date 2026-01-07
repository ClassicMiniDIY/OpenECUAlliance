export interface ModelBranding {
  logo?: string;
  icon?: string;
  colorPrimary?: string;
  colorSecondary?: string;
}

export type ModelCategory =
  | "mounts"
  | "enclosures"
  | "brackets"
  | "adapters"
  | "accessories";

export interface ModelCompatibility {
  ecus?: Array<{
    vendor: string;
    models?: string[];
  }>;
  vehicles?: Array<{
    make?: string;
    model?: string;
    years?: {
      from?: number;
      to?: number;
    };
  }>;
  notes?: string;
}

export interface ModelFile {
  filename: string;
  format:
    | "stl"
    | "step"
    | "3mf"
    | "obj"
    | "iges"
    | "f3d"
    | "f3z"
    | "stp"
    | "igs";
  description?: string;
  primary?: boolean;
  variant?: string;
  sizeBytes?: number;
}

export interface ModelImage {
  filename: string;
  type: "render" | "photo" | "diagram" | "screenshot";
  description?: string;
  primary?: boolean;
}

export interface PrintSettings {
  recommendedMaterial: string;
  alternativeMaterials?: string[];
  notRecommendedMaterials?: string[];
  layerHeight?: number;
  infillPercent?: number;
  infillPattern?: string;
  wallCount?: number;
  supportsRequired?: boolean;
  supportType?: "normal" | "tree" | "organic" | "none";
  orientation?: string;
  bedAdhesion?: "none" | "brim" | "raft" | "skirt";
  estimatedTimeHours?: number;
  estimatedFilamentGrams?: number;
  nozzleSize?: number;
  bedTempCelsius?: number;
  hotendTempCelsius?: number;
  notes?: string;
}

export interface HardwareItem {
  item: string;
  quantity: number;
  optional?: boolean;
  notes?: string;
  purchaseUrl?: string;
}

export interface AssemblyInstructions {
  difficulty?: "easy" | "moderate" | "advanced";
  estimatedTimeMinutes?: number;
  toolsRequired?: string[];
  steps?: string[];
  warnings?: string[];
}

export interface ModelMetadata {
  author?: string;
  license?: string;
  sourceUrl?: string;
  repository?: string;
  remixOf?: string;
  remixesAllowed?: boolean;
  commercialUseAllowed?: boolean;
  changelog?: Array<{
    version: string;
    date: string;
    changes: string[];
  }>;
}

export type ModelStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "flagged"
  | "archived";

/**
 * Author info for user-submitted models
 */
export interface ModelAuthor {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

/**
 * User-submitted model for list views
 */
export interface UserModel {
  id: string;
  slug: string;
  name: string;
  version: string;
  description: string;
  category: ModelCategory;
  vendor: string | null;
  author: ModelAuthor;
  primaryImage: string | null;
  primaryImageThumbnail: string | null;
  recommendedMaterial: string;
  estimatedTimeHours: number | null;
  fileFormats: string[];
  license: string;
  likesCount: number;
  commentsCount: number;
  downloadsCount: number;
  averageRating: number;
  ratingsCount: number;
  status: ModelStatus;
  isPublished: boolean;
  featured: boolean;
  createdAt: string;
  publishedAt: string | null;
}

/**
 * Full user-submitted model detail
 */
export interface UserModelDetail
  extends Omit<
    UserModel,
    | "fileFormats"
    | "primaryImage"
    | "primaryImageThumbnail"
    | "recommendedMaterial"
    | "estimatedTimeHours"
  > {
  compatibility: ModelCompatibility | null;
  files: UserModelFile[];
  images: UserModelImage[];
  printing: PrintSettings;
  hardware: HardwareItem[];
  assembly: AssemblyInstructions | null;
  sourceUrl: string | null;
  remixOf: string | null;
  remixesAllowed: boolean;
  commercialUseAllowed: boolean;
  isLikedByUser?: boolean;
  userRating?: number | null;
}

/**
 * Model file with storage info
 */
export interface UserModelFile {
  id: string;
  filename: string;
  originalFilename: string;
  format: string;
  downloadUrl: string;
  sizeBytes: number;
  isPrimary: boolean;
}

/**
 * Model image with storage info
 */
export interface UserModelImage {
  id: string;
  filename: string;
  type: "render" | "photo" | "diagram" | "screenshot";
  url: string;
  thumbnailUrl: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

/**
 * Form data for creating/updating a model
 */
export interface ModelFormData {
  name: string;
  description: string;
  category: ModelCategory;
  vendor?: string;
  compatibility?: ModelCompatibility;
  printing: PrintSettings;
  hardware?: HardwareItem[];
  assembly?: AssemblyInstructions;
  license: string;
  sourceUrl?: string;
  remixOf?: string;
  remixesAllowed: boolean;
  commercialUseAllowed: boolean;
}

/**
 * Pending file upload (before model is saved)
 */
export interface PendingFileUpload {
  id: string;
  file: File;
  filename: string;
  format: string;
  sizeBytes: number;
  description?: string;
  variant?: string;
  isPrimary: boolean;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
}

/**
 * Pending image upload (before model is saved)
 */
export interface PendingImageUpload {
  id: string;
  file: File;
  filename: string;
  type: "render" | "photo" | "diagram" | "screenshot";
  description?: string;
  previewUrl: string;
  sizeBytes: number;
  isPrimary: boolean;
  sortOrder: number;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
}

/**
 * Summary model for list views
 */
export interface Model {
  id: string;
  name: string;
  version: string;
  vendor?: string;
  description?: string;
  category: ModelCategory;
  primaryImage?: string;
  recommendedMaterial: string;
  estimatedTimeHours?: number;
  fileFormats: string[];
  branding?: ModelBranding;
}

/**
 * Full model detail for detail views
 */
export interface ModelDetail {
  openecualliance: string;
  type: "model";
  id: string;
  name: string;
  version: string;
  vendor?: string;
  description: string;
  category: ModelCategory;
  compatibility?: ModelCompatibility;
  files: ModelFile[];
  images?: ModelImage[];
  printing: PrintSettings;
  hardware?: HardwareItem[];
  assembly?: AssemblyInstructions;
  branding?: ModelBranding;
  metadata?: ModelMetadata;
}
