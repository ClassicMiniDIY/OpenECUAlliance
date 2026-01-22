/**
 * Rate limiting and security types for OpenECU Alliance API
 */

/**
 * Rate limit window entry tracking requests within a time window
 */
export interface RateLimitWindow {
  /** Timestamp of each request in this window */
  requests: number[];
  /** Timestamp when the window was first created */
  firstRequest: number;
  /** Number of times this IP has been blocked for violations */
  violations: number;
  /** Timestamp when the current block expires (if blocked) */
  blockedUntil?: number;
}

/**
 * Rate limit entry tracking both per-minute and per-hour windows
 */
export interface RateLimitEntry {
  /** Sliding window for per-minute rate limit */
  minuteWindow: RateLimitWindow;
  /** Sliding window for per-hour rate limit */
  hourWindow: RateLimitWindow;
  /** Last time this entry was accessed (for LRU eviction) */
  lastAccessed: number;
}

/**
 * Rate limit configuration for an endpoint
 */
export interface RateLimitConfig {
  /** Maximum requests allowed per minute */
  perMinute: number;
  /** Maximum requests allowed per hour */
  perHour: number;
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Remaining requests in the minute window */
  remainingMinute: number;
  /** Remaining requests in the hour window */
  remainingHour: number;
  /** Timestamp when the minute window resets */
  resetMinute: number;
  /** Timestamp when the hour window resets */
  resetHour: number;
  /** If blocked, how many seconds until the block expires */
  retryAfter?: number;
  /** Which limit was exceeded ('minute' or 'hour') */
  limitType?: 'minute' | 'hour';
}

/**
 * Client behavior tracking for suspicious pattern detection
 */
export interface ClientBehavior {
  /** Total number of requests */
  totalRequests: number;
  /** Number of 4xx errors received */
  errorCount: number;
  /** Number of different endpoints accessed */
  uniqueEndpoints: Set<string>;
  /** Timestamp of first request */
  firstSeen: number;
  /** Timestamp of last request */
  lastSeen: number;
  /** Whether this client has been flagged as suspicious */
  suspicious: boolean;
  /** User-agent string */
  userAgent?: string;
}

/**
 * Security configuration
 */
export interface SecurityConfig {
  /** Maximum request body size in bytes */
  maxRequestSize: number;
  /** Request timeout in milliseconds */
  requestTimeout: number;
  /** Whether to trust proxy headers for IP detection */
  trustProxy: boolean;
  /** Whether to log rate limit violations */
  logViolations: boolean;
  /** Whether to log suspicious patterns */
  logSuspiciousPatterns: boolean;
}

/**
 * Rate limit configuration runtime config
 */
export interface RateLimitRuntimeConfig {
  enabled: boolean;
  listPerMinute: number;
  listPerHour: number;
  detailPerMinute: number;
  detailPerHour: number;
  downloadPerMinute: number;
  downloadPerHour: number;
  assetPerMinute: number;
  assetPerHour: number;
  modelPerMinute: number;
  modelPerHour: number;
  postPerMinute: number;
  postPerHour: number;
  userPerMinute: number;
  userPerHour: number;
  blockDuration: number;
  whitelist: string[];
}
