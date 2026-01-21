import { z } from 'zod';

/**
 * Zod schema for validating adapter YAML files
 * Ensures data integrity and prevents runtime errors from malformed YAML
 */

export const AdapterBrandingSchema = z
  .object({
    logo: z.string().optional(),
    icon: z.string().optional(),
    banner: z.string().optional(),
    color_primary: z.string().optional(),
    color_secondary: z.string().optional(),
  })
  .optional();

export const AdapterChannelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  data_type: z.enum(['float', 'int', 'bool', 'string', 'enum']),
  unit: z.string(),
  min: z.number().optional(),
  max: z.number().optional(),
  precision: z.number().optional(),
  source_names: z.array(z.string()).min(1),
});

export const AdapterFileFormatSchema = z.object({
  type: z.enum(['csv', 'binary']),
  extensions: z.array(z.string()).min(1),
  delimiter: z.string().optional(),
  endianness: z.enum(['little', 'big']).optional(),
  magic_bytes: z.array(z.number()).optional(),
  header_row: z.number().optional(),
  data_start_row: z.number().optional(),
  timestamp_column: z.union([z.string(), z.number()]).optional(),
  timestamp_unit: z.union([z.string(), z.number()]).optional(),
});

export const AdapterMetadataSchema = z
  .object({
    author: z.string().optional(),
    license: z.string().optional(),
    repository: z.string().optional(),
    tested_with: z.array(z.string()).optional(),
    known_issues: z.array(z.string()).optional(),
    changelog: z
      .array(
        z.object({
          version: z.string(),
          date: z.string(),
          changes: z.array(z.string()),
        })
      )
      .optional(),
  })
  .optional();

export const AdapterYamlSchema = z.object({
  openecualliance: z.string().min(1),
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  vendor: z.string().min(1),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  file_format: AdapterFileFormatSchema,
  channels: z.array(AdapterChannelSchema).min(1),
  branding: AdapterBrandingSchema,
  metadata: AdapterMetadataSchema,
});

export type AdapterYaml = z.infer<typeof AdapterYamlSchema>;
export type AdapterChannel = z.infer<typeof AdapterChannelSchema>;
export type AdapterFileFormat = z.infer<typeof AdapterFileFormatSchema>;
