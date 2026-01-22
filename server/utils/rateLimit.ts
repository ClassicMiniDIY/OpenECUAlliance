import type { RateLimitEntry, RateLimitConfig, RateLimitResult, RateLimitWindow } from '../types/security';

/**
 * In-memory LRU cache for rate limiting
 * Maps IP addresses to their rate limit entries
 */
class RateLimitCache {
  private cache: Map<string, RateLimitEntry>;
  private readonly maxSize: number;
  private readonly blockDuration: number; // in seconds

  constructor(maxSize = 10000, blockDuration = 900) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.blockDuration = blockDuration;
  }

  /**
   * Get or create a rate limit entry for an IP
   */
  private getEntry(ip: string): RateLimitEntry {
    let entry = this.cache.get(ip);

    if (!entry) {
      const now = Date.now();
      entry = {
        minuteWindow: {
          requests: [],
          firstRequest: now,
          violations: 0,
        },
        hourWindow: {
          requests: [],
          firstRequest: now,
          violations: 0,
        },
        lastAccessed: now,
      };
      this.cache.set(ip, entry);

      // Enforce LRU eviction if cache is full
      if (this.cache.size > this.maxSize) {
        this.evictLRU();
      }
    }

    entry.lastAccessed = Date.now();
    return entry;
  }

  /**
   * Evict the least recently used entry from the cache
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clean old requests from a window (sliding window algorithm)
   */
  private cleanWindow(window: RateLimitWindow, windowSize: number, now: number): void {
    const cutoff = now - windowSize;
    window.requests = window.requests.filter((timestamp) => timestamp > cutoff);
  }

  /**
   * Check if an IP is currently blocked
   */
  private isBlocked(entry: RateLimitEntry, now: number): boolean {
    if (entry.minuteWindow.blockedUntil && entry.minuteWindow.blockedUntil > now) {
      return true;
    }
    if (entry.hourWindow.blockedUntil && entry.hourWindow.blockedUntil > now) {
      return true;
    }
    return false;
  }

  /**
   * Block an IP for the configured duration
   */
  private blockIp(entry: RateLimitEntry, now: number, limitType: 'minute' | 'hour'): void {
    const blockedUntil = now + this.blockDuration * 1000;

    if (limitType === 'minute') {
      entry.minuteWindow.blockedUntil = blockedUntil;
      entry.minuteWindow.violations++;
    } else {
      entry.hourWindow.blockedUntil = blockedUntil;
      entry.hourWindow.violations++;
    }
  }

  /**
   * Check rate limit for an IP and record the request
   */
  checkLimit(ip: string, config: RateLimitConfig): RateLimitResult {
    const entry = this.getEntry(ip);
    const now = Date.now();

    // Check if IP is currently blocked
    if (this.isBlocked(entry, now)) {
      const minuteRetry = entry.minuteWindow.blockedUntil
        ? Math.ceil((entry.minuteWindow.blockedUntil - now) / 1000)
        : 0;
      const hourRetry = entry.hourWindow.blockedUntil ? Math.ceil((entry.hourWindow.blockedUntil - now) / 1000) : 0;
      const retryAfter = Math.max(minuteRetry, hourRetry);

      return {
        allowed: false,
        remainingMinute: 0,
        remainingHour: 0,
        resetMinute: entry.minuteWindow.blockedUntil || now,
        resetHour: entry.hourWindow.blockedUntil || now,
        retryAfter,
        limitType: minuteRetry > hourRetry ? 'minute' : 'hour',
      };
    }

    // Clean old requests (sliding window)
    const oneMinute = 60 * 1000;
    const oneHour = 60 * 60 * 1000;
    this.cleanWindow(entry.minuteWindow, oneMinute, now);
    this.cleanWindow(entry.hourWindow, oneHour, now);

    // Check minute limit
    const minuteCount = entry.minuteWindow.requests.length;
    const remainingMinute = Math.max(0, config.perMinute - minuteCount);

    // Check hour limit
    const hourCount = entry.hourWindow.requests.length;
    const remainingHour = Math.max(0, config.perHour - hourCount);

    // Calculate reset times (when oldest request expires)
    const resetMinute =
      entry.minuteWindow.requests.length > 0 ? entry.minuteWindow.requests[0] + oneMinute : now + oneMinute;
    const resetHour = entry.hourWindow.requests.length > 0 ? entry.hourWindow.requests[0] + oneHour : now + oneHour;

    // Check if either limit is exceeded
    if (minuteCount >= config.perMinute) {
      this.blockIp(entry, now, 'minute');
      return {
        allowed: false,
        remainingMinute: 0,
        remainingHour,
        resetMinute,
        resetHour,
        retryAfter: Math.ceil((resetMinute - now) / 1000),
        limitType: 'minute',
      };
    }

    if (hourCount >= config.perHour) {
      this.blockIp(entry, now, 'hour');
      return {
        allowed: false,
        remainingMinute,
        remainingHour: 0,
        resetMinute,
        resetHour,
        retryAfter: Math.ceil((resetHour - now) / 1000),
        limitType: 'hour',
      };
    }

    // Record the request
    entry.minuteWindow.requests.push(now);
    entry.hourWindow.requests.push(now);

    return {
      allowed: true,
      remainingMinute: remainingMinute - 1,
      remainingHour: remainingHour - 1,
      resetMinute,
      resetHour,
    };
  }

  /**
   * Reset rate limit for an IP (useful for testing or manual overrides)
   */
  reset(ip: string): void {
    this.cache.delete(ip);
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Global singleton instance
let rateLimitCache: RateLimitCache | null = null;

/**
 * Get or create the global rate limit cache instance
 */
export function getRateLimitCache(maxSize?: number, blockDuration?: number): RateLimitCache {
  if (!rateLimitCache) {
    rateLimitCache = new RateLimitCache(maxSize, blockDuration);
  }
  return rateLimitCache;
}

/**
 * Determine rate limit config based on endpoint path
 */
export function getRateLimitConfigForPath(path: string, runtimeConfig: any): RateLimitConfig {
  const rateLimitConfig = runtimeConfig.rateLimit;

  // POST endpoints (most restrictive)
  if (path.includes('/api/models/external/')) {
    return {
      perMinute: rateLimitConfig.postPerMinute,
      perHour: rateLimitConfig.postPerHour,
    };
  }

  // Raw download endpoints
  if (path.includes('/raw')) {
    return {
      perMinute: rateLimitConfig.downloadPerMinute,
      perHour: rateLimitConfig.downloadPerHour,
    };
  }

  // Asset endpoints
  if (path.startsWith('/api/assets/')) {
    return {
      perMinute: rateLimitConfig.assetPerMinute,
      perHour: rateLimitConfig.assetPerHour,
    };
  }

  // User profile endpoints
  if (path.startsWith('/api/users/')) {
    return {
      perMinute: rateLimitConfig.userPerMinute,
      perHour: rateLimitConfig.userPerHour,
    };
  }

  // Detail endpoints (single resource)
  if (
    path.match(/^\/api\/adapters\/[^/]+\/[^/]+$/) ||
    path.match(/^\/api\/protocols\/[^/]+\/[^/]+$/) ||
    path.match(/^\/api\/models\/[^/]+$/)
  ) {
    return {
      perMinute: rateLimitConfig.detailPerMinute,
      perHour: rateLimitConfig.detailPerHour,
    };
  }

  // Model list endpoints
  if (path.startsWith('/api/models')) {
    return {
      perMinute: rateLimitConfig.modelPerMinute,
      perHour: rateLimitConfig.modelPerHour,
    };
  }

  // List endpoints (default)
  return {
    perMinute: rateLimitConfig.listPerMinute,
    perHour: rateLimitConfig.listPerHour,
  };
}
