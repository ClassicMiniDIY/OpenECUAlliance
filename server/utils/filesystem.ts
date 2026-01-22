import { parse as parseYaml } from 'yaml';

/**
 * Filesystem utilities for reading adapter/protocol specs from Nitro server assets
 * Uses Nitro's useStorage API for cross-platform compatibility (local dev + Vercel)
 */

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
 * Get all adapter file paths with metadata using Nitro storage
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
    const storage = useStorage('assets');

    // Get all keys under specs:adapters
    const allKeys = await storage.getKeys('specs:adapters');

    // Group files by vendor and base ID
    const vendorMap = new Map<string, Map<string, Array<{ file: string; version: string | null; key: string }>>>();

    for (const key of allKeys) {
      // Key format: specs:adapters:vendor:filename
      const parts = key.split(':');
      if (parts.length !== 4) continue;

      const [, , vendor, filename] = parts;

      if (!filename.endsWith('.adapter.yaml') && !filename.endsWith('.adapter.yml')) continue;

      const baseId = extractBaseId(filename);
      const version = extractVersionFromFilename(filename);

      if (!vendorMap.has(vendor)) {
        vendorMap.set(vendor, new Map());
      }

      const vendorFiles = vendorMap.get(vendor)!;
      if (!vendorFiles.has(baseId)) {
        vendorFiles.set(baseId, []);
      }

      vendorFiles.get(baseId)!.push({ file: filename, version, key });
    }

    // Process each vendor
    for (const [vendor, filesByBaseId] of vendorMap) {
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
            vendor,
            id: baseId,
            file: versionInfo.file,
            version: versionInfo.version,
            isLatest: index === 0,
            path: versionInfo.key,
          });
        });
      }
    }
  } catch (err) {
    console.error('Failed to read adapters from storage:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to read adapters from storage',
    });
  }

  return results;
}

