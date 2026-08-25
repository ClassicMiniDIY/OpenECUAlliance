import { ECU_VENDORS } from '~/types/model';

/**
 * Vendor identity normalization.
 *
 * Vendor strings reach the UI from two sources with different conventions:
 * spec YAML files use lowercase slugs (`aim`, `haltech`), while user-submitted
 * 3D models store the display name from `ECU_VENDORS` (`AiM`, `Haltech`).
 * Grouping the raw strings produces duplicate filter entries, so every vendor
 * comparison and every vendor list must key off `vendorSlug()`.
 */

/**
 * Slugs that describe the same vendor under different names.
 * Key is the computed slug, value is the canonical slug.
 */
const VENDOR_SLUG_ALIASES: Record<string, string> = {
  linkecu: 'link',
};

export function vendorSlug(vendor: string): string {
  const slug = vendor.toLowerCase().replace(/[^a-z0-9]/g, '');
  return VENDOR_SLUG_ALIASES[slug] ?? slug;
}

/**
 * Display names for vendors that are not in `ECU_VENDORS`
 * (spec-only vendors) or whose casing the fallback cannot produce.
 */
const EXTRA_VENDOR_LABELS: Record<string, string> = {
  romraider: 'RomRaider',
  emerald: 'Emerald',
  bmw: 'BMW',
};

const VENDOR_LABELS: Record<string, string> = {
  ...Object.fromEntries(ECU_VENDORS.map((name) => [vendorSlug(name), name])),
  ...EXTRA_VENDOR_LABELS,
};

export function vendorLabel(vendor: string): string {
  return VENDOR_LABELS[vendorSlug(vendor)] ?? vendor.charAt(0).toUpperCase() + vendor.slice(1);
}

export interface VendorOption {
  slug: string;
  label: string;
}

/**
 * Deduplicate a list of raw vendor strings into slug/label pairs, sorted by label.
 */
export function toVendorOptions(vendors: Iterable<string | null | undefined>): VendorOption[] {
  const bySlug = new Map<string, VendorOption>();
  for (const vendor of vendors) {
    if (!vendor) continue;
    const slug = vendorSlug(vendor);
    if (!slug || bySlug.has(slug)) continue;
    bySlug.set(slug, { slug, label: vendorLabel(vendor) });
  }
  return Array.from(bySlug.values()).sort((a, b) => a.label.localeCompare(b.label));
}
