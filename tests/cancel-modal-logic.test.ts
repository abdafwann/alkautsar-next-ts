import { describe, it, expect } from 'vitest';

/**
 * Pure logic tests for cancel modal — no mocks needed.
 * Tests constants, derived state, and status config directly.
 */

// ─── Constants (mirrored from OrdersListClient.tsx) ──────────
const CANCEL_REASONS = [
  'Ingin mengubah pesanan / alamat pengiriman',
  'Ingin mengubah metode pembayaran',
  'Menemukan harga lebih murah di tempat lain',
  'Tidak membutuhkan produk ini lagi',
  'Terdapat kesalahan pada pesanan',
] as const;

const REASON_OTHER_KEY = '__other__';

/**
 * Mirrors getStatusConfig from OrdersListClient.tsx.
 * Extracted for testability without importing React component.
 */
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'WAITING_FOR_PAYMENT':
      return { label: 'Belum Bayar', canCancel: true };
    case 'PAID':
      return { label: 'Dibayar', canCancel: false };
    case 'PROCESSING':
      return { label: 'Sedang Diproses', canCancel: false };
    case 'PREPARING':
      return { label: 'Sedang Dikemas', canCancel: false };
    case 'IN_DELIVERY':
      return { label: 'Dalam Pengiriman', canCancel: false };
    case 'DELIVERED':
      return { label: 'Terkirim', canCancel: false };
    case 'COMPLETED':
      return { label: 'Selesai', canCancel: false };
    case 'CANCELLED':
      return { label: 'Dibatalkan', canCancel: false };
    case 'RETURN_REQUESTED':
      return { label: 'Pengajuan Retur', canCancel: false };
    case 'RETURNED':
      return { label: 'Retur Selesai', canCancel: false };
    default:
      return { label: status, canCancel: false };
  }
};

/**
 * Mirrors isConfirmDisabled logic from OrdersListClient.tsx.
 */
const computeIsConfirmDisabled = (
  isCancelling: string | null,
  cancelModalOrderId: string | null,
  cancelReason: string,
  cancelReasonOther: string
): boolean => {
  return (
    isCancelling === cancelModalOrderId ||
    (cancelReason === REASON_OTHER_KEY && cancelReasonOther.trim().length === 0)
  );
};

// ─── Tests ───────────────────────────────────────────────────────
describe('Cancel Modal Pure Logic', () => {

  // ── CANCEL_REASONS Content Validation ─────────────────────
  describe('CANCEL_REASONS constants', () => {
    it('should have exactly 5 predefined reasons', () => {
      expect(CANCEL_REASONS).toHaveLength(5);
    });

    it('should NOT contain delivery-related reasons (user cancels pre-shipment)', () => {
      const deliveryKeywords = ['pengiriman terlalu lama', 'belum sampai', 'terlambat', 'lama dikirim'];
      for (const reason of CANCEL_REASONS) {
        for (const keyword of deliveryKeywords) {
          expect(reason.toLowerCase()).not.toContain(keyword);
        }
      }
    });

    it('should contain contextually valid pre-shipment reasons', () => {
      const expectedTopics = ['alamat', 'pembayaran', 'harga', 'tidak membutuhkan', 'kesalahan'];
      for (const topic of expectedTopics) {
        const found = CANCEL_REASONS.some(r => r.toLowerCase().includes(topic));
        expect(found).toBe(true);
      }
    });

    it('REASON_OTHER_KEY should be a non-displayable sentinel value', () => {
      expect(REASON_OTHER_KEY).toBe('__other__');
      // Should not match any predefined reason
      expect(CANCEL_REASONS).not.toContain(REASON_OTHER_KEY);
    });
  });

  // ── getStatusConfig canCancel Boundary ─────────────────────
  describe('getStatusConfig — canCancel boundary', () => {
    const cancellableStatuses = ['WAITING_FOR_PAYMENT'];
    const nonCancellableStatuses = ['PAID', 'PROCESSING', 'PREPARING', 'IN_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED'];

    it.each(cancellableStatuses)(
      'canCancel should be TRUE for unpaid pre-shipment status: %s',
      (status) => {
        expect(getStatusConfig(status).canCancel).toBe(true);
      }
    );

    it.each(nonCancellableStatuses)(
      'canCancel should be FALSE for paid/in-progress/terminal status: %s',
      (status) => {
        expect(getStatusConfig(status).canCancel).toBe(false);
      }
    );

    it('should return canCancel=false for unknown statuses', () => {
      expect(getStatusConfig('SOME_RANDOM_STATUS').canCancel).toBe(false);
    });

    it('should return the status string itself as label for unknown statuses', () => {
      expect(getStatusConfig('MYSTERY').label).toBe('MYSTERY');
    });
  });

  // ── isConfirmDisabled Derived State ─────────────────────────
  describe('isConfirmDisabled derived state', () => {
    it('should be disabled while cancelling is in progress', () => {
      const result = computeIsConfirmDisabled('order-1', 'order-1', CANCEL_REASONS[0], '');
      expect(result).toBe(true);
    });

    it('should NOT be disabled when cancelling a different order', () => {
      const result = computeIsConfirmDisabled('order-other', 'order-1', CANCEL_REASONS[0], '');
      expect(result).toBe(false);
    });

    it('should NOT be disabled when not cancelling at all', () => {
      const result = computeIsConfirmDisabled(null, 'order-1', CANCEL_REASONS[0], '');
      expect(result).toBe(false);
    });

    it('should be disabled when "Lainnya" is selected with empty text', () => {
      const result = computeIsConfirmDisabled(null, 'order-1', REASON_OTHER_KEY, '');
      expect(result).toBe(true);
    });

    it('should be disabled when "Lainnya" is selected with whitespace-only text', () => {
      const result = computeIsConfirmDisabled(null, 'order-1', REASON_OTHER_KEY, '   ');
      expect(result).toBe(true);
    });

    it('should NOT be disabled when "Lainnya" has actual text', () => {
      const result = computeIsConfirmDisabled(null, 'order-1', REASON_OTHER_KEY, 'Alasan custom saya');
      expect(result).toBe(false);
    });

    it('should NOT be disabled when a predefined reason is selected', () => {
      for (const reason of CANCEL_REASONS) {
        const result = computeIsConfirmDisabled(null, 'order-1', reason, '');
        expect(result).toBe(false);
      }
    });
  });
});
