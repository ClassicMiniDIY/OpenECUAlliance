import type { ExternalPlatform } from "~~/app/types/model";
import type { PlatformParser, ExternalModelMetadata } from "./types";
import { PlatformFetchError } from "./types";

const URL_PATTERN = /printables\.com\/model\/(\d+)/i;

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

export const printablesParser: PlatformParser = {
  platform: "printables" as ExternalPlatform,

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
      throw new PlatformFetchError("Invalid Printables URL", this.platform);
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
        `Failed to fetch from Printables: ${response.statusText}`,
        this.platform,
        response.status,
      );
    }

    const result = (await response.json()) as MicrolinkResponse;

    if (result.status !== "success" || !result.data) {
      throw new PlatformFetchError(
        "Failed to extract metadata from Printables",
        this.platform,
      );
    }

    const data = result.data;

    // Parse title - format is "Model Name by AuthorName | Download free STL model | Printables.com"
    let title = data.title || "Untitled";
    let authorName = "Unknown";

    const titleMatch = title.match(/^(.+?)\s+by\s+(.+?)\s*\|/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
      authorName = titleMatch[2].trim();
    } else {
      // Fallback: just remove the suffix
      title = title
        .replace(/\s*\|\s*Download free STL model\s*\|\s*Printables\.com$/i, "")
        .trim();
      if (data.author) {
        authorName = data.author;
      }
    }

    // Build images array
    const images: Array<{ url: string; isPrimary: boolean }> = [];
    if (data.image?.url) {
      images.push({ url: data.image.url, isPrimary: true });
    }

    // Printables defaults - typically CC-BY-NC-SA or similar
    return {
      title,
      description: data.description || title,
      authorName,
      authorUrl: `https://www.printables.com/@${authorName}`,
      images,
      license: "CC-BY-NC-SA", // Printables default
      tags: [],
      remixesAllowed: true,
      commercialUseAllowed: false,
      externalId: modelId,
      printSettings: {
        recommendedMaterial: "PLA",
      },
    };
  },
};
