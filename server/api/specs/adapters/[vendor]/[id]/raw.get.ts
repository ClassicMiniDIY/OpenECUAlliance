import { readAdapterFile } from '../../../../../utils/filesystem';

/**
 * GET /api/specs/adapters/:vendor/:id/raw
 * Returns the raw YAML content of an adapter spec
 * Supports optional ?version= query parameter for specific versions
 */
export default defineCachedEventHandler(
  async (event) => {
    const vendor = getRouterParam(event, 'vendor');
    const id = getRouterParam(event, 'id');
    const query = getQuery(event);
    const version = query.version as string | undefined;

    if (!vendor || !id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing vendor or adapter id',
      });
    }

    try {
      const { content } = await readAdapterFile(vendor, id, version);

      // Set appropriate headers for YAML download
      setResponseHeader(event, 'Content-Type', 'text/yaml; charset=utf-8');
      setResponseHeader(event, 'Content-Disposition', `attachment; filename="${vendor}-${id}.adapter.yaml"`);

      return content;
    } catch (err) {
      console.error(`Failed to fetch raw adapter ${vendor}/${id}:`, err);

      // Re-throw createError instances
      if (err && typeof err === 'object' && 'statusCode' in err) {
        throw err;
      }

      throw createError({
        statusCode: 404,
        statusMessage: `Adapter not found: ${vendor}/${id}`,
      });
    }
  },
  {
    maxAge: 60 * 15, // Cache for 15 minutes
    name: 'adapter-raw',
    getKey: (event) => {
      const vendor = getRouterParam(event, 'vendor');
      const id = getRouterParam(event, 'id');
      const query = getQuery(event);
      const version = query.version as string | undefined;
      return version ? `${vendor}/${id}@${version}` : `${vendor}/${id}`;
    },
  }
);
