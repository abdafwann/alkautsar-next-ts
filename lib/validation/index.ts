// Validation schemas export
export * from './product';
export * from './category';
export * from './banner';
export * from './voucher';
export * from './article';
export * from './settings';

/**
 * Common validation utilities
 */

/**
 * Sanitize string input - remove potentially dangerous characters
 * Handles undefined/null by returning empty string
 */
export function sanitizeString(input: string | undefined | null): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize HTML content using DOMPurify
 */
export { sanitizeHTML, sanitizeHTMLWithSafeLinks } from '@/lib/sanitize';

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

/**
 * Generic validation helper
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  });

  return { success: false, errors };
}

// Import zod for the validate helper
import { z } from 'zod';
