import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
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
    delimiter?: string
    endianness?: string
    magic_bytes?: number[]
    header_row?: number
    data_start_row?: number
    timestamp_column?: string
    timestamp_unit?: string
  }
  channels: Array<{
    id: string
    name: string
    description?: string
    category: string
    data_type: string
    unit: string
    min?: number
    max?: number
    precision?: number
    source_names: string[]
  }>
  metadata?: {
    author?: string
    license?: string
    tested_with?: string[]
    known_issues?: string[]
    changelog?: Array<{
      version: string
      date: string
      changes: string[]
    }>
  }
}

export default defineEventHandler(async (event) => {
  const vendor = getRouterParam(event, 'vendor')
  const id = getRouterParam(event, 'id')

  if (!vendor || !id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing vendor or adapter id',
    })
  }

  // Path to OECUASpecs adapters directory (sibling repo)
  const adaptersPath = resolve(process.cwd(), '../OECUASpecs/adapters')
  const filePath = resolve(adaptersPath, vendor, `${id}.adapter.yaml`)

  try {
    const content = await readFile(filePath, 'utf-8')
    const yaml = parse(content) as AdapterYaml

    return {
      openecualliance: yaml.openecualliance,
      id: yaml.id,
      name: yaml.name,
      version: yaml.version,
      vendor: yaml.vendor,
      description: yaml.description,
      website: yaml.website,
      fileFormat: yaml.file_format,
      channels: yaml.channels.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        category: c.category,
        dataType: c.data_type,
        unit: c.unit,
        min: c.min,
        max: c.max,
        precision: c.precision,
        sourceNames: c.source_names,
      })),
      metadata: yaml.metadata
        ? {
            author: yaml.metadata.author,
            license: yaml.metadata.license,
            testedWith: yaml.metadata.tested_with,
            knownIssues: yaml.metadata.known_issues,
            changelog: yaml.metadata.changelog,
          }
        : undefined,
    }
  }
  catch {
    throw createError({
      statusCode: 404,
      statusMessage: `Adapter not found: ${vendor}/${id}`,
    })
  }
})
