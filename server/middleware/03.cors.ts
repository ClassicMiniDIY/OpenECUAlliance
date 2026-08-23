/**
 * CORS middleware for OpenECU Alliance API
 *
 * Features:
 * - Configures CORS headers for API endpoints
 * - Allows cross-origin requests from legitimate origins
 * - Handles preflight OPTIONS requests
 * - Development vs production mode awareness
 *
 * Middleware naming:
 * - Prefixed with "03." to run after rate limiting and security checks
 */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const path = event.node.req.url || '';

  // Only apply to API routes
  if (!path.startsWith('/api/')) {
    return;
  }

  const origin = getHeader(event, 'origin');
  const isDev = process.env.NODE_ENV === 'development';
  const method = event.node.req.method || 'GET';

  // Public read-only endpoints: the spec/docs pages tell third-party
  // developers to fetch() these from their own sites, so reads get a
  // credential-less wildcard. Never send Allow-Credentials with '*'.
  const publicReadPrefixes = ['/api/specs/', '/api/adapters', '/api/protocols', '/api/assets/'];
  const isPublicRead =
    (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') &&
    publicReadPrefixes.some((prefix) => path.startsWith(prefix));

  if (isPublicRead) {
    setResponseHeader(event, 'Access-Control-Allow-Origin', '*');

    if (method === 'OPTIONS') {
      setResponseHeader(event, 'Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      setResponseHeader(event, 'Access-Control-Allow-Headers', 'Content-Type');
      setResponseHeader(event, 'Access-Control-Max-Age', 86400);
      event.node.res.statusCode = 204;
      event.node.res.end();
      return;
    }

    setResponseHeader(event, 'X-Content-Type-Options', 'nosniff');
    return;
  }

  // Allowed origins — oecua.org is the primary domain; the openecualliance.org
  // forms stay until its 301s have been live for a while.
  const allowedOrigins = [
    'https://oecua.org',
    'https://www.oecua.org',
    'https://openecualliance.org',
    'https://www.openecualliance.org',
  ];

  // In development, allow localhost origins
  if (isDev) {
    allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173');
  }

  // Check if origin is allowed. Exact match only — a startsWith check would
  // accept attacker domains like https://oecua.org.evil.com, and this branch
  // also sets Allow-Credentials.
  const isAllowedOrigin =
    isDev || // Allow all origins in development
    !origin || // No origin header (same-origin request)
    allowedOrigins.includes(origin);

  if (isAllowedOrigin && origin) {
    // Set CORS headers for allowed origins
    setResponseHeader(event, 'Access-Control-Allow-Origin', origin);
    setResponseHeader(event, 'Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    // Same-origin requests don't need CORS headers
    // But we can set a permissive default for API access
    setResponseHeader(event, 'Access-Control-Allow-Origin', '*');
  }

  // Handle preflight OPTIONS requests
  if (event.node.req.method === 'OPTIONS') {
    // Set allowed methods
    setResponseHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    // Set allowed headers
    const requestedHeaders = getHeader(event, 'access-control-request-headers');
    if (requestedHeaders) {
      setResponseHeader(event, 'Access-Control-Allow-Headers', requestedHeaders);
    } else {
      setResponseHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }

    // Cache preflight response for 24 hours
    setResponseHeader(event, 'Access-Control-Max-Age', 86400);

    // Return 204 No Content for preflight
    event.node.res.statusCode = 204;
    event.node.res.end();
    return;
  }

  // Set additional security headers
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff');
  setResponseHeader(event, 'X-Frame-Options', 'DENY');
  setResponseHeader(event, 'X-XSS-Protection', '1; mode=block');

  // Vary header to indicate response varies based on origin
  setResponseHeader(event, 'Vary', 'Origin');

  // Continue to next handler
});
