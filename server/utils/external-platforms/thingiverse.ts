import type { ExternalPlatform } from "~~/app/types/model";
import type { PlatformParser, ExternalModelMetadata } from "./types";
import { PlatformFetchError } from "./types";

const URL_PATTERN = /thingiverse\.com\/thing:(\d+)/i;

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

export const thingiverseParser: PlatformParser = {
  platform: "thingiverse" as ExternalPlatform,

  canParse(url: string): boolean {
    return URL_PATTERN.test(url);
  },

  extractId(url: string): string | null {
    const match = url.match(URL_PATTERN);
    return match?.[1] ?? null;
  },

  async fetchMetadata(url: string): Promise<ExternalModelMetadata> {
    const thingId = this.extractId(url);
    if (!thingId) {
      throw new PlatformFetchError("Invalid Thingiverse URL", this.platform);
    }

    // Use microlink for fast metadata extraction
    const microlinkUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}`;

    const response = await fetch(microlinkUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new PlatformFetchError(
        `Failed to fetch from Thingiverse: ${response.statusText}`,
        this.platform,
        response.status,
      );
    }

    const result = (await response.json()) as MicrolinkResponse;

    if (result.status !== "success" || !result.data) {
      throw new PlatformFetchError(
        "Failed to extract metadata from Thingiverse",
        this.platform,
      );
    }

    // Check if the page was a 404
    if (result.statusCode === 404) {
      throw new PlatformFetchError(
        "Model not found on Thingiverse",
        this.platform,
        404,
      );
    }

    const data = result.data;

    // Parse title - format is "Model Name by AuthorName - Thingiverse"
    let title = data.title || "Untitled";
    let authorName = "Unknown";

    const titleMatch = title.match(
      /^(.+?)\s+by\s+(.+?)(?:\s*-\s*Thingiverse)?$/i,
    );
    if (titleMatch) {
      title = titleMatch[1].trim();
      authorName = titleMatch[2].trim();
    } else {
      // Fallback: just remove the suffix
      title = title.replace(/\s*-\s*Thingiverse$/i, "").trim();
      if (data.author) {
        authorName = data.author;
      }
    }

    // Build images array
    const images: Array<{ url: string; isPrimary: boolean }> = [];
    if (data.image?.url) {
      images.push({ url: data.image.url, isPrimary: true });
    }

    // Thingiverse defaults - typically CC-BY or CC-BY-SA
    return {
      title,
      description: data.description || title,
      authorName,
      authorUrl: `https://www.thingiverse.com/${authorName}`,
      images,
      license: "CC-BY-SA", // Thingiverse common default
      tags: [],
      remixesAllowed: true,
      commercialUseAllowed: true, // CC-BY-SA allows commercial
      externalId: thingId,
      printSettings: {
        recommendedMaterial: "PLA",
      },
    };
  },
};
