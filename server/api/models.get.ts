import { parse } from "yaml";
import {
  fetchAllModelPaths,
  fetchGitHubFile,
  getAssetUrl,
  getModelImageUrl,
} from "../utils/github";

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
  files: Array<{
    filename: string;
    format: string;
    primary?: boolean;
  }>;
  images?: Array<{
    filename: string;
    type: string;
    primary?: boolean;
  }>;
  printing: {
    recommended_material: string;
    estimated_time_hours?: number;
  };
}

interface ModelBranding {
  logo?: string;
  icon?: string;
  colorPrimary?: string;
  colorSecondary?: string;
}

interface ModelResponse {
  id: string;
  name: string;
  version: string;
  vendor?: string;
  description?: string;
  category: string;
  primaryImage?: string;
  recommendedMaterial: string;
  estimatedTimeHours?: number;
  fileFormats: string[];
  branding?: ModelBranding;
}

export default defineCachedEventHandler(
  async (): Promise<ModelResponse[]> => {
    const models: ModelResponse[] = [];

    try {
      // Fetch list of all model files from GitHub
      const modelPaths = await fetchAllModelPaths();

      // Fetch and parse each model file
      const fetchPromises = modelPaths.map(
        async ({ category, modelId, file }) => {
          try {
            const path = `models/${category}/${modelId}/${file}`;
            const content = await fetchGitHubFile(path);
            const yaml = parse(content) as ModelYaml;

            // Get primary image or first image
            const primaryImage = yaml.images?.find((img) => img.primary);
            const firstImage = yaml.images?.[0];
            const imageToUse = primaryImage || firstImage;

            // Get unique file formats
            const fileFormats = [
              ...new Set(yaml.files.map((f) => f.format.toUpperCase())),
            ];

            // Build branding with full URLs
            const branding: ModelBranding | undefined = yaml.branding
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
              : undefined;

            return {
              id: yaml.id,
              name: yaml.name,
              version: yaml.version,
              vendor: yaml.vendor,
              description: yaml.description?.split("\n")[0].trim(), // First line only
              category: yaml.category,
              primaryImage: imageToUse
                ? getModelImageUrl(category, modelId, imageToUse.filename)
                : undefined,
              recommendedMaterial: yaml.printing.recommended_material,
              estimatedTimeHours: yaml.printing.estimated_time_hours,
              fileFormats,
              branding,
            } as ModelResponse;
          } catch (err) {
            console.error(
              `Failed to fetch model ${category}/${modelId}/${file}:`,
              err,
            );
            return null;
          }
        },
      );

      const results = await Promise.all(fetchPromises);
      models.push(...results.filter((m): m is ModelResponse => m !== null));
    } catch (err) {
      console.error("Failed to fetch models from GitHub:", err);
    }

    // Sort by category, then by name
    return models.sort((a, b) => {
      const categoryCmp = a.category.localeCompare(b.category);
      if (categoryCmp !== 0) return categoryCmp;
      return a.name.localeCompare(b.name);
    });
  },
  {
    maxAge: 60 * 5, // Cache for 5 minutes
    name: "models-list",
    getKey: () => "all",
  },
);
