import { getClientIp } from '../utils/ipDetection';

/**
 * Security middleware for OpenECU Alliance API
 *
 * Features:
 * - Request size limits to prevent memory exhaustion
 * - User-agent validation to detect suspicious bots
 * - Suspicious pattern detection (enumeration, scraping)
 * - Request timeout protection
 *
 * Middleware naming:
 * - Prefixed with "02." to run after rate limiting
 */

// Track suspicious behavior per IP
const suspiciousPatterns = new Map<
  string,
  {
    consecutiveErrors: number;
    uniquePaths: Set<string>;
    lastRequest: number;
    userAgent?: string;
  }
>();

/**
 * Detect suspicious user-agent patterns
 */
function isSuspiciousUserAgent(userAgent?: string): boolean {
  if (!userAgent) {
    return true; // Missing user-agent is suspicious
  }

  const suspicious = [
    // Common scraping tools
    /scrapy/i,
    /crawler/i,
    /spider/i,
    /bot/i,
    /curl/i,
    /wget/i,
    /python-requests/i,
    /go-http-client/i,
    // Known bad actors
    /zgrab/i,
    /masscan/i,
    /nikto/i,
    /nmap/i,
    /sqlmap/i,
  ];

  // Allow legitimate bots
  const legitimate = [/googlebot/i, /bingbot/i, /slackbot/i, /twitterbot/i, /facebookexternalhit/i];

  // Check if it's a legitimate bot
  if (legitimate.some((pattern) => pattern.test(userAgent))) {
    return false;
  }

  // Check if it matches suspicious patterns
  return suspicious.some((pattern) => pattern.test(userAgent));
}

/**
 * Analyze request patterns to detect scraping or enumeration
 */
function analyzeRequestPattern(
  clientIp: string,
  path: string,
  userAgent?: string
): { suspicious: boolean; reason?: string } {
  const now = Date.now();
  let behavior = suspiciousPatterns.get(clientIp);

  if (!behavior) {
    behavior = {
      consecutiveErrors: 0,
      uniquePaths: new Set(),
      lastRequest: now,
      userAgent,
    };
    suspiciousPatterns.set(clientIp, behavior);
  }

  behavior.uniquePaths.add(path);
  behavior.lastRequest = now;
  behavior.userAgent = userAgent;

  // Reset after 1 hour of inactivity
  if (now - behavior.lastRequest > 60 * 60 * 1000) {
    behavior.consecutiveErrors = 0;
    behavior.uniquePaths.clear();
  }

  // Check for enumeration (accessing many different paths quickly)
  // More than 20 unique paths in the tracked set suggests enumeration
  if (behavior.uniquePaths.size > 20) {
    return {
      suspicious: true,
      reason: 'Enumeration pattern detected (accessing many different endpoints)',
    };
  }

  // Check user-agent
  if (isSuspiciousUserAgent(userAgent)) {
    return {
      suspicious: true,
      reason: `Suspicious user-agent: ${userAgent || 'none'}`,
    };
  }

  return { suspicious: false };
}

/**
 * Track error responses to detect scraping
 */
function trackErrorResponse(clientIp: string): void {
  const behavior = suspiciousPatterns.get(clientIp);
  if (behavior) {
    behavior.consecutiveErrors++;
  }
}

/**
 * Track successful responses
 */
function trackSuccessResponse(clientIp: string): void {
  const behavior = suspiciousPatterns.get(clientIp);
  if (behavior) {
    behavior.consecutiveErrors = 0;
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const path = event.node.req.url || '';

  // Only apply to API routes
  if (!path.startsWith('/api/')) {
    return;
  }

  const clientIp = getClientIp(event, config.security?.trustProxy ?? true);
  const userAgent = getHeader(event, 'user-agent');

  // Check request size for POST/PUT/PATCH requests
  const method = event.node.req.method;
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    const contentLength = getHeader(event, 'content-length');
    const maxSize = config.security?.maxRequestSize || 5 * 1024 * 1024; // 5MB default

    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (size > maxSize) {
        console.warn(`[Security] IP ${clientIp} attempted to send ${size} bytes (max: ${maxSize})`);

        throw createError({
          statusCode: 413,
          statusMessage: 'Payload Too Large',
          data: {
            error: 'Request body exceeds maximum size',
            maxSize: `${Math.floor(maxSize / 1024 / 1024)}MB`,
            receivedSize: size,
          },
        });
      }
    }
  }

  // Analyze request patterns
  const analysis = analyzeRequestPattern(clientIp, path, userAgent);

  if (analysis.suspicious) {
    if (config.security?.logSuspiciousPatterns) {
      console.warn(`[Security] Suspicious behavior from IP ${clientIp}: ${analysis.reason}`);
    }

    // Don't block, but add a header so legitimate clients can contact us
    setResponseHeader(event, 'X-Security-Warning', 'Suspicious pattern detected');
  }

  // Hook into response to track errors
  event.node.res.on('finish', () => {
    const statusCode = event.node.res.statusCode;

    if (statusCode >= 400 && statusCode < 500) {
      trackErrorResponse(clientIp);
    } else if (statusCode >= 200 && statusCode < 300) {
      trackSuccessResponse(clientIp);
    }
  });

  // Continue to next handler
});

// Clean up old entries every hour
// Use unref() so the interval doesn't prevent Node.js from exiting during build
if (typeof setInterval !== 'undefined') {
  const cleanupInterval = setInterval(
    () => {
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      for (const [ip, behavior] of suspiciousPatterns.entries()) {
        if (now - behavior.lastRequest > oneHour) {
          suspiciousPatterns.delete(ip);
        }
      }
    },
    60 * 60 * 1000
  );
  // Allow Node.js to exit even if this interval is still pending
  // This is critical for Vercel/Nitro builds to complete
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }
}
