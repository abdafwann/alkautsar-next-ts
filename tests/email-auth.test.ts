import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/session', () => ({
  getSession: vi.fn(),
  createSession: vi.fn(),
}));

vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Email Auth Actions (emailAuth.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requestEmailChange', () => {
    it('should reject unauthenticated requests', async () => {
      const { getSession } = await import('@/lib/session');
      const { requestEmailChange } = await import('@/app/actions/emailAuth');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await requestEmailChange('new@example.com');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });

    it('should reject invalid email format', async () => {
      const { getSession } = await import('@/lib/session');
      const { requestEmailChange } = await import('@/app/actions/emailAuth');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user-1' });

      const result = await requestEmailChange('invalid-email-format');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Format alamat email tidak valid');
    });
  });

  describe('verifyEmailChange', () => {
    it('should track failed attempts and invalidate OTP after max attempts', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { verifyEmailChange } = await import('@/app/actions/emailAuth');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: 'user-lockout' });

      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'user-lockout',
        pendingEmail: 'target@example.com',
        emailOtp: '123456',
        emailOtpExpires: new Date(Date.now() + 5 * 60 * 1000),
      });
      (prisma.user.update as ReturnType<typeof vi.fn>).mockResolvedValue({});

      // Try 4 incorrect attempts
      for (let i = 1; i <= 4; i++) {
        const res = await verifyEmailChange('000000');
        expect(res.success).toBe(false);
        expect(res.error).toContain('Kode OTP salah');
      }

      // 5th incorrect attempt -> triggers lockout and OTP cancellation
      const finalRes = await verifyEmailChange('000000');
      expect(finalRes.success).toBe(false);
      expect(finalRes.error).toContain('Batas maksimal percobaan tercapai');

      // Verify Prisma cleared the OTP
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-lockout' },
          data: expect.objectContaining({
            emailOtp: null,
            pendingEmail: null,
            emailOtpExpires: null,
          })
        })
      );
    });
  });
});
