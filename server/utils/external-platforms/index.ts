import type { ExternalPlatform } from '~~/app/types/model';
import type { PlatformParser, ExternalModelMetadata } from './types';
import { PlatformFetchError } from './types';
import { makerWorldParser } from './makerworld';
import { printablesParser } from './printables';
import { thingiverseParser } from './thingiverse';
import { cults3dParser } from './cults3d';

const parsers: PlatformParser[] = [makerWorldParser, printablesParser, thingiverseParser, cults3dParser];

export function detectPlatform(url: string): ExternalPlatform | null {
  for (const parser of parsers) {
    if (parser.canParse(url)) {
      return parser.platform;
    }
  }
  return null;
}

export function extractExternalId(url: string): string | null {
  for (const parser of parsers) {
    if (parser.canParse(url)) {
      return parser.extractId(url);
    }
  }
  return null;
}

export async function fetchExternalModel(url: string): Promise<ExternalModelMetadata & { platform: ExternalPlatform }> {
  const parser = parsers.find((p) => p.canParse(url));

  if (!parser) {
    throw new PlatformFetchError(
      'Unsupported platform. Supported platforms: MakerWorld, Printables, Thingiverse, Cults3D',
      'makerworld'
    );
  }

  const metadata = await parser.fetchMetadata(url);

  return {
    ...metadata,
    platform: parser.platform,
  };
}

export function isValidExternalUrl(url: string): boolean {
  try {
    new URL(url);
    return detectPlatform(url) !== null;
  } catch {
    return false;
  }
}

export function normalizeExternalUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete('utm_source');
    parsed.searchParams.delete('utm_medium');
    parsed.searchParams.delete('utm_campaign');
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return url;
  }
}
