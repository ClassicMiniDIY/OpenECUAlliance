import { readProtocolFile } from '../../../../utils/filesystem';

/**
 * GET /api/specs/protocols-raw/:vendor/:id
 * Returns the raw YAML content of a protocol spec
 * Supports optional ?version= query parameter for specific versions
 *
 * Note: Uses -raw suffix in route structure due to Nitro file-based routing limitations.
 * Nitro doesn't support [vendor]/[id]/raw.get.ts pattern (dynamic params followed by static segment).
 * Alternative URL patterns like :vendor/:id/raw would require middleware rewrites that are unreliable.
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
        statusMessage: 'Missing vendor or protocol id',
      });
    }

    try {
      const { content } = await readProtocolFile(vendor, id, version);

      // Set appropriate headers for YAML download
      setResponseHeader(event, 'Content-Type', 'text/yaml; charset=utf-8');
      setResponseHeader(event, 'Content-Disposition', `attachment; filename="${vendor}-${id}.protocol.yaml"`);

      return content;
    } catch (err) {
      console.error(`Failed to fetch raw protocol ${vendor}/${id}:`, err);

      // Re-throw createError instances
      if (err && typeof err === 'object' && 'statusCode' in err) {
        throw err;
      }

      throw createError({
        statusCode: 404,
        statusMessage: `Protocol not found: ${vendor}/${id}`,
      });
    }
  },
  {
    maxAge: 60 * 15, // Cache for 15 minutes
    name: 'protocol-raw',
    getKey: (event) => {
      const vendor = getRouterParam(event, 'vendor');
      const id = getRouterParam(event, 'id');
      const query = getQuery(event);
      const version = query.version as string | undefined;
      return version ? `${vendor}/${id}@${version}` : `${vendor}/${id}`;
    },
  }
);
