import { z } from 'zod';

/**
 * Zod schema for validating protocol YAML files.
 *
 * Protocols went unvalidated until 2026-08-24, which is how the MaxxECU file
 * shipped with message IDs and a baud rate that matched no real bus. Anything
 * mechanically checkable belongs here or in scripts/validate-specs.ts.
 */

export const ProtocolBrandingSchema = z
  .object({
    logo: z.string().optional(),
    icon: z.string().optional(),
    banner: z.string().optional(),
    color_primary: z.string().optional(),
    color_secondary: z.string().optional(),
  })
  .optional();

/** canonical = raw * scale + offset. Declared when a signal is not already in the canonical unit. */
export const ToCanonicalSchema = z
  .object({
    scale: z.number(),
    offset: z.number(),
  })
  .optional();

export const ProtocolSignalSchema = z.object({
  /** Canonical channel id from specs/channels.yaml. Optional until the Phase 3 mapping pass lands. */
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  start_bit: z.number().int().min(0),
  length: z.number().int().min(1).max(64),
  byte_order: z.enum(['little_endian', 'big_endian']),
  data_type: z.enum(['signed', 'unsigned', 'float', 'bool', 'enum']),
  scale: z.number(),
  offset: z.number(),
  unit: z.string(),
  min: z.number().optional(),
  max: z.number().optional(),
  comment: z.string().optional(),
  /** Set when the vendor's own documentation is self-contradictory here. Records the conflict rather than guessing. */
  disputed: z.string().optional(),
  /** Padding or transport filler. Carries no measurement, so it gets no canonical id. */
  reserved: z.boolean().optional(),
  /**
   * A real measurement with no canonical equivalent — vendor-specific gearbox,
   * torque-management or diagnostic-transport fields. Marked deliberately so it
   * is distinguishable from a signal nobody has mapped yet.
   */
  vendor_specific: z.boolean().optional(),
  to_canonical: ToCanonicalSchema,
  values: z.record(z.string(), z.string()).optional(),
});

export const ProtocolMessageSchema = z.object({
  id: z.union([z.number().int().min(0), z.string().min(1)]),
  name: z.string().min(1),
  description: z.string().optional(),
  length: z.number().int().min(0).max(8),
  interval_ms: z.number().optional(),
  transmitter: z.string().optional(),
  vendor_message_name: z.string().optional(),
  min_firmware: z.string().optional(),
  signals: z.array(ProtocolSignalSchema),
});

export const ProtocolTransportSchema = z.object({
  type: z.enum(['can', 'canfd', 'lin', 'serial']),
  baudrate: z.number().int().min(1),
  extended_id: z.boolean().optional(),
  base_address: z.union([z.number().int(), z.string()]).optional(),
  base_address_configurable: z.boolean().optional(),
});

export const ProtocolMetadataSchema = z
  .object({
    author: z.string().optional(),
    license: z.string().optional(),
    source_url: z.string().optional(),
    vendor_protocol_version: z.string().optional(),
    tested_with: z.array(z.string()).optional(),
    compatible_tools: z.array(z.string()).optional(),
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

export const ProtocolYamlSchema = z.object({
  openecualliance: z.string().min(1),
  type: z.literal('protocol'),
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  vendor: z.string().min(1),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  branding: ProtocolBrandingSchema,
  protocol: ProtocolTransportSchema,
  messages: z.array(ProtocolMessageSchema).min(1),
  metadata: ProtocolMetadataSchema,
});

export type ProtocolYaml = z.infer<typeof ProtocolYamlSchema>;
export type ProtocolMessage = z.infer<typeof ProtocolMessageSchema>;
export type ProtocolSignal = z.infer<typeof ProtocolSignalSchema>;
