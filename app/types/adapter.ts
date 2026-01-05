export interface Adapter {
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

export interface AdapterChannel {
  id: string
  name: string
  description?: string
  category: string
  dataType: 'float' | 'int' | 'bool' | 'string' | 'enum'
  unit: string
  min?: number
  max?: number
  sourceNames: string[]
}

export interface AdapterDetail extends Adapter {
  openecualliance: string
  channels: AdapterChannel[]
  metadata?: {
    author?: string
    license?: string
    repository?: string
    testedWith?: string[]
    knownIssues?: string[]
  }
}
