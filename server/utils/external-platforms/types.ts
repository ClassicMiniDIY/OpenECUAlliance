import type { ExternalPlatform } from '~~/app/types/model';

export interface ExternalModelImage {
  url: string;
  isPrimary: boolean;
}

export interface ExternalPrintSettings {
  recommendedMaterial?: string;
  layerHeight?: number;
  infillPercent?: number;
  wallCount?: number;
  supportsRequired?: boolean;
  estimatedTimeHours?: number;
}

export interface ExternalModelMetadata {
  title: string;
  description: string;
  authorName: string;
  authorUrl: string | null;
  images: ExternalModelImage[];
  license: string | null;
  tags: string[];
  remixesAllowed: boolean;
  commercialUseAllowed: boolean;
  externalId: string;
  printSettings?: ExternalPrintSettings;
}

export interface PlatformParser {
  platform: ExternalPlatform;
  canParse(url: string): boolean;
  extractId(url: string): string | null;
  fetchMetadata(url: string): Promise<ExternalModelMetadata>;
}

export class PlatformFetchError extends Error {
  constructor(
    message: string,
    public platform: ExternalPlatform,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'PlatformFetchError';
  }
}
