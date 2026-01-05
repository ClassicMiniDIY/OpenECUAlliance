import { readdir, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { parse } from 'yaml'

interface AdapterYaml {
  openecualliance: string
  id: string
  name: string
  version: string
  vendor: string
  description?: string
  website?: string
  file_format: {
    type: 'csv' | 'binary'
    extensions: string[]
  }
  channels: Array<{
    id: string
    name: string
    description?: string
    category: string
    data_type: string
    unit: string
    source_names: string[]
  }>
  metadata?: {
    author?: string
    license?: string
    tested_with?: string[]
    known_issues?: string[]
  }
}

interface AdapterResponse {
  id: string
  name: string
  version: string
  vendor: string
  description?: string
  website?: string
  channelCount: number
  categories: string[]
  fileFormat: 'csv' | 'binary'
  extensions: string[]
}

export default defineEventHandler(async (): Promise<AdapterResponse[]> => {
  // Path to OECUASpecs adapters directory (sibling repo)
  const adaptersPath = resolve(process.cwd(), '../OECUASpecs/adapters')

  const adapters: AdapterResponse[] = []

  try {
    // Read vendor directories
    const vendors = await readdir(adaptersPath, { withFileTypes: true })

    for (const vendor of vendors) {
      if (!vendor.isDirectory()) continue

      const vendorPath = join(adaptersPath, vendor.name)
      const files = await readdir(vendorPath)

      for (const file of files) {
        if (!file.endsWith('.adapter.yaml') && !file.endsWith('.adapter.yml')) {
          continue
        }

        try {
          const filePath = join(vendorPath, file)
          const content = await readFile(filePath, 'utf-8')
          const yaml = parse(content) as AdapterYaml

          // Extract unique categories from channels
          const categories = [...new Set(yaml.channels.map(c => c.category))]

          adapters.push({
            id: yaml.id,
            name: yaml.name,
            version: yaml.version,
            vendor: yaml.vendor,
            description: yaml.description?.split('\n')[0].trim(), // First line only
            website: yaml.website,
            channelCount: yaml.channels.length,
            categories,
            fileFormat: yaml.file_format.type,
            extensions: yaml.file_format.extensions,
          })
        }
        catch (err) {
          console.error(`Failed to parse adapter ${file}:`, err)
        }
      }
    }
  }
  catch (err) {
    console.error('Failed to read adapters directory:', err)
  }

  // Sort by vendor, then by name
  return adapters.sort((a, b) => {
    const vendorCmp = a.vendor.localeCompare(b.vendor)
    if (vendorCmp !== 0) return vendorCmp
    return a.name.localeCompare(b.name)
  })
})
