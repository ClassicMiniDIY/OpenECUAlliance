import { parse } from "yaml";
import {
  fetchAllProtocolPaths,
  fetchGitHubFile,
  getAssetUrl,
} from "../utils/github";

interface ProtocolYaml {
  openecualliance: string;
  type: "protocol";
  id: string;
  name: string;
  version: string;
  vendor: string;
  description?: string;
  website?: string;
  branding?: {
    logo?: string;
    icon?: string;
    banner?: string;
    color_primary?: string;
    color_secondary?: string;
  };
  protocol: {
    type: "can" | "canfd" | "lin" | "k-line";
    baudrate: number;
  };
  messages: Array<{
    id: number | string;
    name: string;
    signals: Array<{
      name: string;
    }>;
  }>;
}

interface ProtocolBranding {
  logo?: string;
  icon?: string;
  banner?: string;
  colorPrimary?: string;
  colorSecondary?: string;
}

interface ProtocolResponse {
  id: string;
  name: string;
  version: string;
  vendor: string;
  description?: string;
  website?: string;
  protocolType: "can" | "canfd" | "lin" | "k-line";
  baudrate: number;
  messageCount: number;
  signalCount: number;
  branding?: ProtocolBranding;
}

export default defineCachedEventHandler(
  async (): Promise<ProtocolResponse[]> => {
    const protocols: ProtocolResponse[] = [];

    try {
      // Fetch list of all protocol files from GitHub
      const protocolPaths = await fetchAllProtocolPaths();

      // Fetch and parse each protocol file
      const fetchPromises = protocolPaths.map(async ({ vendor, file }) => {
        try {
          const path = `protocols/${vendor}/${file}`;
          const content = await fetchGitHubFile(path);
          const yaml = parse(content) as ProtocolYaml;

          // Count total signals across all messages
          const signalCount = yaml.messages.reduce(
            (total, msg) => total + (msg.signals?.length || 0),
            0,
          );

          // Build branding with full URLs
          const branding: ProtocolBranding | undefined = yaml.branding
            ? {
                logo: yaml.branding.logo
                  ? getAssetUrl("logos", yaml.branding.logo)
                  : undefined,
                icon: yaml.branding.icon
                  ? getAssetUrl("icons", yaml.branding.icon)
                  : undefined,
                banner: yaml.branding.banner
                  ? getAssetUrl("banners", yaml.branding.banner)
                  : undefined,
                colorPrimary: yaml.branding.color_primary,
                colorSecondary: yaml.branding.color_secondary,
              }
            : undefined;

          return {
            id: yaml.id,
            name: yaml.name,
            version: yaml.version,
            vendor: yaml.vendor,
            description: yaml.description?.split("\n")[0].trim(), // First line only
            website: yaml.website,
            protocolType: yaml.protocol.type,
            baudrate: yaml.protocol.baudrate,
            messageCount: yaml.messages.length,
            signalCount,
            branding,
          } as ProtocolResponse;
        } catch (err) {
          console.error(`Failed to fetch protocol ${vendor}/${file}:`, err);
          return null;
        }
      });

      const results = await Promise.all(fetchPromises);
      protocols.push(
        ...results.filter((p): p is ProtocolResponse => p !== null),
      );
    } catch (err) {
      console.error("Failed to fetch protocols from GitHub:", err);
    }

    // Sort by vendor, then by name
    return protocols.sort((a, b) => {
      const vendorCmp = a.vendor.localeCompare(b.vendor);
      if (vendorCmp !== 0) return vendorCmp;
      return a.name.localeCompare(b.name);
    });
  },
  {
    maxAge: 60 * 5, // Cache for 5 minutes
    name: "protocols-list",
    getKey: () => "all",
  },
);
