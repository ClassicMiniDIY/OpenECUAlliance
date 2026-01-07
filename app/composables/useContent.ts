import type { ContentType, ContentListItem } from '~/types/content';

export function useContent() {
  const { adapters, loading: adaptersLoading, refresh: refreshAdapters } = useAdapters();
  const { protocols, loading: protocolsLoading, refresh: refreshProtocols } = useProtocols();
  const { models, loading: modelsLoading, refresh: refreshModels } = useModels();

  const loading = computed(() => adaptersLoading.value || protocolsLoading.value || modelsLoading.value);

  /**
   * All content items unified with type discriminator
   */
  const allContent = computed((): ContentListItem[] => {
    const items: ContentListItem[] = [];

    // Add adapters
    for (const adapter of adapters.value) {
      items.push({
        type: 'adapter',
        id: adapter.id,
        name: adapter.name,
        version: adapter.version,
        vendor: adapter.vendor,
        description: adapter.description,
        branding: adapter.branding,
        channelCount: adapter.channelCount,
      });
    }

    // Add protocols
    for (const protocol of protocols.value) {
      items.push({
        type: 'protocol',
        id: protocol.id,
        name: protocol.name,
        version: protocol.version,
        vendor: protocol.vendor,
        description: protocol.description,
        branding: protocol.branding,
        messageCount: protocol.messageCount,
        signalCount: protocol.signalCount,
      });
    }

    // Add models
    for (const model of models.value) {
      items.push({
        type: 'model',
        id: model.id,
        name: model.name,
        version: model.version,
        vendor: model.vendor,
        description: model.description,
        branding: model.branding,
        category: model.category,
        primaryImage: model.primaryImage,
      });
    }

    return items;
  });

  /**
   * Get count by content type
   */
  const counts = computed(() => ({
    all: allContent.value.length,
    adapter: adapters.value.length,
    protocol: protocols.value.length,
    model: models.value.length,
  }));

  /**
   * Get unique vendors across all content types
   */
  const allVendors = computed(() => {
    const vendorSet = new Set<string>();
    for (const item of allContent.value) {
      if (item.vendor) {
        vendorSet.add(item.vendor);
      }
    }
    return Array.from(vendorSet).sort();
  });

  /**
   * Filter content by type and search
   */
  function filterContent(options: { type?: ContentType | 'all'; search?: string; vendor?: string }): ContentListItem[] {
    return allContent.value.filter((item) => {
      // Type filter
      if (options.type && options.type !== 'all' && item.type !== options.type) {
        return false;
      }

      // Vendor filter
      if (options.vendor && item.vendor !== options.vendor) {
        return false;
      }

      // Search filter
      if (options.search) {
        const search = options.search.toLowerCase();
        const matchesSearch =
          item.name.toLowerCase().includes(search) ||
          item.vendor?.toLowerCase().includes(search) ||
          item.description?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }

  /**
   * Get content type label
   */
  function getTypeLabel(type: ContentType): string {
    const labels: Record<ContentType, string> = {
      adapter: 'Adapter',
      protocol: 'Protocol',
      model: '3D Model',
    };
    return labels[type];
  }

  /**
   * Get content type icon
   */
  function getTypeIcon(type: ContentType): string {
    const icons: Record<ContentType, string> = {
      adapter: 'i-heroicons-document-text',
      protocol: 'i-heroicons-signal',
      model: 'i-heroicons-cube',
    };
    return icons[type];
  }

  /**
   * Get content type color
   */
  function getTypeColor(type: ContentType): string {
    const colors: Record<ContentType, string> = {
      adapter: 'primary',
      protocol: 'success',
      model: 'warning',
    };
    return colors[type];
  }

  /**
   * Refresh all content
   */
  async function refreshAll() {
    await Promise.all([refreshAdapters(), refreshProtocols(), refreshModels()]);
  }

  return {
    allContent,
    adapters,
    protocols,
    models,
    loading,
    counts,
    allVendors,
    filterContent,
    getTypeLabel,
    getTypeIcon,
    getTypeColor,
    refreshAll,
  };
}
