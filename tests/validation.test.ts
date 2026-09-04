/**
 * Tests for lib/validation/index.ts
 * Specifically tests the sanitizeString function
 */

import { describe, it, expect } from 'vitest';
import { sanitizeString, isValidEmail } from '../lib/validation';

describe('Validation Utilities', () => {
  describe('sanitizeString', () => {
    it('should remove angle brackets', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    });

    it('should remove javascript: protocol', () => {
      expect(sanitizeString('javascript:alert("xss")')).toBe('alert("xss")');
      expect(sanitizeString('JAVASCRIPT:alert("xss")')).toBe('alert("xss")');
    });

    it('should remove event handlers', () => {
      // The function removes onXXX= patterns
      expect(sanitizeString('onclick=alert("xss")')).not.toContain('onclick');
      expect(sanitizeString('onerror=alert("xss")')).not.toContain('onerror');
      expect(sanitizeString('onload=alert("xss")')).not.toContain('onload');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  hello world  ')).toBe('hello world');
    });

    it('should handle undefined input', () => {
      expect(sanitizeString(undefined)).toBe('');
    });

    it('should handle null input', () => {
      expect(sanitizeString(null)).toBe('');
    });

    it('should handle empty string', () => {
      expect(sanitizeString('')).toBe('');
    });

    it('should preserve normal text', () => {
      expect(sanitizeString('Hello World 123')).toBe('Hello World 123');
      expect(sanitizeString('Product Name - 500mg')).toBe('Product Name - 500mg');
    });

    it('should handle complex XSS attempts', () => {
      const xssAttempt = '<img src=x onerror=alert("XSS")>';
      const result = sanitizeString(xssAttempt);
      // Function removes angle brackets and event handlers
      expect(result).not.toContain('<img');
      expect(result).not.toContain('onerror');
    });
  });

  describe('isValidEmail', () => {
    it('should accept valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.id')).toBe(true);
      expect(isValidEmail('user+tag@gmail.com')).toBe(true);
      expect(isValidEmail('test123@test.co')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('no@domain')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('spaces in@email.com')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('a@b.com')).toBe(true); // Minimal valid email
    });
  });
});
