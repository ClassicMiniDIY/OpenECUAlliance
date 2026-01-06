export interface ModelBranding {
  logo?: string;
  icon?: string;
  colorPrimary?: string;
  colorSecondary?: string;
}

export type ModelCategory = "mounts" | "enclosures" | "brackets" | "adapters" | "accessories";

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
  format: "stl" | "step" | "3mf" | "obj" | "iges" | "f3d" | "f3z" | "stp" | "igs";
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
