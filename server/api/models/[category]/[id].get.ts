import { parse } from "yaml";
import {
  fetchGitHubFile,
  getAssetUrl,
  getModelFileUrl,
  getModelImageUrl,
} from "../../../utils/github";

interface ModelYaml {
  openecualliance: string;
  type: "model";
  id: string;
  name: string;
  version: string;
  vendor?: string;
  description: string;
  category: "mounts" | "enclosures" | "brackets" | "adapters" | "accessories";
  branding?: {
    logo?: string;
    icon?: string;
    color_primary?: string;
    color_secondary?: string;
  };
  compatibility?: {
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
  };
  files: Array<{
    filename: string;
    format: string;
    description?: string;
    primary?: boolean;
    variant?: string;
  }>;
  images?: Array<{
    filename: string;
    type: string;
    description?: string;
    primary?: boolean;
  }>;
  printing: {
    recommended_material: string;
    alternative_materials?: string[];
    not_recommended_materials?: string[];
    layer_height?: number;
    infill_percent?: number;
    infill_pattern?: string;
    wall_count?: number;
    supports_required?: boolean;
    support_type?: string;
    orientation?: string;
    bed_adhesion?: string;
    estimated_time_hours?: number;
    estimated_filament_grams?: number;
    nozzle_size?: number;
    bed_temp_celsius?: number;
    hotend_temp_celsius?: number;
    notes?: string;
  };
  hardware?: Array<{
    item: string;
    quantity: number;
    optional?: boolean;
    notes?: string;
    purchase_url?: string;
  }>;
  assembly?: {
    difficulty?: string;
    estimated_time_minutes?: number;
    tools_required?: string[];
    steps?: string[];
    warnings?: string[];
  };
  metadata?: {
    author?: string;
    license?: string;
    source_url?: string;
    repository?: string;
    remix_of?: string;
    remixes_allowed?: boolean;
    commercial_use_allowed?: boolean;
    changelog?: Array<{
      version: string;
      date: string;
      changes: string[];
    }>;
  };
}

export default defineCachedEventHandler(
  async (event) => {
    const category = getRouterParam(event, "category");
    const id = getRouterParam(event, "id");

    if (!category || !id) {
      throw createError({
        statusCode: 400,
        message: "Missing category or id parameter",
      });
    }

    try {
      const path = `models/${category}/${id}/${id}.model.yaml`;
      const content = await fetchGitHubFile(path);
      const yaml = parse(content) as ModelYaml;

      // Transform to camelCase and add URLs
      return {
        openecualliance: yaml.openecualliance,
        type: yaml.type,
        id: yaml.id,
        name: yaml.name,
        version: yaml.version,
        vendor: yaml.vendor,
        description: yaml.description,
        category: yaml.category,
        branding: yaml.branding
          ? {
              logo: yaml.branding.logo
                ? getAssetUrl("logos", yaml.branding.logo)
                : undefined,
              icon: yaml.branding.icon
                ? getAssetUrl("icons", yaml.branding.icon)
                : undefined,
              colorPrimary: yaml.branding.color_primary,
              colorSecondary: yaml.branding.color_secondary,
            }
          : undefined,
        compatibility: yaml.compatibility,
        files: yaml.files.map((f) => ({
          filename: f.filename,
          format: f.format,
          description: f.description,
          primary: f.primary,
          variant: f.variant,
          downloadUrl: getModelFileUrl(category, id, f.filename),
        })),
        images: yaml.images?.map((img) => ({
          filename: img.filename,
          type: img.type,
          description: img.description,
          primary: img.primary,
          url: getModelImageUrl(category, id, img.filename),
        })),
        printing: {
          recommendedMaterial: yaml.printing.recommended_material,
          alternativeMaterials: yaml.printing.alternative_materials,
          notRecommendedMaterials: yaml.printing.not_recommended_materials,
          layerHeight: yaml.printing.layer_height,
          infillPercent: yaml.printing.infill_percent,
          infillPattern: yaml.printing.infill_pattern,
          wallCount: yaml.printing.wall_count,
          supportsRequired: yaml.printing.supports_required,
          supportType: yaml.printing.support_type,
          orientation: yaml.printing.orientation,
          bedAdhesion: yaml.printing.bed_adhesion,
          estimatedTimeHours: yaml.printing.estimated_time_hours,
          estimatedFilamentGrams: yaml.printing.estimated_filament_grams,
          nozzleSize: yaml.printing.nozzle_size,
          bedTempCelsius: yaml.printing.bed_temp_celsius,
          hotendTempCelsius: yaml.printing.hotend_temp_celsius,
          notes: yaml.printing.notes,
        },
        hardware: yaml.hardware?.map((h) => ({
          item: h.item,
          quantity: h.quantity,
          optional: h.optional,
          notes: h.notes,
          purchaseUrl: h.purchase_url,
        })),
        assembly: yaml.assembly
          ? {
              difficulty: yaml.assembly.difficulty,
              estimatedTimeMinutes: yaml.assembly.estimated_time_minutes,
              toolsRequired: yaml.assembly.tools_required,
              steps: yaml.assembly.steps,
              warnings: yaml.assembly.warnings,
            }
          : undefined,
        metadata: yaml.metadata
          ? {
              author: yaml.metadata.author,
              license: yaml.metadata.license,
              sourceUrl: yaml.metadata.source_url,
              repository: yaml.metadata.repository,
              remixOf: yaml.metadata.remix_of,
              remixesAllowed: yaml.metadata.remixes_allowed,
              commercialUseAllowed: yaml.metadata.commercial_use_allowed,
              changelog: yaml.metadata.changelog,
            }
          : undefined,
      };
    } catch (err) {
      console.error(`Failed to fetch model ${category}/${id}:`, err);
      throw createError({
        statusCode: 404,
        message: `Model not found: ${category}/${id}`,
      });
    }
  },
  {
    maxAge: 60 * 5,
    name: "model-detail",
    getKey: (event) => {
      const category = getRouterParam(event, "category");
      const id = getRouterParam(event, "id");
      return `${category}/${id}`;
    },
  },
);
