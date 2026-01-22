import { getAllAdapterPaths, readAdapterFile, getAssetUrl } from '../utils/filesystem';
import { AdapterYamlSchema } from '../schemas/adapter';

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
  fileFormat: 'csv' | 'binary';
  extensions: string[];
  branding?: AdapterBranding;
}

export default defineCachedEventHandler(
  async (): Promise<AdapterResponse[]> => {
    const adapters: AdapterResponse[] = [];

    try {
      // Get list of all adapter files from filesystem
      const adapterPaths = await getAllAdapterPaths();

      // Only process latest versions for the main listing
      const latestAdapters = adapterPaths.filter((a) => a.isLatest);

      // Read and parse each adapter file
      const fetchPromises = latestAdapters.map(async ({ vendor, id }) => {
        try {
          const { parsed } = await readAdapterFile(vendor, id);

          // Validate YAML structure with Zod
          const validationResult = AdapterYamlSchema.safeParse(parsed);

          if (!validationResult.success) {
            console.error(`Invalid adapter YAML ${vendor}/${id}:`, validationResult.error.format());
            return null; // Skip this adapter
          }

          const yaml = validationResult.data;

          // Extract unique categories from channels
          const categories = [...new Set(yaml.channels.map((c) => c.category))];

          // Build branding with full URLs
          const branding: AdapterBranding | undefined = yaml.branding
            ? {
                logo: yaml.branding.logo ? getAssetUrl('logos', yaml.branding.logo) : undefined,
                icon: yaml.branding.icon ? getAssetUrl('icons', yaml.branding.icon) : undefined,
                banner: yaml.branding.banner ? getAssetUrl('banners', yaml.branding.banner) : undefined,
                colorPrimary: yaml.branding.color_primary,
                colorSecondary: yaml.branding.color_secondary,
              }
            : undefined;

          // Safe description handling
          const description = yaml.description ? yaml.description.split('\n')[0].trim() : undefined;

          return {
            id: yaml.id,
            name: yaml.name,
            version: yaml.version,
            vendor: yaml.vendor,
            description,
            website: yaml.website,
            channelCount: yaml.channels.length,
            categories,
            fileFormat: yaml.file_format.type,
            extensions: yaml.file_format.extensions,
            branding,
          } as AdapterResponse;
        } catch (err) {
          console.error(`Failed to fetch adapter ${vendor}/${id}:`, err);
          return null;
        }
      });

      const results = await Promise.all(fetchPromises);
      adapters.push(...results.filter((a): a is AdapterResponse => a !== null));
    } catch (err) {
      console.error('Failed to fetch adapters from filesystem:', err);

      // Re-throw createError instances
      if (err && typeof err === 'object' && 'statusCode' in err) {
        throw err;
      }

      // Throw a proper error instead of returning empty array
      throw createError({
        statusCode: 500,
        statusMessage: 'Unable to fetch adapters from filesystem',
        data: {
          error: err instanceof Error ? err.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Sort by vendor, then by name
    return adapters.sort((a, b) => {
      const vendorCmp = a.vendor.localeCompare(b.vendor);
      if (vendorCmp !== 0) return vendorCmp;
      return a.name.localeCompare(b.name);
    });
  },
  {
    maxAge: 60 * 15, // Cache for 15 minutes
    name: 'adapters-list',
    getKey: () => 'all',
  }
);
