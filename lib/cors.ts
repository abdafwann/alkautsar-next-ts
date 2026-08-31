/**
 * CORS Configuration
 * Controls Cross-Origin Resource Sharing for API routes
 */

export const CORS_CONFIG = {
  // Allowed origins - change these to your production domains
  allowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://alkautsar.com',
  ],

  // Allowed HTTP methods
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
  ],

  // Headers exposed to the client
  exposedHeaders: [
    'X-Request-Id',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],

  // Credentials support
  supportsCredentials: true,

  // Preflight cache duration (in seconds)
  maxAge: 86400, // 24 hours
} as const;

/**
 * Check if an origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return CORS_CONFIG.allowedOrigins.some(allowed => {
    if (allowed === '*' || allowed === origin) return true;
    try {
      const originHost = new URL(origin).hostname;
      const allowedHost = new URL(allowed.startsWith('http') ? allowed : `https://${allowed}`).hostname;
      return originHost === allowedHost || originHost.endsWith(`.${allowedHost}`);
    } catch {
      return false;
    }
  });
}

/**
 * Get CORS headers for a request
 */
export function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin');
  const headers: Record<string, string> = {};

  // Determine allowed origin
  if (isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin || CORS_CONFIG.allowedOrigins[0];
  }

  // Set other CORS headers
  headers['Access-Control-Allow-Methods'] = CORS_CONFIG.allowedMethods.join(', ');
  headers['Access-Control-Allow-Headers'] = CORS_CONFIG.allowedHeaders.join(', ');
  headers['Access-Control-Expose-Headers'] = CORS_CONFIG.exposedHeaders.join(', ');
  headers['Access-Control-Max-Age'] = CORS_CONFIG.maxAge.toString();

  if (CORS_CONFIG.supportsCredentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}
