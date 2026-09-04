/**
 * Tests for lib/utils.ts
 * Verifies utility functions work correctly
 */

import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateLocale,
  formatDateTime,
  formatCurrency,
  formatNumber,
  generateRandomString,
  generateSlug,
  truncate,
  escapeHtml,
  chunk,
  uniqueBy,
  groupBy,
  pick,
  omit,
  deepClone,
  isEmpty,
  isValidEmail,
  isValidUrl,
  safeJsonParse,
  sleep,
} from '../lib/utils';

describe('Utility Functions', () => {
  describe('Date Formatting', () => {
    const testDate = new Date('2024-06-15T10:30:00');

    it('formatDate should return YYYY-MM-DD', () => {
      const result = formatDate(testDate);
      expect(result).toBe('2024-06-15');
    });

    it('formatDateLocale should format in Indonesian', () => {
      const result = formatDateLocale(testDate, 'id-ID');
      expect(result).toContain('15');
      expect(result).toContain('Juni');
      expect(result).toContain('2024');
    });

    it('formatDateTime should include time', () => {
      const result = formatDateTime(testDate, 'id-ID');
      expect(result).toContain('15');
      expect(result).toContain('Jun');
    });
  });

  describe('Number Formatting', () => {
    it('formatCurrency should format as Indonesian Rupiah', () => {
      const result = formatCurrency(150000, 'id-ID');
      expect(result).toContain('150');
      expect(result).toContain('000');
    });

    it('formatCurrency should handle string input', () => {
      const result = formatCurrency('250000', 'id-ID');
      expect(result).toContain('250');
    });

    it('formatNumber should add thousand separators', () => {
      const result = formatNumber(1234567, 'id-ID');
      expect(result).toContain('1');
      expect(result).toContain('234');
    });
  });

  describe('String Utilities', () => {
    it('generateRandomString should create string of correct length', () => {
      const result = generateRandomString(16);
      expect(result.length).toBe(16);
    });

    it('generateRandomString should be alphanumeric', () => {
      const result = generateRandomString(20);
      expect(result).toMatch(/^[A-Za-z0-9]+$/);
    });

    it('generateSlug should convert text to slug format', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('Produk 123!')).toBe('produk-123');
      expect(generateSlug('  Multiple   Spaces  ')).toBe('multiple-spaces');
    });

    it('generateSlug should handle special characters', () => {
      expect(generateSlug('Test@#$%Product')).toBe('testproduct');
      // Forward slash is removed (not replaced with hyphen)
      expect(generateSlug('Product/Category')).toBe('productcategory');
    });

    it('truncate should shorten long strings', () => {
      const longText = 'This is a very long string that should be truncated';
      const result = truncate(longText, 20);
      expect(result.length).toBeLessThanOrEqual(20);
      expect(result).toContain('...');
    });

    it('truncate should not truncate short strings', () => {
      const shortText = 'Short';
      const result = truncate(shortText, 20);
      expect(result).toBe(shortText);
    });

    it('escapeHtml should escape special characters', () => {
      const html = '<script>alert("XSS")</script>';
      const result = escapeHtml(html);
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
    });

    it('escapeHtml should escape quotes', () => {
      const text = 'He said "Hello"';
      const result = escapeHtml(text);
      expect(result).toContain('&quot;');
    });
  });

  describe('Array Utilities', () => {
    it('chunk should split array into chunks', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7];
      const result = chunk(arr, 3);
      expect(result.length).toBe(3);
      expect(result[0]).toEqual([1, 2, 3]);
      expect(result[1]).toEqual([4, 5, 6]);
      expect(result[2]).toEqual([7]);
    });

    it('uniqueBy should remove duplicates by key', () => {
      const arr = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 1, name: 'A-duplicate' },
        { id: 3, name: 'C' },
      ];
      const result = uniqueBy(arr, 'id');
      expect(result.length).toBe(3);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(3);
    });

    it('groupBy should group array by key', () => {
      const arr = [
        { type: 'A', value: 1 },
        { type: 'B', value: 2 },
        { type: 'A', value: 3 },
      ];
      const result = groupBy(arr, 'type');
      expect(result['A'].length).toBe(2);
      expect(result['B'].length).toBe(1);
    });
  });

  describe('Object Utilities', () => {
    it('pick should select only specified keys', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = pick(obj, ['a', 'c']);
      expect(Object.keys(result)).toEqual(['a', 'c']);
      expect(result.a).toBe(1);
      expect(result.c).toBe(3);
    });

    it('omit should exclude specified keys', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = omit(obj, ['b', 'd']);
      expect(Object.keys(result)).toEqual(['a', 'c']);
      expect(result.a).toBe(1);
      expect(result.c).toBe(3);
    });

    it('deepClone should create independent copy', () => {
      const obj = { nested: { value: 1 } };
      const clone = deepClone(obj);
      clone.nested.value = 999;
      expect(obj.nested.value).toBe(1); // Original unchanged
      expect(clone.nested.value).toBe(999);
    });
  });

  describe('Validation Utilities', () => {
    it('isEmpty should detect empty values', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
    });

    it('isEmpty should detect non-empty values', () => {
      expect(isEmpty('hello')).toBe(false);
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ a: 1 })).toBe(false);
    });

    it('isValidEmail should validate email format', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.id')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('noat.com')).toBe(false);
    });

    it('isValidUrl should validate URL format', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://test.org/path')).toBe(true);
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://files.com')).toBe(true);
    });
  });

  describe('Error Handling Utilities', () => {
    it('safeJsonParse should parse valid JSON', () => {
      const result = safeJsonParse('{"key": "value"}', {});
      expect(result).toEqual({ key: 'value' });
    });

    it('safeJsonParse should return fallback for invalid JSON', () => {
      const fallback = { default: true };
      const result = safeJsonParse('not json', fallback);
      expect(result).toEqual(fallback);
    });

    it('safeJsonParse should handle arrays', () => {
      const result = safeJsonParse('[1, 2, 3]', []);
      expect(result).toEqual([1, 2, 3]);
    });

    it('sleep should delay execution', async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(90);
    });
  });
});
