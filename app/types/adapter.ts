export interface AdapterBranding {
  logo?: string;
  icon?: string;
  banner?: string;
  colorPrimary?: string;
  colorSecondary?: string;
}

export interface Adapter {
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

/** canonical = raw * scale + offset. See specs/SPECIFICATION.md. */
export interface ToCanonical {
  scale: number;
  offset: number;
}

export interface AdapterChannel {
  id: string;
  name: string;
  description?: string;
  category: string;
  dataType: 'float' | 'int' | 'bool' | 'string' | 'enum';
  unit: string;
  min?: number;
  max?: number;
  precision?: number;
  sourceNames: string[];
  /** Set only when `unit` is not the canonical unit for this channel id. */
  toCanonical?: ToCanonical;
}

export interface AdapterFileFormat {
  type: 'csv' | 'binary';
  extensions: string[];
  delimiter?: string;
  endianness?: string;
  magicBytes?: number[];
  headerRow?: number;
  dataStartRow?: number;
  timestampColumn?: string;
  timestampUnit?: string;
}

export interface AdapterDetail {
  openecualliance: string;
  id: string;
  name: string;
  version: string;
  vendor: string;
  description?: string;
  website?: string;
  fileFormat: AdapterFileFormat;
  channels: AdapterChannel[];
  branding?: AdapterBranding;
  metadata?: {
    author?: string;
    license?: string;
    repository?: string;
    testedWith?: string[];
    knownIssues?: string[];
    changelog?: Array<{
      version: string;
      date: string;
      changes: string[];
    }>;
  };
}
