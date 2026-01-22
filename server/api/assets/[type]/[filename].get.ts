import { readAssetFile, getAssetContentType } from '../../../utils/filesystem';

/**
 * GET /api/assets/:type/:filename
 * Serves asset files (logos, icons, banners) from the local filesystem
 * Type must be one of: logos, icons, banners
 */
export default defineCachedEventHandler(
  async (event) => {
    const type = getRouterParam(event, 'type');
    const filename = getRouterParam(event, 'filename');

    if (!type || !filename) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing type or filename',
      });
    }

    // Validate type parameter
    if (type !== 'logos' && type !== 'icons' && type !== 'banners') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid asset type. Must be: logos, icons, or banners',
      });
    }

    try {
      const fileBuffer = await readAssetFile(type, filename);
      const contentType = getAssetContentType(filename);

      // Set appropriate headers for asset serving
      setResponseHeader(event, 'Content-Type', contentType);
      setResponseHeader(event, 'Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

      return fileBuffer;
    } catch (err) {
      console.error(`Failed to serve asset ${type}/${filename}:`, err);

      // Re-throw createError instances
      if (err && typeof err === 'object' && 'statusCode' in err) {
        throw err;
      }

      throw createError({
        statusCode: 404,
        statusMessage: 'Asset not found',
      });
    }
  },
  {
    maxAge: 60 * 60 * 24, // Cache for 24 hours (assets rarely change)
    name: 'asset-file',
    getKey: (event) => {
      const type = getRouterParam(event, 'type');
      const filename = getRouterParam(event, 'filename');
      return `${type}/${filename}`;
    },
  }
);
