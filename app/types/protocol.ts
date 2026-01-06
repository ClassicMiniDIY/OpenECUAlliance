export interface ProtocolBranding {
  logo?: string;
  icon?: string;
  banner?: string;
  colorPrimary?: string;
  colorSecondary?: string;
}

export interface ProtocolSpec {
  type: "can" | "canfd" | "lin" | "k-line";
  baudrate: number;
  extendedId?: boolean;
  dataBaudrate?: number;
  fdEnabled?: boolean;
  baseId?: number;
  baseIdConfigurable?: boolean;
  baseIdRange?: {
    min: number;
    max: number;
  };
}

export interface ProtocolSignal {
  name: string;
  description?: string;
  startBit: number;
  length: number;
  byteOrder: "little_endian" | "big_endian";
  dataType: "unsigned" | "signed" | "float" | "double";
  scale?: number;
  offset?: number;
  unit?: string;
  min?: number;
  max?: number;
  enumRef?: string;
  multiplexerValue?: number;
  comment?: string;
}

export interface ProtocolMessage {
  id: number | string;
  name: string;
  description?: string;
  length: number;
  intervalMs?: number;
  transmitter?: string;
  signals: ProtocolSignal[];
  multiplexer?: {
    signalName: string;
    startBit: number;
    length: number;
  };
}

export interface ProtocolEnum {
  name: string;
  description?: string;
  values: Record<string, string>;
}

export interface ProtocolMetadata {
  author?: string;
  license?: string;
  sourceUrl?: string;
  repository?: string;
  testedWith?: string[];
  compatibleTools?: string[];
  knownIssues?: string[];
  changelog?: Array<{
    version: string;
    date: string;
    changes: string[];
  }>;
}

/**
 * Summary protocol for list views
 */
export interface Protocol {
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

/**
 * Full protocol detail for detail views
 */
export interface ProtocolDetail {
  openecualliance: string;
  type: "protocol";
  id: string;
  name: string;
  version: string;
  vendor: string;
  description?: string;
  website?: string;
  protocol: ProtocolSpec;
  messages: ProtocolMessage[];
  enums?: ProtocolEnum[];
  branding?: ProtocolBranding;
  metadata?: ProtocolMetadata;
}
