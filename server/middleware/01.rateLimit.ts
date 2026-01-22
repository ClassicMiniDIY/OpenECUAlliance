import { getClientIp, isIpWhitelisted } from '../utils/ipDetection';
import { getRateLimitCache, getRateLimitConfigForPath } from '../utils/rateLimit';

/**
 * Rate limiting middleware for OpenECU Alliance API
 *
 * Features:
 * - Per-IP rate limiting with sliding window algorithm
 * - Different limits for different endpoint types
 * - Automatic blocking after violations
 * - IP whitelist support
 * - Rate limit headers on all responses
 *
 * Middleware naming:
 * - Prefixed with "01." to ensure it runs before other middleware
 * - Nuxt executes middleware in alphanumeric order
 */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const path = event.node.req.url || '';

  // Only apply to API routes
  if (!path.startsWith('/api/')) {
    return;
  }

  // Check if rate limiting is enabled
  if (!config.rateLimit?.enabled) {
    return;
  }

  // Get client IP
  const clientIp = getClientIp(event, config.security?.trustProxy ?? true);

  // Check whitelist
  if (isIpWhitelisted(clientIp, config.rateLimit.whitelist || [])) {
    // Whitelisted IPs bypass rate limiting but still get headers
    setResponseHeader(event, 'X-RateLimit-Whitelisted', 'true');
    return;
  }

  // Get rate limit configuration for this endpoint
  const rateLimitConfig = getRateLimitConfigForPath(path, config);

  // Get rate limit cache
  const cache = getRateLimitCache(
    10000, // maxSize
    config.rateLimit.blockDuration || 900 // blockDuration in seconds
  );

  // Check rate limit
  const result = cache.checkLimit(clientIp, rateLimitConfig);

  // Set rate limit headers
  setResponseHeader(event, 'X-RateLimit-Limit-Minute', rateLimitConfig.perMinute.toString());
  setResponseHeader(event, 'X-RateLimit-Limit-Hour', rateLimitConfig.perHour.toString());
  setResponseHeader(event, 'X-RateLimit-Remaining-Minute', result.remainingMinute.toString());
  setResponseHeader(event, 'X-RateLimit-Remaining-Hour', result.remainingHour.toString());
  setResponseHeader(event, 'X-RateLimit-Reset-Minute', Math.floor(result.resetMinute / 1000).toString());
  setResponseHeader(event, 'X-RateLimit-Reset-Hour', Math.floor(result.resetHour / 1000).toString());

  // If rate limit exceeded, return 429 error
  if (!result.allowed) {
    // Log violation if configured
    if (config.security?.logViolations) {
      console.warn(`[Rate Limit] IP ${clientIp} exceeded ${result.limitType} limit on ${path}`);
    }

    // Set Retry-After header
    if (result.retryAfter) {
      setResponseHeader(event, 'Retry-After', result.retryAfter);
    }

    // Return 429 Too Many Requests
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      data: {
        error: 'Rate limit exceeded',
        message: `You have exceeded the ${result.limitType} rate limit. Please try again later.`,
        retryAfter: result.retryAfter,
        limit: {
          perMinute: rateLimitConfig.perMinute,
          perHour: rateLimitConfig.perHour,
        },
        remaining: {
          perMinute: result.remainingMinute,
          perHour: result.remainingHour,
        },
        reset: {
          minute: Math.floor(result.resetMinute / 1000),
          hour: Math.floor(result.resetHour / 1000),
        },
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Request allowed - continue to next handler
});
