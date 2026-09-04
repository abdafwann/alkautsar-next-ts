import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    order: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    product: {
      update: vi.fn(),
      findMany: vi.fn(),
    },
    voucher: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((callback) => {
      if (typeof callback === 'function') {
        return callback({
          $queryRaw: vi.fn().mockResolvedValue([
            { id: 'prod-1', title: 'Madu Herbal', price: 100000, quantity: 10, isPromo: false }
          ]),
          order: { update: vi.fn(), create: vi.fn().mockResolvedValue({ id: 'ord-1' }) },
          product: { update: vi.fn() },
          voucher: { update: vi.fn() }
        });
      }
      return Promise.resolve(callback);
    })
  },
  runWithRlsContext: vi.fn((ctx, fn) => fn()),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  }),
  headers: vi.fn().mockResolvedValue(new Map()),
}));

vi.mock('@/lib/session', () => ({
  getSession: vi.fn(),
  createSession: vi.fn(),
  deleteSession: vi.fn(),
}));

vi.mock('@/lib/ratelimit', () => ({
  checkoutLimiter: {
    limit: vi.fn().mockResolvedValue({ success: true }),
  },
}));

vi.mock('midtrans-client', () => {
  return {
    default: {
      Snap: function () {
        return {
          createTransaction: vi.fn().mockResolvedValue({ token: 'snap-token-123' }),
        };
      },
      CoreApi: function () {
        return {
          transaction: {
            status: vi.fn().mockResolvedValue({ transaction_status: 'settlement' }),
          },
        };
      },
    },
  };
});

describe('Phase 1: Client Input Sanitization & Server Validations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TASK-03: updateProfile Sanitization', () => {
    it('should strip harmful HTML/script tags from profile inputs', async () => {
      const { updateProfile } = await import('@/app/actions/account');
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');

      (getSession as any).mockResolvedValue({ userId: 'usr-123' });
      (prisma.user.update as any).mockResolvedValue({});

      const formData = new FormData();
      formData.append('name', '<script>alert("hacked")</script>John Doe');
      formData.append('mobile', '+62 812-3456-7890 <svg onload=alert(1)>');
      formData.append('address', 'Jl. Merdeka No. 10 <iframe src="evil.com"></iframe>');
      formData.append('province', '<b>Jawa Barat</b>');
      formData.append('city', 'Kota Bogor');
      formData.append('postalCode', '16123');

      const result = await updateProfile(formData);
      expect(result.success).toBe(true);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'usr-123' },
          data: expect.objectContaining({
            name: 'scriptalert("hacked")/scriptJohn Doe',
            mobile: '+62 812-3456-7890 svg alert(1)',
            address: 'Jl. Merdeka No. 10 iframe src="evil.com"/iframe',
            province: 'bJawa Barat/b',
            city: 'Kota Bogor',
            postalCode: '16123',
          }),
        })
      );
    });

    it('should reject profile update if sanitized name becomes empty', async () => {
      const { updateProfile } = await import('@/app/actions/account');
      const { getSession } = await import('@/lib/session');

      (getSession as any).mockResolvedValue({ userId: 'usr-123' });

      const formData = new FormData();
      formData.append('name', '   ');

      const result = await updateProfile(formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Nama wajib diisi');
    });
  });

  describe('TASK-04: registerUser Validation & Sanitization', () => {
    it('should reject invalid email format during registration', async () => {
      const { registerUser } = await import('@/app/actions/userAuth');

      const formData = new FormData();
      formData.append('name', 'Budi Santoso');
      formData.append('email', 'not-an-email');
      formData.append('password', 'password123');

      const result = await registerUser(formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Format alamat email tidak valid');
    });

    it('should reject passwords shorter than 6 characters', async () => {
      const { registerUser } = await import('@/app/actions/userAuth');

      const formData = new FormData();
      formData.append('name', 'Budi Santoso');
      formData.append('email', 'budi@example.com');
      formData.append('password', '12345');

      const result = await registerUser(formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Kata sandi minimal 6 karakter');
    });

    it('should sanitize name before creating user', async () => {
      const { registerUser } = await import('@/app/actions/userAuth');
      const { prisma } = await import('@/lib/prisma');

      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue({ id: 'new-user-1', name: 'Budi Santoso', email: 'budi@example.com' });

      const formData = new FormData();
      formData.append('name', '<img src=x onerror=alert(1)>Budi Santoso');
      formData.append('email', 'budi@example.com');
      formData.append('password', 'securePassword123');

      const result = await registerUser(formData);
      expect(result.success).toBe(true);

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'img src=x alert(1)Budi Santoso',
            email: 'budi@example.com',
          }),
        })
      );
    });
  });

  describe('TASK-05: cancelOrder Sanitization', () => {
    it('should sanitize cancellation reason before storing to database', async () => {
      const { cancelOrder } = await import('@/app/actions/order');
      const { getSession } = await import('@/lib/session');
      const { prisma } = await import('@/lib/prisma');

      (getSession as any).mockResolvedValue({ userId: 'usr-123' });
      (prisma.order.findUnique as any).mockResolvedValue({
        id: 'ord-123',
        userId: 'usr-123',
        orderStatus: 'WAITING_FOR_PAYMENT',
        paymentStatus: 'UNPAID',
        orderItems: [{ productId: 'prod-1', count: 1 }],
        voucherCode: null,
      });

      const maliciousReason = 'Berubah pikiran <script>document.cookie="stolen"</script>';
      const result = await cancelOrder('ord-123', maliciousReason);

      expect(result.success).toBe(true);
    });
  });

  describe('TASK-01 & TASK-02: POST /api/checkout Validation', () => {
    it('should reject checkout request with invalid email format', async () => {
      const { POST } = await import('@/app/api/checkout/route');

      const req = new Request('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ id: 'prod-1', quantity: 1 }],
          name: 'Ahmad Fauzi',
          email: 'invalid-email-address',
          phone: '081234567890',
          address: 'Jl. Ahmad Yani No. 5',
        }),
      });

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('Format alamat email tidak valid');
    });

    it('should reject checkout request with invalid/negative item quantity', async () => {
      const { POST } = await import('@/app/api/checkout/route');

      const req = new Request('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ id: 'prod-1', quantity: -5 }],
          name: 'Ahmad Fauzi',
          email: 'ahmad@example.com',
          phone: '081234567890',
          address: 'Jl. Ahmad Yani No. 5',
        }),
      });

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('Kuantitas produk dalam keranjang tidak valid');
    });
  });
});
