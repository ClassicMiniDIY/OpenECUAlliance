import type { ExternalPlatform } from '~~/app/types/model';
import type { PlatformParser, ExternalModelMetadata } from './types';
import { PlatformFetchError } from './types';

const URL_PATTERN = /makerworld\.com\/(?:[a-z]{2}\/)?models?\/(\d+)/i;

interface MicrolinkResponse {
  status: string;
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

export const makerWorldParser: PlatformParser = {
  platform: 'makerworld' as ExternalPlatform,

  canParse(url: string): boolean {
    return URL_PATTERN.test(url);
  },

  extractId(url: string): string | null {
    const match = url.match(URL_PATTERN);
    return match?.[1] ?? null;
  },

  async fetchMetadata(url: string): Promise<ExternalModelMetadata> {
    const modelId = this.extractId(url);
    if (!modelId) {
      throw new PlatformFetchError('Invalid MakerWorld URL', this.platform);
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
        `Failed to fetch from MakerWorld: ${response.statusText}`,
        this.platform,
        response.status
      );
    }

    const result = (await response.json()) as MicrolinkResponse;

    if (result.status !== 'success' || !result.data) {
      throw new PlatformFetchError('Failed to extract metadata from MakerWorld', this.platform);
    }

    const data = result.data;

    // Parse title - remove " - Free 3D Print Model - MakerWorld" suffix
    let title = data.title || 'Untitled';
    title = title
      .replace(/ - Free 3D Print Model - MakerWorld$/i, '')
      .replace(/ - MakerWorld$/i, '')
      .trim();

    // Parse description
    let description = data.description || '';

    // Extract author from description - pattern: "designed by AuthorName"
    let authorName = 'Unknown';
    const descAuthorMatch = description.match(/designed by\s+([^.]+)/i);
    if (descAuthorMatch) {
      authorName = descAuthorMatch[1].trim();
    } else if (data.author) {
      authorName = data.author;
    }

    // Clean up description - remove the "Download this free 3D print file designed by X." prefix
    description = description.replace(/^Download this free 3D print file designed by [^.]+\.\s*/i, '').trim();

    // Build images array
    const images: Array<{ url: string; isPrimary: boolean }> = [];
    if (data.image?.url) {
      images.push({ url: data.image.url, isPrimary: true });
    }

    // Default license and print settings - MakerWorld models are typically CC-BY-NC-SA
    // We can't extract these without Jina, so use sensible defaults
    return {
      title,
      description: description || title,
      authorName,
      authorUrl: `https://makerworld.com/en/@${authorName.replace(/\s+/g, '')}`,
      images,
      license: 'CC-BY-NC-SA', // MakerWorld default
      tags: [],
      remixesAllowed: true,
      commercialUseAllowed: false, // NC = Non-Commercial
      externalId: modelId,
      printSettings: {
        recommendedMaterial: 'PLA', // Default
      },
    };
  },
};
