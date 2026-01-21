const GITHUB_OWNER = 'ClassicMiniDIY';
const GITHUB_REPO = 'OECUASpecs';
const GITHUB_BRANCH = 'main';
const GITHUB_API_TIMEOUT = 10000; // 10 seconds

/** Base URL for raw assets from the OECUASpecs repository */
export const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;

/** Get the full URL for an asset file */
export function getAssetUrl(type: 'logos' | 'icons' | 'banners', filename: string): string {
  return `${GITHUB_RAW_BASE}/assets/${type}/${filename}`;
}

interface GitHubContent {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url: string | null;
}

/**
 * Fetch directory contents from GitHub API
 */
export async function fetchGitHubDirectory(path: string): Promise<GitHubContent[]> {
  const config = useRuntimeConfig();
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'OpenECUAlliance-Website',
  };

  // Add authentication if token is available
  if (config.githubToken) {
    headers['Authorization'] = `Bearer ${config.githubToken}`;
  }

  // Add timeout to prevent hanging requests
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GITHUB_API_TIMEOUT);

  try {
    const response = await fetch(url, {
      headers,
      signal: controller.signal,
    });

    // Check for rate limiting
    if (response.status === 403) {
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
      if (rateLimitRemaining === '0') {
        const resetTime = response.headers.get('X-RateLimit-Reset');
        throw createError({
          statusCode: 503,
          statusMessage: 'GitHub API rate limit exceeded',
          data: {
            resetTime: resetTime ? new Date(Number(resetTime) * 1000).toISOString() : undefined,
          },
        });
      }
    }

    if (!response.ok) {
      throw createError({
        statusCode: response.status === 404 ? 404 : 502,
        statusMessage: `GitHub API error: ${response.status}`,
      });
    }

    // Validate content type
    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      throw createError({
        statusCode: 502,
        statusMessage: `Unexpected content type from GitHub: ${contentType}`,
      });
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetch raw file content from GitHub
 */
export async function fetchGitHubFile(path: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;

  // Add timeout to prevent hanging requests
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GITHUB_API_TIMEOUT);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'OpenECUAlliance-Website',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw createError({
        statusCode: response.status === 404 ? 404 : 502,
        statusMessage: `GitHub raw fetch error: ${response.status}`,
      });
    }

    // Validate content type (should be text/plain for YAML files)
    const contentType = response.headers.get('Content-Type');
    if (contentType && !contentType.includes('text/plain') && !contentType.includes('application/octet-stream')) {
      throw createError({
        statusCode: 502,
        statusMessage: `Unexpected content type from GitHub: ${contentType}`,
      });
    }

    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetch a YAML adapter file content from GitHub
 * Note: Parsing should be done in the API route with validation
 */
export async function fetchAdapter(vendor: string, adapterId: string): Promise<string> {
  const path = `adapters/${vendor}/${adapterId}.adapter.yaml`;
  return fetchGitHubFile(path);
}

/**
 * Get all adapter files from GitHub (parallelized for better performance)
 */
export async function fetchAllAdapterPaths(): Promise<Array<{ vendor: string; file: string }>> {
  // Get list of vendor directories
  const vendors = await fetchGitHubDirectory('adapters');

  // Fetch all vendor directories in parallel
  const vendorPromises = vendors
    .filter((v) => v.type === 'dir')
    .map(async (vendor) => {
      const files = await fetchGitHubDirectory(`adapters/${vendor.name}`);
      return files
        .filter((f) => f.type === 'file' && (f.name.endsWith('.adapter.yaml') || f.name.endsWith('.adapter.yml')))
        .map((f) => ({ vendor: vendor.name, file: f.name }));
    });

  const results = await Promise.all(vendorPromises);
  return results.flat();
}

/**
 * Fetch a YAML protocol file content from GitHub
 * Note: Parsing should be done in the API route with validation
 */
export async function fetchProtocol(vendor: string, protocolId: string): Promise<string> {
  const path = `protocols/${vendor}/${protocolId}.protocol.yaml`;
  return fetchGitHubFile(path);
}

/**
 * Get all protocol files from GitHub
 */
export async function fetchAllProtocolPaths(): Promise<Array<{ vendor: string; file: string }>> {
  const protocolPaths: Array<{ vendor: string; file: string }> = [];

  try {
    // Get list of vendor directories
    const vendors = await fetchGitHubDirectory('protocols');

    for (const vendor of vendors) {
      if (vendor.type !== 'dir') continue;

      // Get files in each vendor directory
      const files = await fetchGitHubDirectory(`protocols/${vendor.name}`);

      for (const file of files) {
        if (file.type === 'file' && (file.name.endsWith('.protocol.yaml') || file.name.endsWith('.protocol.yml'))) {
          protocolPaths.push({
            vendor: vendor.name,
            file: file.name,
          });
        }
      }
    }
  } catch {
    // protocols directory may not exist yet
    console.warn('No protocols directory found');
  }

  return protocolPaths;
}
