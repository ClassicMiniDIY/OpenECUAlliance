import type { H3Event } from 'h3';

/**
 * Extract client IP address from request headers
 * Supports various proxy headers (Cloudflare, nginx, etc.)
 *
 * Priority order:
 * 1. CF-Connecting-IP (Cloudflare)
 * 2. X-Real-IP (nginx)
 * 3. X-Forwarded-For (standard proxy header, takes first IP)
 * 4. req.socket.remoteAddress (direct connection)
 *
 * @param event - H3 event object
 * @param trustProxy - Whether to trust proxy headers
 * @returns Client IP address or 'unknown' if unable to determine
 */
export function getClientIp(event: H3Event, trustProxy = true): string {
  if (!trustProxy) {
    // If we don't trust proxies, only use direct connection IP.
    // socket is undefined on Cloudflare Workers — optional-chain it.
    return event.node.req.socket?.remoteAddress || 'unknown';
  }

  // Check Cloudflare header first
  const cfConnectingIp = getHeader(event, 'cf-connecting-ip');
  if (cfConnectingIp && isValidIp(cfConnectingIp)) {
    return normalizeIp(cfConnectingIp);
  }

  // Check X-Real-IP (nginx)
  const xRealIp = getHeader(event, 'x-real-ip');
  if (xRealIp && isValidIp(xRealIp)) {
    return normalizeIp(xRealIp);
  }

  // Check X-Forwarded-For (standard proxy header)
  // Format: "client, proxy1, proxy2"
  // We want the first (original client) IP
  const xForwardedFor = getHeader(event, 'x-forwarded-for');
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',').map((ip) => ip.trim());
    const firstIp = ips[0];
    if (firstIp && isValidIp(firstIp)) {
      return normalizeIp(firstIp);
    }
  }

  // Fall back to direct connection IP (socket is undefined on Cloudflare Workers)
  const remoteAddress = event.node.req.socket?.remoteAddress;
  if (remoteAddress && isValidIp(remoteAddress)) {
    return normalizeIp(remoteAddress);
  }

  return 'unknown';
}

/**
 * Validate that a string is a valid IP address (IPv4 or IPv6)
 *
 * @param ip - IP address string to validate
 * @returns Whether the IP is valid
 */
function isValidIp(ip: string): boolean {
  // Basic validation - check it's not empty and doesn't contain suspicious characters
  if (!ip || ip.length === 0 || ip.length > 45) {
    return false;
  }

  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Pattern.test(ip)) {
    // Validate each octet is 0-255
    const octets = ip.split('.');
    return octets.every((octet) => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }

  // IPv6 pattern (simplified - full validation is complex)
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  if (ipv6Pattern.test(ip)) {
    return true;
  }

  // IPv6 with IPv4 suffix (e.g., ::ffff:192.0.2.1)
  const ipv6MappedPattern = /^::ffff:(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv6MappedPattern.test(ip)) {
    return true;
  }

  return false;
}

/**
 * Normalize IP address format
 * Converts IPv6-mapped IPv4 addresses to IPv4 format
 *
 * @param ip - IP address to normalize
 * @returns Normalized IP address
 */
function normalizeIp(ip: string): string {
  // Convert IPv6-mapped IPv4 to IPv4
  // e.g., "::ffff:192.0.2.1" -> "192.0.2.1"
  if (ip.startsWith('::ffff:')) {
    const ipv4 = ip.substring(7);
    if (isValidIp(ipv4)) {
      return ipv4;
    }
  }

  // Remove IPv6 zone identifier if present
  // e.g., "fe80::1%eth0" -> "fe80::1"
  const zoneIndex = ip.indexOf('%');
  if (zoneIndex !== -1) {
    return ip.substring(0, zoneIndex);
  }

  return ip;
}

/**
 * Check if an IP address is in a whitelist
 * Supports exact matches and CIDR notation
 *
 * @param ip - IP address to check
 * @param whitelist - Array of whitelisted IPs or CIDR ranges
 * @returns Whether the IP is whitelisted
 */
export function isIpWhitelisted(ip: string, whitelist: string[]): boolean {
  if (!whitelist || whitelist.length === 0) {
    return false;
  }

  // Check for exact match first
  if (whitelist.includes(ip)) {
    return true;
  }

  // TODO: Implement CIDR matching if needed
  // For now, only exact matches are supported

  return false;
}
