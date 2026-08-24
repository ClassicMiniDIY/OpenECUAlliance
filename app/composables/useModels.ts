import type { UserModel, ModelCategory } from '~/types/model';
import type { VendorOption } from '~/utils/vendors';

export function useModels() {
  const {
    data: models,
    status,
    refresh,
    error,
  } = useFetch<UserModel[]>('/api/models', {
    key: 'models-list',
    default: () => [],
    getCachedData(key, nuxtApp) {
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
    },
  });

  const loading = computed(() => status.value === 'pending');

  const vendors = computed((): VendorOption[] => toVendorOptions((models.value ?? []).map((m) => m.vendor)));

  const categories = computed((): ModelCategory[] => {
    const categorySet = new Set((models.value ?? []).map((m) => m.category));
    return Array.from(categorySet).sort() as ModelCategory[];
  });

  const materials = computed(() => {
    const materialSet = new Set((models.value ?? []).map((m) => m.recommendedMaterial));
    return Array.from(materialSet).sort();
  });

  function filterModels(options: { search?: string; vendor?: string; category?: ModelCategory; material?: string }) {
    return (models.value ?? []).filter((model) => {
      // Search filter
      if (options.search) {
        const search = options.search.toLowerCase();
        const matchesSearch =
          model.name.toLowerCase().includes(search) ||
          model.vendor?.toLowerCase().includes(search) ||
          model.description?.toLowerCase().includes(search) ||
          model.author?.username?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Vendor filter
      if (options.vendor && (!model.vendor || vendorSlug(model.vendor) !== vendorSlug(options.vendor))) {
        return false;
      }

      // Category filter
      if (options.category && model.category !== options.category) {
        return false;
      }

      // Material filter
      if (options.material && model.recommendedMaterial !== options.material) {
        return false;
      }

      return true;
    });
  }

  function getCategoryLabel(category: ModelCategory): string {
    const labels: Record<ModelCategory, string> = {
      mounts: 'Mounts',
      enclosures: 'Enclosures',
      brackets: 'Brackets',
      adapters: 'Adapters',
      accessories: 'Accessories',
    };
    return labels[category] || category;
  }

  function getCategoryIcon(category: ModelCategory): string {
    const icons: Record<ModelCategory, string> = {
      mounts: 'i-heroicons-cube',
      enclosures: 'i-heroicons-inbox',
      brackets: 'i-heroicons-wrench',
      adapters: 'i-heroicons-link',
      accessories: 'i-heroicons-cog-6-tooth',
    };
    return icons[category] || 'i-heroicons-cube';
  }

  return {
    models: computed(() => models.value ?? []),
    loading,
    error,
    vendors,
    categories,
    materials,
    filterModels,
    getCategoryLabel,
    getCategoryIcon,
    refresh,
  };
}
