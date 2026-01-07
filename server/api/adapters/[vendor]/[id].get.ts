import { parse } from 'yaml';
import { fetchGitHubFile, getAssetUrl } from '../../../utils/github';

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
    type: 'csv' | 'binary';
    extensions: string[];
    delimiter?: string;
    endianness?: string;
    magic_bytes?: number[];
    header_row?: number;
    data_start_row?: number;
    timestamp_column?: string;
    timestamp_unit?: string;
  };
  channels: Array<{
    id: string;
    name: string;
    description?: string;
    category: string;
    data_type: string;
    unit: string;
    min?: number;
    max?: number;
    precision?: number;
    source_names: string[];
  }>;
  metadata?: {
    author?: string;
    license?: string;
    tested_with?: string[];
    known_issues?: string[];
    changelog?: Array<{
      version: string;
      date: string;
      changes: string[];
    }>;
  };
}

export default defineCachedEventHandler(
  async (event) => {
    const vendor = getRouterParam(event, 'vendor');
    const id = getRouterParam(event, 'id');

    if (!vendor || !id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing vendor or adapter id',
      });
    }

    try {
      const path = `adapters/${vendor}/${id}.adapter.yaml`;
      const content = await fetchGitHubFile(path);
      const yaml = parse(content) as AdapterYaml;

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
        fileFormat: yaml.file_format,
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
      throw createError({
        statusCode: 404,
        statusMessage: `Adapter not found: ${vendor}/${id}`,
      });
    }
  },
  {
    maxAge: 60 * 5, // Cache for 5 minutes
    name: 'adapter-detail',
    getKey: (event) => `${getRouterParam(event, 'vendor')}/${getRouterParam(event, 'id')}`,
  }
);
