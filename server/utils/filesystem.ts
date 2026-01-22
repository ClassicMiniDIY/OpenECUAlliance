import { readdir, readFile, stat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { parse as parseYaml } from 'yaml';

/**
 * Filesystem utilities for reading adapter/protocol specs from local storage
 * This replaces the GitHub API integration with direct filesystem access
 */

// Base path to specs directory (relative to server root)
const SPECS_BASE_PATH = join(process.cwd(), 'specs');
const ADAPTERS_PATH = join(SPECS_BASE_PATH, 'adapters');
const PROTOCOLS_PATH = join(SPECS_BASE_PATH, 'protocols');
const ASSETS_PATH = join(SPECS_BASE_PATH, 'assets');

/**
 * Validate that a path component doesn't contain traversal attacks
 */
function validatePathComponent(component: string): void {
  if (!component || component.includes('/') || component.includes('..') || component.includes('\\')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid path component',
    });
  }

  // Only allow alphanumeric, dash, underscore, and dot
  const validPattern = /^[a-zA-Z0-9_.-]+$/;
  if (!validPattern.test(component)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid path component format',
    });
  }
}

/**
 * Extract version from filename
 * Examples:
 *   - haltech-ps2000.v1.0.0.adapter.yaml -> 1.0.0
 *   - haltech-ps2000.adapter.yaml -> null (latest)
 */
function extractVersionFromFilename(filename: string): string | null {
  const versionMatch = filename.match(/\.v(\d+\.\d+\.\d+)\./);
  return versionMatch ? versionMatch[1] : null;
}

/**
 * Extract base ID from filename (removes version and extension)
 * Examples:
 *   - haltech-ps2000.v1.0.0.adapter.yaml -> haltech-ps2000
 *   - haltech-ps2000.adapter.yaml -> haltech-ps2000
 */
function extractBaseId(filename: string): string {
  return filename
    .replace(/\.v\d+\.\d+\.\d+/, '') // Remove version if present
    .replace(/\.(adapter|protocol)\.(yaml|yml)$/, ''); // Remove extension
}

/**
 * Get all adapter file paths with metadata
 */
export async function getAllAdapterPaths(): Promise<
  Array<{
    vendor: string;
    id: string;
    file: string;
    version: string | null;
    isLatest: boolean;
    path: string;
  }>
> {
  const results: Array<{
    vendor: string;
    id: string;
    file: string;
    version: string | null;
    isLatest: boolean;
    path: string;
  }> = [];

  try {
    const vendors = await readdir(ADAPTERS_PATH, { withFileTypes: true });

    for (const vendor of vendors) {
      if (!vendor.isDirectory()) continue;

      const vendorPath = join(ADAPTERS_PATH, vendor.name);
      const files = await readdir(vendorPath);

      // Group files by base ID
      const filesByBaseId = new Map<string, Array<{ file: string; version: string | null }>>();

      for (const file of files) {
        if (!file.endsWith('.adapter.yaml') && !file.endsWith('.adapter.yml')) continue;

        const baseId = extractBaseId(file);
        const version = extractVersionFromFilename(file);

        if (!filesByBaseId.has(baseId)) {
          filesByBaseId.set(baseId, []);
        }
        filesByBaseId.get(baseId)!.push({ file, version });
      }

      // Process each base ID group
      for (const [baseId, versions] of filesByBaseId) {
        // Sort versions (nulls/latest first, then by semver)
        versions.sort((a, b) => {
          if (a.version === null) return -1;
          if (b.version === null) return 1;
          return b.version.localeCompare(a.version, undefined, { numeric: true });
        });

        // Mark the first one as latest
        versions.forEach((versionInfo, index) => {
          results.push({
            vendor: vendor.name,
            id: baseId,
            file: versionInfo.file,
            version: versionInfo.version,
            isLatest: index === 0,
            path: join(vendorPath, versionInfo.file),
          });
        });
      }
    }
  } catch (err) {
    console.error('Failed to read adapters directory:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to read adapters from filesystem',
    });
  }

  return results;
}

/**
 * Get all protocol file paths with metadata
 */
export async function getAllProtocolPaths(): Promise<
  Array<{
    vendor: string;
    id: string;
    file: string;
    version: string | null;
    isLatest: boolean;
    path: string;
  }>
