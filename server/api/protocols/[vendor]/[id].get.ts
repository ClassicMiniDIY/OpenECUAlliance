import { readProtocolFile, getAssetUrl } from '../../../utils/filesystem';

interface ProtocolYaml {
  openecualliance: string;
  type: 'protocol';
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
  protocol: {
    type: 'can' | 'canfd' | 'lin' | 'k-line';
    baudrate: number;
    extended_id?: boolean;
    data_baudrate?: number;
    fd_enabled?: boolean;
    base_id?: number;
    base_id_configurable?: boolean;
    base_id_range?: {
      min: number;
      max: number;
    };
  };
  messages: Array<{
    id: number | string;
    name: string;
    description?: string;
    length: number;
    interval_ms?: number;
    transmitter?: string;
    signals: Array<{
      /** Canonical channel id from specs/channels.yaml. Absent on reserved and vendor-specific signals. */
      id?: string;
      category?: string;
      reserved?: boolean;
      vendor_specific?: boolean;
      name: string;
      description?: string;
      start_bit: number;
      length: number;
      byte_order: 'little_endian' | 'big_endian';
      data_type: 'unsigned' | 'signed' | 'float' | 'double' | 'bool' | 'enum';
      scale?: number;
      offset?: number;
      unit?: string;
      min?: number;
      max?: number;
      enum_ref?: string;
      comment?: string;
      values?: Record<string, string>;
      disputed?: string;
      to_canonical?: { scale: number; offset: number };
    }>;
  }>;
  enums?: Array<{
    name: string;
    description?: string;
    values: Record<string, string>;
  }>;
  metadata?: {
    author?: string;
    license?: string;
    source_url?: string;
    repository?: string;
    tested_with?: string[];
    compatible_tools?: string[];
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
    const query = getQuery(event);
    const version = query.version as string | undefined;

    if (!vendor || !id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing vendor or id parameter',
      });
    }

    try {
      const { parsed } = await readProtocolFile(vendor, id, version);
      const yaml = parsed as ProtocolYaml;

      // Transform to camelCase
      return {
        openecualliance: yaml.openecualliance,
        type: yaml.type,
        id: yaml.id,
        name: yaml.name,
        version: yaml.version,
        vendor: yaml.vendor,
        description: yaml.description,
        website: yaml.website,
        branding: yaml.branding
          ? {
              logo: yaml.branding.logo ? getAssetUrl('logos', yaml.branding.logo) : undefined,
              icon: yaml.branding.icon ? getAssetUrl('icons', yaml.branding.icon) : undefined,
              banner: yaml.branding.banner ? getAssetUrl('banners', yaml.branding.banner) : undefined,
              colorPrimary: yaml.branding.color_primary,
              colorSecondary: yaml.branding.color_secondary,
            }
          : undefined,
        protocol: {
          type: yaml.protocol.type,
          baudrate: yaml.protocol.baudrate,
          extendedId: yaml.protocol.extended_id,
          dataBaudrate: yaml.protocol.data_baudrate,
          fdEnabled: yaml.protocol.fd_enabled,
          baseId: yaml.protocol.base_id,
          baseIdConfigurable: yaml.protocol.base_id_configurable,
          baseIdRange: yaml.protocol.base_id_range,
        },
        messages: yaml.messages.map((msg) => ({
          id: msg.id,
          name: msg.name,
          description: msg.description,
          length: msg.length,
          intervalMs: msg.interval_ms,
          transmitter: msg.transmitter,
          signals: msg.signals.map((sig) => ({
            // The canonical id is what lets a consumer line a CAN signal up
            // with the same measurement from a log adapter. Dropping it here
            // would make the whole registry invisible to API clients.
            id: sig.id,
            category: sig.category,
            reserved: sig.reserved,
            vendorSpecific: sig.vendor_specific,
            name: sig.name,
            description: sig.description,
            startBit: sig.start_bit,
            length: sig.length,
            byteOrder: sig.byte_order,
            dataType: sig.data_type,
            scale: sig.scale,
            offset: sig.offset,
            unit: sig.unit,
            min: sig.min,
            max: sig.max,
            enumRef: sig.enum_ref,
            comment: sig.comment,
            values: sig.values,
            // A signal the source documents inconsistently, and the conversion
            // to the canonical unit. Both were being dropped here, which made
            // them invisible to every API client — the data may as well not
            // have been in the YAML.
            disputed: sig.disputed,
            toCanonical: sig.to_canonical ? { scale: sig.to_canonical.scale, offset: sig.to_canonical.offset } : undefined,
          })),
        })),
        enums: yaml.enums?.map((e) => ({
          name: e.name,
          description: e.description,
          values: e.values,
        })),
        metadata: yaml.metadata
          ? {
              author: yaml.metadata.author,
              license: yaml.metadata.license,
              sourceUrl: yaml.metadata.source_url,
              repository: yaml.metadata.repository,
              testedWith: yaml.metadata.tested_with,
              compatibleTools: yaml.metadata.compatible_tools,
              knownIssues: yaml.metadata.known_issues,
              changelog: yaml.metadata.changelog,
            }
          : undefined,
      };
    } catch (err) {
      console.error(`Failed to fetch protocol ${vendor}/${id}:`, err);

      // Re-throw createError instances
      if (err && typeof err === 'object' && 'statusCode' in err) {
        throw err;
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch protocol from filesystem',
        data: {
          error: err instanceof Error ? err.message : 'Unknown error',
        },
      });
    }
  },
  {
    maxAge: 60 * 15, // Cache for 15 minutes
    name: 'protocol-detail',
    getKey: (event) => {
      const vendor = getRouterParam(event, 'vendor');
      const id = getRouterParam(event, 'id');
      const query = getQuery(event);
      const version = query.version as string | undefined;
      return version ? `${vendor}/${id}@${version}` : `${vendor}/${id}`;
    },
  }
);
