import { describe, it, expect } from 'vitest';
import { getPromoStatus, formatPromoExpiryTag } from '@/app/admin/(dashboard)/products/ProductList';

describe('Admin Product Table Logic & Helper Functions', () => {
  it('correctly calculates promo status for non-promo products', () => {
    const product = { isPromo: false, promoPrice: null, promoExpiry: null };
    const status = getPromoStatus(product);
    expect(status.isActive).toBe(false);
    expect(status.isExpired).toBe(false);
    expect(status.hasPromo).toBe(false);
    expect(status.expiryDate).toBeNull();
  });

  it('correctly calculates active promo status with future expiry date', () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString();
    const product = { isPromo: true, promoPrice: 75000, promoExpiry: futureDate };
    const status = getPromoStatus(product);
    expect(status.isActive).toBe(true);
    expect(status.isExpired).toBe(false);
    expect(status.hasPromo).toBe(true);
    expect(status.expiryDate).toBeInstanceOf(Date);
  });

  it('correctly detects expired promo when expiry date has passed', () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString();
    const product = { isPromo: true, promoPrice: 75000, promoExpiry: pastDate };
    const status = getPromoStatus(product);
    expect(status.isActive).toBe(false);
    expect(status.isExpired).toBe(true);
    expect(status.hasPromo).toBe(true);
  });

  it('formats promo expiry tag correctly for urgent countdown (< 3 days)', () => {
    const twoDaysAhead = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2);
    const tag = formatPromoExpiryTag(twoDaysAhead);
    expect(tag.isUrgent).toBe(true);
    expect(tag.text).toContain('Sisa');
  });

  it('formats promo expiry tag correctly for non-urgent countdown (> 3 days)', () => {
    const tenDaysAhead = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10);
    const tag = formatPromoExpiryTag(tenDaysAhead);
    expect(tag.isUrgent).toBe(false);
    expect(tag.text).toContain('s.d.');
  });
});
