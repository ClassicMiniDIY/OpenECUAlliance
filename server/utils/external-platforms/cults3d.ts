import type { ExternalPlatform } from '~~/app/types/model';
import type { PlatformParser, ExternalModelMetadata } from './types';
import { PlatformFetchError } from './types';

const URL_PATTERN = /cults3d\.com\/([a-z]{2})\/3d-model\/([\w-]+)/i;

interface MicrolinkResponse {
  status: string;
  statusCode?: number;
  data: {
    title?: string;
    description?: string;
    author?: string;
    image?: {
      url: string;
    };
    url?: string;
  };
}

export const cults3dParser: PlatformParser = {
  platform: 'cults3d' as ExternalPlatform,

  canParse(url: string): boolean {
    return URL_PATTERN.test(url);
  },

  extractId(url: string): string | null {
    const match = url.match(URL_PATTERN);
    return match?.[2] ?? null;
  },

  async fetchMetadata(url: string): Promise<ExternalModelMetadata> {
    const slug = this.extractId(url);
    if (!slug) {
      throw new PlatformFetchError('Invalid Cults3D URL', this.platform);
    }

    // Use microlink for fast metadata extraction
    const microlinkUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}`;

    const response = await fetch(microlinkUrl, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new PlatformFetchError(
        `Failed to fetch from Cults3D: ${response.statusText}`,
        this.platform,
        response.status
      );
    }

    const result = (await response.json()) as MicrolinkResponse;

    if (result.status !== 'success' || !result.data) {
      throw new PlatformFetchError('Failed to extract metadata from Cults3D', this.platform);
    }

    // Check if the page was a 404
    if (result.statusCode === 404) {
      throw new PlatformFetchError('Model not found on Cults3D', this.platform, 404);
    }

    const data = result.data;

    // Parse title - remove "・Cults" suffix
    let title = data.title || slug.replace(/-/g, ' ');
    title = title.replace(/\s*[・|]\s*Cults.*$/i, '').trim();

    // Author
    const authorName = data.author || 'Unknown';

    // Build images array
    const images: Array<{ url: string; isPrimary: boolean }> = [];
    if (data.image?.url) {
      images.push({ url: data.image.url, isPrimary: true });
    }

    // Cults3D defaults
    return {
      title,
      description: data.description || title,
      authorName,
      authorUrl: `https://cults3d.com/en/users/${authorName}`,
      images,
      license: 'CC-BY-NC', // Cults3D common default
      tags: [],
      remixesAllowed: true,
      commercialUseAllowed: false,
      externalId: slug,
      printSettings: {
        recommendedMaterial: 'PLA',
      },
    };
  },
};
