import { getAllAdapterPaths } from '../../utils/filesystem';

interface AdapterSpecListItem {
  id: string;
  vendor: string;
  version: string | null;
  isLatest: boolean;
  downloadUrl: string;
}

/**
 * GET /api/specs/adapters
 * Returns a list of all available adapter specs with download URLs
 * This allows users to see what's available and download raw YAML files
 */
export default defineCachedEventHandler(
  async (): Promise<AdapterSpecListItem[]> => {
    try {
      const adapterPaths = await getAllAdapterPaths();

      return adapterPaths.map((adapter) => ({
        id: adapter.id,
        vendor: adapter.vendor,
        version: adapter.version,
        isLatest: adapter.isLatest,
        downloadUrl: adapter.version
          ? `/api/specs/adapters/${adapter.vendor}/${adapter.id}/raw?version=${adapter.version}`
          : `/api/specs/adapters/${adapter.vendor}/${adapter.id}/raw`,
      }));
    } catch (err) {
      console.error('Failed to list adapter specs:', err);

      // Re-throw createError instances
      if (err && typeof err === 'object' && 'statusCode' in err) {
        throw err;
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to list adapter specs',
        data: {
          error: err instanceof Error ? err.message : 'Unknown error',
        },
      });
    }
  },
  {
    maxAge: 60 * 15, // Cache for 15 minutes
    name: 'adapter-specs-list',
    getKey: () => 'all',
  }
);