/**
 * Get all protocol file paths with metadata using Nitro storage
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
    const storage = useStorage('assets');

    // Get all keys under specs:protocols
    const allKeys = await storage.getKeys('specs:protocols');

    // Group files by vendor and base ID
    const vendorMap = new Map<string, Map<string, Array<{ file: string; version: string | null; key: string }>>>();

    for (const key of allKeys) {
      // Key format: specs:protocols:vendor:filename
      const parts = key.split(':');
      if (parts.length !== 4) continue;

      const [, , vendor, filename] = parts;

      if (!filename.endsWith('.protocol.yaml') && !filename.endsWith('.protocol.yml')) continue;

      const baseId = extractBaseId(filename);
      const version = extractVersionFromFilename(filename);

      if (!vendorMap.has(vendor)) {
        vendorMap.set(vendor, new Map());
      }

      const vendorFiles = vendorMap.get(vendor)!;
      if (!vendorFiles.has(baseId)) {
        vendorFiles.set(baseId, []);
      }

      vendorFiles.get(baseId)!.push({ file: filename, version, key });
    }

    // Process each vendor
    for (const [vendor, filesByBaseId] of vendorMap) {
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
            vendor,
            id: baseId,
            file: versionInfo.file,
            version: versionInfo.version,
            isLatest: index === 0,
            path: versionInfo.key,
          });
        });
      }
    }
  } catch (err) {
    console.error('Failed to read protocols from storage:', err);
    // Protocols directory may not exist, return empty array
    return [];
  }

  return results;
}

/**
 * Read and parse an adapter YAML file using Nitro storage
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

  const storage = useStorage('assets');

  try {
    // If version specified, look for versioned file
    if (version) {
      const versionedKey = `specs:adapters:${vendor}:${id}.v${version}.adapter.yaml`;
      let content = await storage.getItem<string>(versionedKey);

      if (!content) {
        // Try .yml extension
        const versionedKeyYml = `specs:adapters:${vendor}:${id}.v${version}.adapter.yml`;
        content = await storage.getItem<string>(versionedKeyYml);
      }

      if (content) {
        return {
          content,
          parsed: parseYaml(content),
        };
      }
    }

    // Otherwise, look for latest (unversioned file first, then highest version)
    const latestKey = `specs:adapters:${vendor}:${id}.adapter.yaml`;
    let content = await storage.getItem<string>(latestKey);

    if (!content) {
      // Try .yml extension
      const latestKeyYml = `specs:adapters:${vendor}:${id}.adapter.yml`;
      content = await storage.getItem<string>(latestKeyYml);
    }

    if (content) {
      return {
        content,
        parsed: parseYaml(content),
      };
    }

    // Look for any versioned file and get the latest
    const allKeys = await storage.getKeys(`specs:adapters:${vendor}`);
    const versionedFiles = allKeys
      .filter((k) => {
        const filename = k.split(':').pop() || '';
        return (
          filename.startsWith(id) &&
          (filename.endsWith('.adapter.yaml') || filename.endsWith('.adapter.yml')) &&
          extractVersionFromFilename(filename) !== null
        );
      })
      .sort((a, b) => {
        const vA = extractVersionFromFilename(a.split(':').pop() || '') || '';
        const vB = extractVersionFromFilename(b.split(':').pop() || '') || '';
        return vB.localeCompare(vA, undefined, { numeric: true });
      });

    if (versionedFiles.length > 0) {
      content = await storage.getItem<string>(versionedFiles[0]);
      if (content) {
        return {
          content,
          parsed: parseYaml(content),
        };
      }
    }

    throw createError({
      statusCode: 404,
      statusMessage: `Adapter not found: ${vendor}/${id}`,
    });
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
 * Read and parse a protocol YAML file using Nitro storage
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

  const storage = useStorage('assets');

  try {
    // If version specified, look for versioned file
    if (version) {
      const versionedKey = `specs:protocols:${vendor}:${id}.v${version}.protocol.yaml`;
      let content = await storage.getItem<string>(versionedKey);

      if (!content) {
        // Try .yml extension
        const versionedKeyYml = `specs:protocols:${vendor}:${id}.v${version}.protocol.yml`;
        content = await storage.getItem<string>(versionedKeyYml);
      }

      if (content) {
        return {
          content,
          parsed: parseYaml(content),
        };
      }
    }

    // Otherwise, look for latest
    const latestKey = `specs:protocols:${vendor}:${id}.protocol.yaml`;
    let content = await storage.getItem<string>(latestKey);

    if (!content) {
      // Try .yml extension
      const latestKeyYml = `specs:protocols:${vendor}:${id}.protocol.yml`;
      content = await storage.getItem<string>(latestKeyYml);
    }

    if (content) {
      return {
        content,
        parsed: parseYaml(content),
      };
    }

    // Look for any versioned file and get the latest
    const allKeys = await storage.getKeys(`specs:protocols:${vendor}`);
    const versionedFiles = allKeys
      .filter((k) => {
        const filename = k.split(':').pop() || '';
        return (
          filename.startsWith(id) &&
          (filename.endsWith('.protocol.yaml') || filename.endsWith('.protocol.yml')) &&
          extractVersionFromFilename(filename) !== null
        );
      })
      .sort((a, b) => {
        const vA = extractVersionFromFilename(a.split(':').pop() || '') || '';
        const vB = extractVersionFromFilename(b.split(':').pop() || '') || '';
        return vB.localeCompare(vA, undefined, { numeric: true });
      });

    if (versionedFiles.length > 0) {
      content = await storage.getItem<string>(versionedFiles[0]);
      if (content) {
        return {
          content,
          parsed: parseYaml(content),
        };
      }
    }

    throw createError({
      statusCode: 404,
      statusMessage: `Protocol not found: ${vendor}/${id}`,
    });
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
    const storage = useStorage('assets');
    const allKeys = await storage.getKeys(`specs:adapters:${vendor}`);

    const versions = allKeys
      .filter((k) => {
        const filename = k.split(':').pop() || '';
        return filename.startsWith(id) && (filename.endsWith('.adapter.yaml') || filename.endsWith('.adapter.yml'));
      })
      .map((k) => extractVersionFromFilename(k.split(':').pop() || ''))
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
    const storage = useStorage('assets');
    const allKeys = await storage.getKeys(`specs:protocols:${vendor}`);

    const versions = allKeys
      .filter((k) => {
        const filename = k.split(':').pop() || '';
        return filename.startsWith(id) && (filename.endsWith('.protocol.yaml') || filename.endsWith('.protocol.yml'));
      })
      .map((k) => extractVersionFromFilename(k.split(':').pop() || ''))
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
 * Read an asset file from the assets directory using Nitro storage
 */
export async function readAssetFile(type: 'logos' | 'icons' | 'banners', filename: string): Promise<Buffer> {
  validatePathComponent(type);
  validatePathComponent(filename);

  try {
    const storage = useStorage('assets');
    const key = `specs:assets:${type}:${filename}`;

    const content = await storage.getItemRaw(key);

    if (!content) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Asset not found',
      });
    }

    // Convert to Buffer if it's not already
    if (Buffer.isBuffer(content)) {
      return content;
    }

    if (content instanceof Uint8Array) {
      return Buffer.from(content);
    }

    // If it's a string (shouldn't happen for binary assets, but handle it)
    if (typeof content === 'string') {
      return Buffer.from(content);
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Invalid asset format',
    });
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
  const ext = filename.toLowerCase().split('.').pop() || '';

  const mimeTypes: Record<string, string> = {
    svg: 'image/svg+xml',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
  };

  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Generate a URL for an asset file (for API responses)
 */
export function getAssetUrl(type: 'logos' | 'icons' | 'banners', filename: string): string {
  return `/api/assets/${type}/${filename}`;
}
