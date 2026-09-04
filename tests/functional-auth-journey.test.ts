import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerUser, loginUser, logoutUser, getAuthSession } from '@/app/actions/userAuth';
import { loginAdmin, logoutAdmin } from '@/app/actions/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession, deleteSession, getSession } from '@/lib/session';
import { checkRateLimit } from '@/lib/rateLimitWrapper';
import { cookies, headers } from 'next/headers';

// Hoisted mock store
const { mockCookieStore, mockHeaderStore } = vi.hoisted(() => ({
  mockCookieStore: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
  mockHeaderStore: {
    get: vi.fn(),
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore),
  headers: vi.fn().mockResolvedValue(mockHeaderStore),
}));

vi.mock('@/lib/session', () => ({
  createSession: vi.fn(),
  deleteSession: vi.fn(),
  getSession: vi.fn(),
  encodedKey: new TextEncoder().encode('test-secret-key-for-jwt-signing-minimum-32-chars-long!'),
}));

vi.mock('@/lib/rateLimitWrapper', () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$2a$12$hashedPasswordExample'),
    compare: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    admin: {
      findUnique: vi.fn(),
    },
  },
}));

describe('Phase 3 Functional: Authentication Journey (A1–A8)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaderStore.get.mockReturnValue('127.0.0.1');
    vi.mocked(checkRateLimit).mockResolvedValue({ isAllowed: true } as any);
  });

  describe('A1 & A2: User Registration', () => {
    it('A1: registers a new user with sanitized data and hashed password', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'usr-new-1',
        name: 'Fulan bin Fulan',
        email: 'fulan@example.com',
        createdAt: new Date(),
      } as any);

      const formData = new FormData();
      formData.append('name', 'Fulan bin Fulan');
      formData.append('email', 'FULAN@EXAMPLE.COM  ');
      formData.append('password', 'SecretPass123!');

      const res = await registerUser(formData);

      expect(res.success).toBe(true);
      expect(res.data?.email).toBe('fulan@example.com');
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Fulan bin Fulan',
            email: 'fulan@example.com',
            password: '$2a$12$hashedPasswordExample',
          }),
        })
      );
    });

    it('A2: rejects registration if email already exists', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'usr-existing-1',
        email: 'fulan@example.com',
      } as any);

      const formData = new FormData();
      formData.append('name', 'Fulan');
      formData.append('email', 'fulan@example.com');
      formData.append('password', 'Password123');

      const res = await registerUser(formData);

      expect(res.success).toBe(false);
      expect(res.error).toBe('Email sudah terdaftar');
      expect(res.reason).toBe('EXISTS');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('validates password minimum length (>= 6 chars)', async () => {
      const formData = new FormData();
      formData.append('name', 'Short Pass User');
      formData.append('email', 'short@example.com');
      formData.append('password', '12345');

      const res = await registerUser(formData);

      expect(res.success).toBe(false);
      expect(res.error).toBe('Kata sandi minimal 6 karakter');
    });
  });

  describe('A3 & A4: User Login & Session Management', () => {
    it('A3: logs in successfully with valid credentials and creates user session', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'usr-login-1',
        name: 'Ahmad Dahlan',
        email: 'ahmad@example.com',
        password: '$2a$12$validPasswordHash',
        isBlocked: false,
        avatar: null,
      } as any);

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const formData = new FormData();
      formData.append('email', 'ahmad@example.com');
      formData.append('password', 'ValidPassword123');

      const res = await loginUser(formData);

      expect(res.success).toBe(true);
      expect(res.data?.id).toBe('usr-login-1');
      expect(createSession).toHaveBeenCalledWith('usr-login-1', 'Ahmad Dahlan', 'ahmad@example.com');
    });

    it('A4: rejects login with incorrect password', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'usr-login-1',
        email: 'ahmad@example.com',
        password: '$2a$12$validPasswordHash',
        isBlocked: false,
      } as any);

      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const formData = new FormData();
      formData.append('email', 'ahmad@example.com');
      formData.append('password', 'WrongPassword!');

      const res = await loginUser(formData);

      expect(res.success).toBe(false);
      expect(res.error).toBe('Email atau kata sandi salah');
      expect(createSession).not.toHaveBeenCalled();
    });

    it('rejects login when account is blocked', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'usr-blocked-1',
        email: 'blocked@example.com',
        password: '$2a$12$validPasswordHash',
        isBlocked: true,
      } as any);

      const formData = new FormData();
      formData.append('email', 'blocked@example.com');
      formData.append('password', 'Password123');

      const res = await loginUser(formData);

      expect(res.success).toBe(false);
      expect(res.error).toContain('Akun Anda telah diblokir');
      expect(createSession).not.toHaveBeenCalled();
    });

    it('A8: logs out user and deletes session', async () => {
      const res = await logoutUser();

      expect(res.success).toBe(true);
      expect(deleteSession).toHaveBeenCalledTimes(1);
    });

    it('retrieves active session details', async () => {
      vi.mocked(getSession).mockResolvedValue({
        userId: 'session-usr-1',
        name: 'Active User',
        email: 'active@example.com',
      } as any);

      const session = await getAuthSession();

      expect(session).toEqual({
        id: 'session-usr-1',
        name: 'Active User',
        email: 'active@example.com',
      });
    });
  });

  describe('A5 & A6: Admin Authentication & Brute-Force Protection', () => {
    it('logs in admin successfully and sets admin_session cookie', async () => {
      vi.mocked(prisma.admin.findUnique).mockResolvedValue({
        id: 'admin-1',
        email: 'admin@alkautsar.com',
        password: '$2a$12$hashedAdminPass',
        role: 'SUPER_ADMIN',
      } as any);

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const formData = new FormData();
      formData.append('email', 'admin@alkautsar.com');
      formData.append('password', 'SuperSecretAdmin123');

      const res = await loginAdmin(null, formData);

      expect(res.success).toBe(true);
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'admin_session',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        })
      );
    });

    it('blocks admin login when rate limit is exceeded (brute-force defense)', async () => {
      vi.mocked(checkRateLimit).mockResolvedValue({ isAllowed: false } as any);

      const formData = new FormData();
      formData.append('email', 'admin@alkautsar.com');
      formData.append('password', 'RandomGuess');

      const res = await loginAdmin(null, formData);

      expect(res.success).toBe(false);
      expect(res.error).toContain('Terlalu banyak percobaan login gagal');
      expect(prisma.admin.findUnique).not.toHaveBeenCalled();
    });

    it('logs out admin and deletes admin_session cookie', async () => {
      await logoutAdmin();

      expect(mockCookieStore.delete).toHaveBeenCalledWith('admin_session');
    });
  });
});
