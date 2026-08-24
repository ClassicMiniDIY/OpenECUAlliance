import { readAdapterFile, getAssetUrl } from '../../../utils/filesystem';
import { AdapterYamlSchema } from '../../../schemas/adapter';

export default defineCachedEventHandler(
  async (event) => {
    const vendor = getRouterParam(event, 'vendor');
    const id = getRouterParam(event, 'id');
    const query = getQuery(event);
    const version = query.version as string | undefined;

    // Validate inputs exist
    if (!vendor || !id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing vendor or adapter id',
      });
    }

    try {
      const { parsed } = await readAdapterFile(vendor, id, version);

      // Validate YAML structure with Zod
      const validationResult = AdapterYamlSchema.safeParse(parsed);

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
          // Present only when the log's unit is not the canonical one for this
          // channel (see specs/SPECIFICATION.md). canonical = raw * scale + offset.
          // Consumers read this from the API, so it must not be dropped here.
          toCanonical: c.to_canonical ? { scale: c.to_canonical.scale, offset: c.to_canonical.offset } : undefined,
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

      // Generic server error for unknown issues
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch adapter from filesystem',
        data: {
          error: err instanceof Error ? err.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      });
    }
  },
  {
    maxAge: 60 * 15, // Cache for 15 minutes
    name: 'adapter-detail',
    getKey: (event) => {
      const vendor = getRouterParam(event, 'vendor');
      const id = getRouterParam(event, 'id');
      const query = getQuery(event);
      const version = query.version as string | undefined;
      return version ? `${vendor}/${id}@${version}` : `${vendor}/${id}`;
    },
  }
);
