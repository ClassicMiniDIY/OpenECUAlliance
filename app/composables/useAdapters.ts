import type { Adapter } from '~/types/adapter'

// Mock data for now - will be replaced with actual data source
const mockAdapters: Adapter[] = [
  {
    id: 'haltech-nsp',
    name: 'Haltech NSP CSV',
    version: '1.0.0',
    vendor: 'haltech',
    description: 'CSV files exported from Haltech NSP software. Supports Elite, Nexus, and IC-7 series ECUs.',
    channelCount: 35,
    categories: ['engine', 'fuel', 'ignition', 'temperature', 'pressure'],
    fileFormat: 'csv',
    extensions: ['.csv'],
  },
  {
    id: 'link-llg',
    name: 'Link ECU LLG',
    version: '1.0.0',
    vendor: 'link',
    description: 'Binary log files from Link ECU systems including G4+, G4X, and Thunder series.',
    channelCount: 28,
    categories: ['engine', 'fuel', 'ignition', 'temperature'],
    fileFormat: 'binary',
    extensions: ['.llg'],
  },
  {
    id: 'aim-xrk',
    name: 'AiM XRK/DRK',
    version: '1.0.0',
    vendor: 'aim',
    description: 'Binary files from AiM data loggers including MXL2, MXS, and Solo series.',
    channelCount: 42,
    categories: ['engine', 'speed', 'temperature', 'pressure', 'custom'],
    fileFormat: 'binary',
    extensions: ['.xrk', '.drk'],
  },
  {
    id: 'ecumaster-emu',
    name: 'ECUMaster EMU CSV',
    version: '1.0.0',
    vendor: 'ecumaster',
    description: 'CSV exports from ECUMaster EMU Black and EMU Pro ECUs.',
    channelCount: 32,
    categories: ['engine', 'fuel', 'ignition', 'temperature', 'pressure'],
    fileFormat: 'csv',
    extensions: ['.csv'],
  },
  {
    id: 'speeduino-mlg',
    name: 'Speeduino MLG',
    version: '1.0.0',
    vendor: 'speeduino',
    description: 'MLG binary format from Speeduino open-source ECU.',
    channelCount: 24,
    categories: ['engine', 'fuel', 'ignition', 'temperature'],
    fileFormat: 'binary',
    extensions: ['.mlg'],
  },
  {
    id: 'rusefi-mlg',
    name: 'rusEFI MLG',
    version: '1.0.0',
    vendor: 'rusefi',
    description: 'MLG binary format from rusEFI open-source ECU project.',
    channelCount: 26,
    categories: ['engine', 'fuel', 'ignition', 'temperature'],
    fileFormat: 'binary',
    extensions: ['.mlg'],
  },
  {
    id: 'motec-csv',
    name: 'MoTeC CSV Export',
    version: '0.1.0',
    vendor: 'motec',
    description: 'CSV exports from MoTeC i2 software. Coming soon.',
    channelCount: 0,
    categories: [],
    fileFormat: 'csv',
    extensions: ['.csv'],
  },
  {
    id: 'aem-csv',
    name: 'AEM CSV Export',
    version: '0.1.0',
    vendor: 'aem',
    description: 'CSV exports from AEM Infinity and CD-7 dash loggers. Coming soon.',
    channelCount: 0,
    categories: [],
    fileFormat: 'csv',
    extensions: ['.csv'],
  },
]

export function useAdapters() {
  const adapters = ref<Adapter[]>(mockAdapters)
  const loading = ref(false)

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
        const matchesSearch =
          adapter.name.toLowerCase().includes(search) ||
          adapter.vendor.toLowerCase().includes(search) ||
          adapter.description?.toLowerCase().includes(search)
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
  }
}
