import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks ───────────────────────────────────────────────────────
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
  runWithRlsContext: vi.fn((_ctx, fn) => fn()),
}));

vi.mock('@/lib/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/validation', () => ({
  sanitizeString: vi.fn((s: string) => s.replace(/<[^>]*>/g, '')),
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn().mockResolvedValue('$2a$12$hashed_password'),
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────
const MOCK_USER_ID = 'user-abc';

const createFormData = (data: Record<string, string>): FormData => {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    fd.set(key, value);
  }
  return fd;
};

const MOCK_USER = {
  id: MOCK_USER_ID,
  name: 'Ahmad Tester',
  email: 'ahmad@test.com',
  mobile: '08123456789',
  address: 'Jl. Testing No. 1',
  province: 'Jawa Barat',
  city: 'Bandung',
  postalCode: '40115',
  password: '$2a$12$existing_hashed_password',
};

// ─── Tests ───────────────────────────────────────────────────────
describe('Account Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── getProfile ──────────────────────────────────────────────
  describe('getProfile', () => {
    it('should return error if user is not logged in', async () => {
      const { getSession } = await import('@/lib/session');
      const { getProfile } = await import('@/app/actions/account');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await getProfile();
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/unauthorized/i);
    });

    it('should return user profile data on success', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { getProfile } = await import('@/app/actions/account');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        name: MOCK_USER.name,
        email: MOCK_USER.email,
        mobile: MOCK_USER.mobile,
        address: MOCK_USER.address,
        province: MOCK_USER.province,
        city: MOCK_USER.city,
        postalCode: MOCK_USER.postalCode,
      });

      const result = await getProfile();
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Ahmad Tester');
      expect(result.data?.email).toBe('ahmad@test.com');
    });

    it('should return error if user not found in database', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { getProfile } = await import('@/app/actions/account');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await getProfile();
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/tidak ditemukan/i);
    });
  });

  // ── updateProfile ───────────────────────────────────────────
  describe('updateProfile', () => {
    it('should reject if user is not logged in', async () => {
      const { getSession } = await import('@/lib/session');
      const { updateProfile } = await import('@/app/actions/account');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await updateProfile(createFormData({ name: 'Test' }));
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/unauthorized/i);
    });

    it('should reject if name is empty after sanitization', async () => {
      const { getSession } = await import('@/lib/session');
      const { updateProfile } = await import('@/app/actions/account');
      const { sanitizeString } = await import('@/lib/validation');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });
      // Simulate sanitization removing all content (e.g., XSS-only input)
      (sanitizeString as ReturnType<typeof vi.fn>).mockReturnValue('');

      const result = await updateProfile(createFormData({ name: '<script>alert("xss")</script>' }));
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/nama wajib diisi/i);
    });

    it('should update profile successfully with valid data', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { updateProfile } = await import('@/app/actions/account');
      const { sanitizeString } = await import('@/lib/validation');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });
      (sanitizeString as ReturnType<typeof vi.fn>).mockImplementation((s: string) => s);
      (prisma.user.update as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const result = await updateProfile(createFormData({
        name: 'Ahmad Updated',
        mobile: '08199887766',
        address: 'Jl. Baru No. 2',
        province: 'DKI Jakarta',
        city: 'Jakarta Selatan',
        postalCode: '12345',
      }));

      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: MOCK_USER_ID },
          data: expect.objectContaining({
            name: 'Ahmad Updated',
            mobile: '08199887766',
          }),
        })
      );
    });

    it('should handle null optional fields gracefully', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { updateProfile } = await import('@/app/actions/account');
      const { sanitizeString } = await import('@/lib/validation');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });
      (sanitizeString as ReturnType<typeof vi.fn>).mockImplementation((s: string) => s);
      (prisma.user.update as ReturnType<typeof vi.fn>).mockResolvedValue({});

      // Only name provided, optional fields will be falsy from FormData
      const fd = new FormData();
      fd.set('name', 'Nama Saja');

      const result = await updateProfile(fd);
      expect(result.success).toBe(true);
    });
  });

  // ── changePassword ──────────────────────────────────────────
  describe('changePassword', () => {
    it('should reject if user is not logged in', async () => {
      const { getSession } = await import('@/lib/session');
      const { changePassword } = await import('@/app/actions/account');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await changePassword(createFormData({
        oldPassword: 'old',
        newPassword: 'New12345',
        confirmPassword: 'New12345',
      }));
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/unauthorized/i);
    });

    it('should reject if any password field is missing', async () => {
      const { getSession } = await import('@/lib/session');
      const { changePassword } = await import('@/app/actions/account');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });

      const result = await changePassword(createFormData({
        oldPassword: 'old123',
        newPassword: '',
        confirmPassword: '',
      }));
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/wajib diisi/i);
    });

    it('should reject if new password and confirm do not match', async () => {
      const { getSession } = await import('@/lib/session');
      const { changePassword } = await import('@/app/actions/account');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });

      const result = await changePassword(createFormData({
        oldPassword: 'OldPass1',
        newPassword: 'NewPass1',
        confirmPassword: 'DifferentPass1',
      }));
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/tidak cocok/i);
    });

    it('should reject password shorter than 8 characters', async () => {
      const { getSession } = await import('@/lib/session');
      const { changePassword } = await import('@/app/actions/account');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });

      const result = await changePassword(createFormData({
        oldPassword: 'OldPass1',
        newPassword: 'Ab1',
        confirmPassword: 'Ab1',
      }));
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/8 karakter/i);
    });

    it('should reject password without uppercase letter', async () => {
      const { getSession } = await import('@/lib/session');
      const { changePassword } = await import('@/app/actions/account');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });

      const result = await changePassword(createFormData({
        oldPassword: 'OldPass1',
        newPassword: 'nouppercase1',
        confirmPassword: 'nouppercase1',
      }));
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/huruf kapital/i);
    });

    it('should reject password without a digit', async () => {
      const { getSession } = await import('@/lib/session');
      const { changePassword } = await import('@/app/actions/account');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });

      const result = await changePassword(createFormData({
        oldPassword: 'OldPass1',
        newPassword: 'NoDigitHere',
        confirmPassword: 'NoDigitHere',
      }));
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/angka/i);
    });

    it('should reject if old password is incorrect', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { changePassword } = await import('@/app/actions/account');
      const bcrypt = await import('bcryptjs');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
      (bcrypt.default.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);

      const result = await changePassword(createFormData({
        oldPassword: 'WrongOldPass1',
        newPassword: 'NewSecure1',
        confirmPassword: 'NewSecure1',
      }));
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/sandi lama salah/i);
    });

    it('should change password successfully with all valid inputs', async () => {
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');
      const { changePassword } = await import('@/app/actions/account');
      const bcrypt = await import('bcryptjs');

      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ userId: MOCK_USER_ID });
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_USER);
      (bcrypt.default.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);
      (prisma.user.update as ReturnType<typeof vi.fn>).mockResolvedValue({});

      const result = await changePassword(createFormData({
        oldPassword: 'CorrectOld1',
        newPassword: 'NewSecure1',
        confirmPassword: 'NewSecure1',
      }));

      expect(result.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: MOCK_USER_ID },
          data: expect.objectContaining({
            password: '$2a$12$hashed_password',
          }),
        })
      );
    });
  });
});
