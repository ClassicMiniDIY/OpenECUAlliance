import { parse } from "yaml";
import {
  fetchAllAdapterPaths,
  fetchGitHubFile,
  getAssetUrl,
} from "../utils/github";

interface AdapterYaml {
  openecualliance: string;
  id: string;
  name: string;
  version: string;
  vendor: string;
  description?: string;
  website?: string;
  branding?: {
    logo?: string;
    icon?: string;
    banner?: string;
    color_primary?: string;
    color_secondary?: string;
  };
  file_format: {
    type: "csv" | "binary";
    extensions: string[];
  };
  channels: Array<{
    id: string;
    name: string;
    description?: string;
    category: string;
    data_type: string;
    unit: string;
    source_names: string[];
  }>;
  metadata?: {
    author?: string;
    license?: string;
    tested_with?: string[];
    known_issues?: string[];
  };
}

interface AdapterBranding {
  logo?: string;
  icon?: string;
  banner?: string;
  colorPrimary?: string;
  colorSecondary?: string;
}

interface AdapterResponse {
  id: string;
  name: string;
  version: string;
  vendor: string;
  description?: string;
  website?: string;
  channelCount: number;
  categories: string[];
  fileFormat: "csv" | "binary";
  extensions: string[];
  branding?: AdapterBranding;
}

export default defineCachedEventHandler(
  async (): Promise<AdapterResponse[]> => {
    const adapters: AdapterResponse[] = [];

    try {
      // Fetch list of all adapter files from GitHub
      const adapterPaths = await fetchAllAdapterPaths();

      // Fetch and parse each adapter file
      const fetchPromises = adapterPaths.map(async ({ vendor, file }) => {
        try {
          const path = `adapters/${vendor}/${file}`;
          const content = await fetchGitHubFile(path);
          const yaml = parse(content) as AdapterYaml;

          // Extract unique categories from channels
          const categories = [...new Set(yaml.channels.map((c) => c.category))];

          // Build branding with full URLs
          const branding: AdapterBranding | undefined = yaml.branding
            ? {
                logo: yaml.branding.logo
                  ? getAssetUrl("logos", yaml.branding.logo)
                  : undefined,
                icon: yaml.branding.icon
                  ? getAssetUrl("icons", yaml.branding.icon)
                  : undefined,
                banner: yaml.branding.banner
                  ? getAssetUrl("banners", yaml.branding.banner)
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
            website: yaml.website,
            channelCount: yaml.channels.length,
            categories,
            fileFormat: yaml.file_format.type,
            extensions: yaml.file_format.extensions,
            branding,
          } as AdapterResponse;
        } catch (err) {
          console.error(`Failed to fetch adapter ${vendor}/${file}:`, err);
          return null;
        }
      });

      const results = await Promise.all(fetchPromises);
      adapters.push(...results.filter((a): a is AdapterResponse => a !== null));
    } catch (err) {
      console.error("Failed to fetch adapters from GitHub:", err);
    }

    // Sort by vendor, then by name
    return adapters.sort((a, b) => {
      const vendorCmp = a.vendor.localeCompare(b.vendor);
      if (vendorCmp !== 0) return vendorCmp;
      return a.name.localeCompare(b.name);
    });
  },
  {
    maxAge: 60 * 5, // Cache for 5 minutes
    name: "adapters-list",
    getKey: () => "all",
  },
);
