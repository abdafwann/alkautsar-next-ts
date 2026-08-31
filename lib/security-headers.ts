/**
 * Security Headers Configuration
 * Centralized security header definitions
 */

export const SECURITY_HEADERS = {
  // Content Security Policy
  CSP: {
    DEFAULT: [
      "default-src 'self'",
      "'self'",
      "'unsafe-inline'", // Required for Next.js
      "'unsafe-eval'", // Required for Next.js dev
      "https://res.cloudinary.com",
      "https://*.cloudinary.com",
    ].join('; '),

    PRODUCTION: [
      "default-src 'self'",
      "'self'",
      // Remove unsafe-inline/eval in production when possible
      "https://res.cloudinary.com",
      "https://*.cloudinary.com",
    ].join('; '),
  },

  // X-Frame-Options
  X_FRAME_OPTIONS: 'DENY',

  // X-Content-Type-Options
  X_CONTENT_TYPE_OPTIONS: 'nosniff',

  // X-XSS-Protection
  X_XSS_PROTECTION: '1; mode=block',

  // Strict-Transport-Security
  HSTS: 'max-age=31536000; includeSubDomains; preload',

  // Referrer-Policy
  REFERRER_POLICY: 'strict-origin-when-cross-origin',

  // Permissions-Policy
  PERMISSIONS_POLICY: 'camera=(), microphone=(), geolocation=(), payment=(self "https://app.midtrans.com")',
} as const;

/**
 * Cache control for sensitive pages
 */
export const SENSITIVE_PAGE_CACHE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
} as const;

/**
 * Paths that should have no-cache headers
 */
export const SENSITIVE_PATHS = [
  '/admin',
  '/checkout',
  '/account',
  '/payment',
] as const;

/**
 * Check if a path is sensitive (should have no-cache headers)
 */
export function isSensitivePath(path: string): boolean {
  return SENSITIVE_PATHS.some(sensitivePath => path.startsWith(sensitivePath));
}

/**
 * Get appropriate cache headers for a path
 */
export function getCacheHeaders(path: string): Record<string, string> {
  if (isSensitivePath(path)) {
    return SENSITIVE_PAGE_CACHE;
  }

  // Default cache headers for static content
  return {
    'Cache-Control': 'public, max-age=31536000, immutable',
  };
}
