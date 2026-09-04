/**
 * Tests for lib/constants.ts
 * Verifies that all constants are correctly defined
 */

import { describe, it, expect } from 'vitest';
import {
  AdminRoles,
  VALID_ADMIN_ROLES,
  OrderStatuses,
  SUCCESS_ORDER_STATUSES,
  TERMINAL_ORDER_STATUSES,
  PAGINATION,
  CACHE,
  VoucherTypes,
  VOUCHER_LIMITS,
  InquiryStatuses,
  UserRoles,
  API_PATHS,
  SESSION,
} from '../lib/constants';

describe('Constants', () => {
  describe('AdminRoles', () => {
    it('should have correct admin role values', () => {
      expect(AdminRoles.SUPER_ADMIN).toBe('SUPER_ADMIN');
      expect(AdminRoles.SUPERADMIN).toBe('SUPERADMIN');
      expect(AdminRoles.ADMIN).toBe('ADMIN');
    });

    it('should have all valid admin roles in VALID_ADMIN_ROLES', () => {
      expect(VALID_ADMIN_ROLES).toContain('SUPER_ADMIN');
      expect(VALID_ADMIN_ROLES).toContain('SUPERADMIN');
      expect(VALID_ADMIN_ROLES).toContain('ADMIN');
      expect(VALID_ADMIN_ROLES).toContain('admin'); // legacy lowercase
    });
  });

  describe('OrderStatuses', () => {
    it('should have all order statuses matching schema.prisma', () => {
      expect(OrderStatuses.WAITING_FOR_PAYMENT).toBe('WAITING_FOR_PAYMENT');
      expect(OrderStatuses.PROCESSING).toBe('PROCESSING');
      expect(OrderStatuses.PREPARING).toBe('PREPARING');
      expect(OrderStatuses.IN_DELIVERY).toBe('IN_DELIVERY');
      expect(OrderStatuses.DELIVERED).toBe('DELIVERED');
      expect(OrderStatuses.COMPLETED).toBe('COMPLETED');
      expect(OrderStatuses.CANCELLED).toBe('CANCELLED');
      expect(OrderStatuses.RETURN_REQUESTED).toBe('RETURN_REQUESTED');
      expect(OrderStatuses.RETURNED).toBe('RETURNED');
    });

    it('should have correct success order statuses', () => {
      expect(SUCCESS_ORDER_STATUSES).toContain('PROCESSING');
      expect(SUCCESS_ORDER_STATUSES).toContain('PREPARING');
      expect(SUCCESS_ORDER_STATUSES).toContain('IN_DELIVERY');
      expect(SUCCESS_ORDER_STATUSES).toContain('DELIVERED');
      expect(SUCCESS_ORDER_STATUSES).toContain('COMPLETED');
      expect(SUCCESS_ORDER_STATUSES).not.toContain('CANCELLED');
      expect(SUCCESS_ORDER_STATUSES).not.toContain('RETURNED');
    });

    it('should have correct terminal order statuses', () => {
      expect(TERMINAL_ORDER_STATUSES).toContain('COMPLETED');
      expect(TERMINAL_ORDER_STATUSES).toContain('CANCELLED');
      expect(TERMINAL_ORDER_STATUSES).toContain('RETURNED');
      expect(TERMINAL_ORDER_STATUSES.length).toBe(3);
    });
  });

  describe('Pagination', () => {
    it('should have correct pagination defaults', () => {
      expect(PAGINATION.DEFAULT_PAGE).toBe(1);
      expect(PAGINATION.DEFAULT_LIMIT).toBe(10);
      expect(PAGINATION.MAX_LIMIT).toBe(100);
    });

    it('should have sensible pagination values', () => {
      expect(PAGINATION.DEFAULT_PAGE).toBeGreaterThan(0);
      expect(PAGINATION.DEFAULT_LIMIT).toBeGreaterThan(0);
      expect(PAGINATION.MAX_LIMIT).toBeGreaterThan(PAGINATION.DEFAULT_LIMIT);
    });
  });

  describe('Cache', () => {
    it('should have cache values in seconds', () => {
      expect(CACHE.PRODUCTS).toBe(60); // 1 minute
      expect(CACHE.CATEGORIES).toBe(300); // 5 minutes
      expect(CACHE.BANNERS).toBe(300); // 5 minutes
      expect(CACHE.SETTINGS).toBe(600); // 10 minutes
    });

    it('should have sensible cache durations', () => {
      // Products should cache less than categories (more volatile)
      expect(CACHE.PRODUCTS).toBeLessThan(CACHE.CATEGORIES);
    });
  });

  describe('VoucherTypes', () => {
    it('should have correct voucher types', () => {
      expect(VoucherTypes.PERCENTAGE).toBe('PERCENTAGE');
      expect(VoucherTypes.FIXED_AMOUNT).toBe('FIXED_AMOUNT');
    });
  });

  describe('VoucherLimits', () => {
    it('should have correct voucher limits', () => {
      expect(VOUCHER_LIMITS.CODE_MIN).toBe(3);
      expect(VOUCHER_LIMITS.CODE_MAX).toBe(50);
      expect(VOUCHER_LIMITS.MIN_PERCENTAGE).toBe(1);
      expect(VOUCHER_LIMITS.MAX_PERCENTAGE).toBe(100);
    });

    it('should have valid percentage range', () => {
      expect(VOUCHER_LIMITS.MIN_PERCENTAGE).toBeGreaterThan(0);
      expect(VOUCHER_LIMITS.MAX_PERCENTAGE).toBeLessThanOrEqual(100);
      expect(VOUCHER_LIMITS.MIN_PERCENTAGE).toBeLessThan(VOUCHER_LIMITS.MAX_PERCENTAGE);
    });
  });

  describe('InquiryStatuses', () => {
    it('should have correct inquiry statuses', () => {
      expect(InquiryStatuses.NEW).toBe('NEW');
      expect(InquiryStatuses.READ).toBe('READ');
      expect(InquiryStatuses.REPLIED).toBe('REPLIED');
      expect(InquiryStatuses.CLOSED).toBe('CLOSED');
    });
  });

  describe('UserRoles', () => {
    it('should have correct user roles', () => {
      expect(UserRoles.USER).toBe('USER');
      expect(UserRoles.GUEST).toBe('GUEST');
    });
  });

  describe('APIPaths', () => {
    it('should have correct API paths', () => {
      expect(API_PATHS.ADMIN_PREFIX).toBe('/api/admin');
      expect(API_PATHS.STORE_PREFIX).toBe('/api/store');
      expect(API_PATHS.WEBHOOK_PREFIX).toBe('/api/webhook');
    });
  });

  describe('Session', () => {
    it('should have correct session settings', () => {
      expect(SESSION.USER_COOKIE).toBe('session');
      expect(SESSION.ADMIN_COOKIE).toBe('admin_session');
      expect(SESSION.EXPIRY_DAYS).toBe(7);
    });

    it('should have reasonable session expiry', () => {
      expect(SESSION.EXPIRY_DAYS).toBeGreaterThan(0);
      expect(SESSION.EXPIRY_DAYS).toBeLessThanOrEqual(30); // Max 30 days
    });
  });
});
