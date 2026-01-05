import type { Adapter } from '~/types/adapter'

export function useAdapters() {
  const { data: adapters, status, refresh } = useFetch<Adapter[]>('/api/adapters', {
    default: () => [],
  })

  const loading = computed(() => status.value === 'pending')

  const vendors = computed(() => {
    const vendorSet = new Set(adapters.value.map(a => a.vendor))
    return Array.from(vendorSet).sort()
  })

  const categories = computed(() => {
    const categorySet = new Set(adapters.value.flatMap(a => a.categories))
    return Array.from(categorySet).sort()
  })

  const fileFormats = computed(() => {
    const formatSet = new Set(adapters.value.map(a => a.fileFormat))
    return Array.from(formatSet).sort()
  })

  function filterAdapters(options: {
    search?: string
    vendor?: string
    category?: string
    fileFormat?: string
  }) {
    return adapters.value.filter((adapter) => {
      // Search filter
      if (options.search) {
        const search = options.search.toLowerCase()
        const matchesSearch
          = adapter.name.toLowerCase().includes(search)
          || adapter.vendor.toLowerCase().includes(search)
          || adapter.description?.toLowerCase().includes(search)
        if (!matchesSearch) return false
      }

      // Vendor filter
      if (options.vendor && adapter.vendor !== options.vendor) {
        return false
      }

      // Category filter
      if (options.category && !adapter.categories.includes(options.category)) {
        return false
      }

      // File format filter
      if (options.fileFormat && adapter.fileFormat !== options.fileFormat) {
        return false
      }

      return true
    })
  }

  return {
    adapters,
    loading,
    vendors,
    categories,
    fileFormats,
    filterAdapters,
    refresh,
  }
}
