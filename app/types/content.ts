import type { Adapter, AdapterDetail, AdapterBranding } from './adapter';
import type { Protocol, ProtocolDetail, ProtocolBranding } from './protocol';
import type { Model, ModelDetail, ModelBranding } from './model';

/**
 * Content types available in the marketplace
 */
export type ContentType = 'adapter' | 'protocol' | 'model';

/**
 * Common branding interface shared by all content types
 */
export type ContentBranding = AdapterBranding | ProtocolBranding | ModelBranding;

/**
 * Common metadata interface
 */
export interface ContentMetadata {
  author?: string;
  license?: string;
  repository?: string;
  changelog?: Array<{
    version: string;
    date: string;
    changes: string[];
  }>;
}

/**
 * Base content properties shared by all list items
 */
export interface BaseContent {
  id: string;
  name: string;
  version: string;
  vendor?: string;
  description?: string;
}

/**
 * Union type for any content list item
 */
export type AnyContent =
  | (Adapter & { type: 'adapter' })
  | (Protocol & { type: 'protocol' })
  | (Model & { type: 'model' });

/**
 * Union type for any content detail
 */
export type AnyContentDetail = AdapterDetail | ProtocolDetail | ModelDetail;

/**
 * Content with type discriminator for unified lists
 */
export interface ContentListItem extends BaseContent {
  type: ContentType;
  branding?: ContentBranding;
  // Type-specific summary info
  channelCount?: number; // adapter
  messageCount?: number; // protocol
  signalCount?: number; // protocol
  category?: string; // model
  primaryImage?: string; // model
}

/**
 * Content filter options for marketplace
 */
export interface ContentFilters {
  type?: ContentType | 'all';
  vendor?: string;
  search?: string;
  category?: string; // For models
  format?: string; // For adapters (csv/binary)
  protocolType?: string; // For protocols (can/canfd/lin)
}

/**
 * Sort options for content lists
 */
export type ContentSortField = 'name' | 'vendor' | 'version' | 'type';
export type ContentSortOrder = 'asc' | 'desc';

export interface ContentSort {
  field: ContentSortField;
  order: ContentSortOrder;
}

// Re-export individual types for convenience
export type { Adapter, AdapterDetail, AdapterBranding } from './adapter';
export type { Protocol, ProtocolDetail, ProtocolBranding } from './protocol';
export type { Model, ModelDetail, ModelBranding, ModelCategory } from './model';
