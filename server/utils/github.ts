import { parse } from "yaml";

const GITHUB_OWNER = "ClassicMiniDIY";
const GITHUB_REPO = "OECUASpecs";
const GITHUB_BRANCH = "main";

/** Base URL for raw assets from the OECUASpecs repository */
export const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;

/** Get the full URL for an asset file */
export function getAssetUrl(
  type: "logos" | "icons" | "banners",
  filename: string,
): string {
  return `${GITHUB_RAW_BASE}/assets/${type}/${filename}`;
}

interface GitHubContent {
  name: string;
  path: string;
  type: "file" | "dir";
  download_url: string | null;
}

/**
 * Fetch directory contents from GitHub API
 */
export async function fetchGitHubDirectory(
  path: string,
): Promise<GitHubContent[]> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "OpenECUAlliance-Website",
    },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Fetch raw file content from GitHub
 */
export async function fetchGitHubFile(path: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "OpenECUAlliance-Website",
    },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub raw fetch error: ${response.status} ${response.statusText}`,
    );
  }

  return response.text();
}

/**
 * Fetch and parse a YAML adapter file from GitHub
 */
export async function fetchAdapter<T>(
  vendor: string,
  adapterId: string,
): Promise<T> {
  const path = `adapters/${vendor}/${adapterId}.adapter.yaml`;
  const content = await fetchGitHubFile(path);
  return parse(content) as T;
}

/**
 * Get all adapter files from GitHub
 */
export async function fetchAllAdapterPaths(): Promise<
  Array<{ vendor: string; file: string }>
> {
  const adapterPaths: Array<{ vendor: string; file: string }> = [];

  // Get list of vendor directories
  const vendors = await fetchGitHubDirectory("adapters");

  for (const vendor of vendors) {
    if (vendor.type !== "dir") continue;

    // Get files in each vendor directory
    const files = await fetchGitHubDirectory(`adapters/${vendor.name}`);

    for (const file of files) {
      if (
        file.type === "file" &&
        (file.name.endsWith(".adapter.yaml") ||
          file.name.endsWith(".adapter.yml"))
      ) {
        adapterPaths.push({
          vendor: vendor.name,
          file: file.name,
        });
      }
    }
  }

  return adapterPaths;
}

/**
 * Fetch and parse a YAML protocol file from GitHub
 */
export async function fetchProtocol<T>(
  vendor: string,
  protocolId: string,
): Promise<T> {
  const path = `protocols/${vendor}/${protocolId}.protocol.yaml`;
  const content = await fetchGitHubFile(path);
  return parse(content) as T;
}

/**
 * Get all protocol files from GitHub
 */
export async function fetchAllProtocolPaths(): Promise<
  Array<{ vendor: string; file: string }>
> {
  const protocolPaths: Array<{ vendor: string; file: string }> = [];

  try {
    // Get list of vendor directories
    const vendors = await fetchGitHubDirectory("protocols");

    for (const vendor of vendors) {
      if (vendor.type !== "dir") continue;

      // Get files in each vendor directory
      const files = await fetchGitHubDirectory(`protocols/${vendor.name}`);

      for (const file of files) {
        if (
          file.type === "file" &&
          (file.name.endsWith(".protocol.yaml") ||
            file.name.endsWith(".protocol.yml"))
        ) {
          protocolPaths.push({
            vendor: vendor.name,
            file: file.name,
          });
        }
      }
    }
  } catch {
    // protocols directory may not exist yet
    console.warn("No protocols directory found");
  }

  return protocolPaths;
}
