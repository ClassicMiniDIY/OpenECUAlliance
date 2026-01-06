import type { Protocol } from "~/types/protocol";

export function useProtocols() {
  const {
    data: protocols,
    status,
    refresh,
    error,
  } = useFetch<Protocol[]>("/api/protocols", {
    key: "protocols-list",
    default: () => [],
    getCachedData(key, nuxtApp) {
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key];
    },
  });

  const loading = computed(() => status.value === "pending");

  const vendors = computed(() => {
    const vendorSet = new Set((protocols.value ?? []).map((p) => p.vendor));
    return Array.from(vendorSet).sort();
  });

  const protocolTypes = computed(() => {
    const typeSet = new Set((protocols.value ?? []).map((p) => p.protocolType));
    return Array.from(typeSet).sort();
  });

  const baudrates = computed(() => {
    const baudrateSet = new Set((protocols.value ?? []).map((p) => p.baudrate));
    return Array.from(baudrateSet).sort((a, b) => a - b);
  });

  function filterProtocols(options: {
    search?: string;
    vendor?: string;
    protocolType?: string;
  }) {
    return (protocols.value ?? []).filter((protocol) => {
      // Search filter
      if (options.search) {
        const search = options.search.toLowerCase();
        const matchesSearch =
          protocol.name.toLowerCase().includes(search) ||
          protocol.vendor.toLowerCase().includes(search) ||
          protocol.description?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Vendor filter
      if (options.vendor && protocol.vendor !== options.vendor) {
        return false;
      }

      // Protocol type filter
      if (
        options.protocolType &&
        protocol.protocolType !== options.protocolType
      ) {
        return false;
      }

      return true;
    });
  }

  function formatBaudrate(baudrate: number): string {
    if (baudrate >= 1000000) {
      return `${baudrate / 1000000} Mbps`;
    }
    if (baudrate >= 1000) {
      return `${baudrate / 1000} kbps`;
    }
    return `${baudrate} bps`;
  }

  return {
    protocols: computed(() => protocols.value ?? []),
    loading,
    error,
    vendors,
    protocolTypes,
    baudrates,
    filterProtocols,
    formatBaudrate,
    refresh,
  };
}