> {
  const results: Array<{
    vendor: string;
    id: string;
    file: string;
    version: string | null;
    isLatest: boolean;
    path: string;
  }> = [];

  try {
    const vendors = await readdir(PROTOCOLS_PATH, { withFileTypes: true });

    for (const vendor of vendors) {
      if (!vendor.isDirectory()) continue;

      const vendorPath = join(PROTOCOLS_PATH, vendor.name);
      const files = await readdir(vendorPath);

      // Group files by base ID
      const filesByBaseId = new Map<string, Array<{ file: string; version: string | null }>>();

      for (const file of files) {
        if (!file.endsWith('.protocol.yaml') && !file.endsWith('.protocol.yml')) continue;

        const baseId = extractBaseId(file);
        const version = extractVersionFromFilename(file);

        if (!filesByBaseId.has(baseId)) {
          filesByBaseId.set(baseId, []);
        }
        filesByBaseId.get(baseId)!.push({ file, version });
      }

      // Process each base ID group
      for (const [baseId, versions] of filesByBaseId) {
        // Sort versions (nulls/latest first, then by semver)
        versions.sort((a, b) => {
          if (a.version === null) return -1;
          if (b.version === null) return 1;
          return b.version.localeCompare(a.version, undefined, { numeric: true });
        });

        // Mark the first one as latest
        versions.forEach((versionInfo, index) => {
          results.push({
            vendor: vendor.name,
            id: baseId,
            file: versionInfo.file,
            version: versionInfo.version,
            isLatest: index === 0,
            path: join(vendorPath, versionInfo.file),
          });
        });
      }
    }
  } catch (err) {
    console.error('Failed to read protocols directory:', err);
    // Protocols directory may not exist, return empty array
    return [];
  }

  return results;
}

/**
 * Read and parse an adapter YAML file
 */
export async function readAdapterFile(
  vendor: string,
  id: string,
  version?: string
): Promise<{ content: string; parsed: any }> {
  validatePathComponent(vendor);
  validatePathComponent(id);

  if (version) {
    validatePathComponent(version);
  }

  try {
    const vendorPath = join(ADAPTERS_PATH, vendor);

    // If version specified, look for versioned file
    if (version) {
      const versionedFile = `${id}.v${version}.adapter.yaml`;
      const versionedPath = join(vendorPath, versionedFile);

      try {
        const content = await readFile(versionedPath, 'utf-8');
        return {
          content,
          parsed: parseYaml(content),
        };
      } catch {
        // Try .yml extension
        const versionedFileYml = `${id}.v${version}.adapter.yml`;
        const versionedPathYml = join(vendorPath, versionedFileYml);
        const content = await readFile(versionedPathYml, 'utf-8');
        return {
          content,
          parsed: parseYaml(content),
        };
      }
    }

    // Otherwise, look for latest (unversioned file first, then highest version)
    try {
      const latestFile = `${id}.adapter.yaml`;
      const latestPath = join(vendorPath, latestFile);
      const content = await readFile(latestPath, 'utf-8');
      return {
        content,
        parsed: parseYaml(content),
      };
    } catch {
      try {
        // Try .yml extension
        const latestFileYml = `${id}.adapter.yml`;
        const latestPathYml = join(vendorPath, latestFileYml);
        const content = await readFile(latestPathYml, 'utf-8');
        return {
          content,
          parsed: parseYaml(content),
        };
      } catch {
        // Look for any versioned file and get the latest
        const files = await readdir(vendorPath);
        const versionedFiles = files
          .filter((f) => f.startsWith(id) && (f.endsWith('.adapter.yaml') || f.endsWith('.adapter.yml')))
          .filter((f) => extractVersionFromFilename(f) !== null);

        if (versionedFiles.length === 0) {
          throw createError({
            statusCode: 404,
            statusMessage: `Adapter not found: ${vendor}/${id}`,
          });
        }

        // Sort by version descending
        versionedFiles.sort((a, b) => {
          const vA = extractVersionFromFilename(a) || '';
          const vB = extractVersionFromFilename(b) || '';
          return vB.localeCompare(vA, undefined, { numeric: true });
        });

        const latestVersionedPath = join(vendorPath, versionedFiles[0]);
        const content = await readFile(latestVersionedPath, 'utf-8');
        return {
          content,
          parsed: parseYaml(content),
        };
      }
    }
  } catch (err) {
    if (err && typeof err === 'object' && 'statusCode' in err) {
      throw err;
    }

    console.error(`Failed to read adapter ${vendor}/${id}:`, err);
    throw createError({
      statusCode: 404,
      statusMessage: `Adapter not found: ${vendor}/${id}`,
    });
  }
}

/**
 * Read and parse a protocol YAML file
 */
