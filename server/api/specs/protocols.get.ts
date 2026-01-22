import { getAllProtocolPaths } from '../../utils/filesystem';

interface ProtocolSpecListItem {
  id: string;
  vendor: string;
  version: string | null;
  isLatest: boolean;
  downloadUrl: string;
}

/**
 * GET /api/specs/protocols
 * Returns a list of all available protocol specs with download URLs
 * This allows users to see what's available and download raw YAML files
 */
export default defineCachedEventHandler(
  async (): Promise<ProtocolSpecListItem[]> => {
    try {
      const protocolPaths = await getAllProtocolPaths();

      return protocolPaths.map((protocol) => ({
        id: protocol.id,
        vendor: protocol.vendor,
        version: protocol.version,
        isLatest: protocol.isLatest,
        downloadUrl: protocol.version
          ? `/api/specs/protocols/${protocol.vendor}/${protocol.id}/raw?version=${protocol.version}`
          : `/api/specs/protocols/${protocol.vendor}/${protocol.id}/raw`,
      }));
    } catch (err) {
      console.error('Failed to list protocol specs:', err);

      // Re-throw createError instances
      if (err && typeof err === 'object' && 'statusCode' in err) {
        throw err;
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to list protocol specs',
        data: {
          error: err instanceof Error ? err.message : 'Unknown error',
        },
      });
    }
  },
  {
    maxAge: 60 * 15, // Cache for 15 minutes
    name: 'protocol-specs-list',
    getKey: () => 'all',
  }
);
