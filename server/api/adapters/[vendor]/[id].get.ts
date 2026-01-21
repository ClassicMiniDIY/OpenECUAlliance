import { parse } from 'yaml';
import { fetchGitHubFile, getAssetUrl } from '../../../utils/github';
import { AdapterYamlSchema, type AdapterYaml } from '../../../schemas/adapter';

export default defineCachedEventHandler(
  async (event) => {
    const vendor = getRouterParam(event, 'vendor');
    const id = getRouterParam(event, 'id');

    // Validate inputs exist
    if (!vendor || !id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing vendor or adapter id',
      });
    }

    // Prevent path traversal attacks
    if (vendor.includes('/') || vendor.includes('..') || id.includes('/') || id.includes('..')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid vendor or adapter id',
      });
    }

    // Additional validation: alphanumeric, dash, underscore only
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(vendor) || !validPattern.test(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid vendor or adapter id format',
      });
    }

    try {
      const path = `adapters/${vendor}/${id}.adapter.yaml`;
      const content = await fetchGitHubFile(path);
      const parsedYaml = parse(content);

      // Validate YAML structure with Zod
      const validationResult = AdapterYamlSchema.safeParse(parsedYaml);

      if (!validationResult.success) {
        console.error(`Invalid adapter YAML ${vendor}/${id}:`, validationResult.error.format());
        throw createError({
          statusCode: 500,
          statusMessage: 'Adapter file is malformed',
          data: {
            errors: validationResult.error.format(),
          },
        });
      }

      const yaml = validationResult.data;

      // Build branding with full URLs
      const branding = yaml.branding
        ? {
            logo: yaml.branding.logo ? getAssetUrl('logos', yaml.branding.logo) : undefined,
            icon: yaml.branding.icon ? getAssetUrl('icons', yaml.branding.icon) : undefined,
            banner: yaml.branding.banner ? getAssetUrl('banners', yaml.branding.banner) : undefined,
            colorPrimary: yaml.branding.color_primary,
            colorSecondary: yaml.branding.color_secondary,
          }
        : undefined;

      return {
        openecualliance: yaml.openecualliance,
        id: yaml.id,
        name: yaml.name,
        version: yaml.version,
        vendor: yaml.vendor,
        description: yaml.description,
        website: yaml.website,
        branding,
        // Transform snake_case to camelCase for fileFormat
        fileFormat: {
          type: yaml.file_format.type,
          extensions: yaml.file_format.extensions,
          delimiter: yaml.file_format.delimiter,
          endianness: yaml.file_format.endianness,
          magicBytes: yaml.file_format.magic_bytes,
          headerRow: yaml.file_format.header_row,
          dataStartRow: yaml.file_format.data_start_row,
          timestampColumn: yaml.file_format.timestamp_column,
          timestampUnit: yaml.file_format.timestamp_unit,
        },
        channels: yaml.channels.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          category: c.category,
          dataType: c.data_type,
          unit: c.unit,
          min: c.min,
          max: c.max,
          precision: c.precision,
          sourceNames: c.source_names,
        })),
        metadata: yaml.metadata
          ? {
              author: yaml.metadata.author,
              license: yaml.metadata.license,
              testedWith: yaml.metadata.tested_with,
              knownIssues: yaml.metadata.known_issues,
              changelog: yaml.metadata.changelog,
            }
          : undefined,
      };
    } catch (err) {
      console.error(`Failed to fetch adapter ${vendor}/${id}:`, err);

      // Re-throw createError instances
      if (err && typeof err === 'object' && 'statusCode' in err) {
        throw err;
      }

      // Check for specific error types
      if (err instanceof Error) {
        if (err.message.includes('404')) {
          throw createError({
            statusCode: 404,
            statusMessage: `Adapter not found: ${vendor}/${id}`,
          });
        }

        if (err.message.includes('rate limit') || err.message.includes('503')) {
          throw createError({
            statusCode: 503,
            statusMessage: 'GitHub API rate limit exceeded',
          });
        }
      }

      // Generic server error for unknown issues
      throw createError({
        statusCode: 502,
        statusMessage: 'Failed to fetch adapter from GitHub',
        data: {
          error: err instanceof Error ? err.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      });
    }
  },
  {
    maxAge: 60 * 5, // Cache for 5 minutes
    name: 'adapter-detail',
    getKey: (event) => {
      const vendor = getRouterParam(event, 'vendor');
      const id = getRouterParam(event, 'id');
      return `${vendor}/${id}`;
    },
  }
);