export async function readProtocolFile(
  vendor: string,
  id: string,
  version?: string
): Promise<{ content: string; parsed: any }> {
  validatePathComponent(vendor);
  validatePathComponent(id);

  if (version) {
    validatePathComponent(version);
  }

  try {
    const vendorPath = join(PROTOCOLS_PATH, vendor);

    // If version specified, look for versioned file
    if (version) {
      const versionedFile = `${id}.v${version}.protocol.yaml`;
      const versionedPath = join(vendorPath, versionedFile);

      try {
        const content = await readFile(versionedPath, 'utf-8');
        return {
          content,
          parsed: parseYaml(content),
        };
      } catch {
        // Try .yml extension
        const versionedFileYml = `${id}.v${version}.protocol.yml`;
        const versionedPathYml = join(vendorPath, versionedFileYml);
        const content = await readFile(versionedPathYml, 'utf-8');
        return {
          content,
          parsed: parseYaml(content),
        };
      }
    }

    // Otherwise, look for latest
    try {
      const latestFile = `${id}.protocol.yaml`;
      const latestPath = join(vendorPath, latestFile);
      const content = await readFile(latestPath, 'utf-8');
      return {
        content,
        parsed: parseYaml(content),
      };
    } catch {
      try {
        // Try .yml extension
        const latestFileYml = `${id}.protocol.yml`;
        const latestPathYml = join(vendorPath, latestFileYml);
        const content = await readFile(latestPathYml, 'utf-8');
        return {
          content,
          parsed: parseYaml(content),
        };
      } catch {
        // Look for any versioned file and get the latest
        const files = await readdir(vendorPath);
        const versionedFiles = files
          .filter((f) => f.startsWith(id) && (f.endsWith('.protocol.yaml') || f.endsWith('.protocol.yml')))
          .filter((f) => extractVersionFromFilename(f) !== null);

        if (versionedFiles.length === 0) {
          throw createError({
            statusCode: 404,
            statusMessage: `Protocol not found: ${vendor}/${id}`,
          });
        }

        // Sort by version descending
        versionedFiles.sort((a, b) => {
          const vA = extractVersionFromFilename(a) || '';
          const vB = extractVersionFromFilename(b) || '';
          return vB.localeCompare(vA, undefined, { numeric: true });
        });

        const latestVersionedPath = join(vendorPath, versionedFiles[0]);
        const content = await readFile(latestVersionedPath, 'utf-8');
        return {
          content,
          parsed: parseYaml(content),
        };
      }
    }
  } catch (err) {
    if (err && typeof err === 'object' && 'statusCode' in err) {
      throw err;
    }

    console.error(`Failed to read protocol ${vendor}/${id}:`, err);
    throw createError({
      statusCode: 404,
      statusMessage: `Protocol not found: ${vendor}/${id}`,
    });
  }
}

/**
 * Get available versions for an adapter
 */
export async function getAdapterVersions(vendor: string, id: string): Promise<string[]> {
  validatePathComponent(vendor);
  validatePathComponent(id);

  try {
    const vendorPath = join(ADAPTERS_PATH, vendor);
    const files = await readdir(vendorPath);

    const versions = files
      .filter((f) => f.startsWith(id) && (f.endsWith('.adapter.yaml') || f.endsWith('.adapter.yml')))
      .map((f) => extractVersionFromFilename(f))
      .filter((v): v is string => v !== null);

    return versions.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  } catch {
    return [];
  }
}

/**
 * Get available versions for a protocol
 */
export async function getProtocolVersions(vendor: string, id: string): Promise<string[]> {
  validatePathComponent(vendor);
  validatePathComponent(id);

  try {
    const vendorPath = join(PROTOCOLS_PATH, vendor);
    const files = await readdir(vendorPath);

    const versions = files
      .filter((f) => f.startsWith(id) && (f.endsWith('.protocol.yaml') || f.endsWith('.protocol.yml')))
      .map((f) => extractVersionFromFilename(f))
      .filter((v): v is string => v !== null);

    return versions.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  } catch {
    return [];
  }
}

/**
 * Get the latest version for an adapter
 */
export async function getLatestAdapterVersion(vendor: string, id: string): Promise<string | null> {
  const versions = await getAdapterVersions(vendor, id);
  return versions.length > 0 ? versions[0] : null;
}

/**
 * Get the latest version for a protocol
 */
export async function getLatestProtocolVersion(vendor: string, id: string): Promise<string | null> {
  const versions = await getProtocolVersions(vendor, id);
  return versions.length > 0 ? versions[0] : null;
}

/**
 * Read an asset file from the assets directory
 */
export async function readAssetFile(type: 'logos' | 'icons' | 'banners', filename: string): Promise<Buffer> {
  validatePathComponent(type);
  validatePathComponent(filename);

  try {
    const assetPath = join(ASSETS_PATH, type, filename);

    // Check if file exists and is a file (not directory)
    const stats = await stat(assetPath);
    if (!stats.isFile()) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Asset not found',
      });
    }

    return await readFile(assetPath);
  } catch (err) {
    if (err && typeof err === 'object' && 'statusCode' in err) {
      throw err;
    }

    console.error(`Failed to read asset ${type}/${filename}:`, err);
    throw createError({
      statusCode: 404,
      statusMessage: 'Asset not found',
    });
  }
}

/**
 * Get the content type for an asset file
 */
export function getAssetContentType(filename: string): string {
  const ext = extname(filename).toLowerCase();

  const mimeTypes: Record<string, string> = {
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp',
  };

  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Generate a URL for an asset file (for API responses)
 */
export function getAssetUrl(type: 'logos' | 'icons' | 'banners', filename: string): string {
  return `/api/assets/${type}/${filename}`;
}
