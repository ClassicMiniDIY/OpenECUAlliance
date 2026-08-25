/**
 * Maps ECU vendor names to their corresponding Heroicons.
 * Used for consistent icon display across adapter cards and detail pages.
 */
const vendorIcons: Record<string, string> = {
  haltech: 'i-heroicons-cpu-chip',
  link: 'i-heroicons-link',
  aim: 'i-heroicons-chart-bar',
  ecumaster: 'i-heroicons-cog-6-tooth',
  motec: 'i-heroicons-adjustments-horizontal',
  aem: 'i-heroicons-bolt',
  holley: 'i-heroicons-fire',
  fueltech: 'i-heroicons-beaker',
  megasquirt: 'i-heroicons-square-3-stack-3d',
  speeduino: 'i-heroicons-rocket-launch',
  rusefi: 'i-heroicons-wrench-screwdriver',
  romraider: 'i-heroicons-document-chart-bar',
  bmw: 'i-simple-icons-bmw',
};

const defaultIcon = 'i-heroicons-document';

export function useVendorIcons() {
  function getVendorIcon(vendor: string): string {
    return vendorIcons[vendor.toLowerCase()] || defaultIcon;
  }

  return {
    vendorIcons,
    defaultIcon,
    getVendorIcon,
  };
}
