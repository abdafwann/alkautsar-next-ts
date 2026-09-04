import { describe, it, expect, vi, beforeEach } from 'vitest';

process.env.JWT_SECRET = 'test-jwt-secret-key-32-characters-long';
process.env.MASTER_SECURITY_CODE = 'SECRET_MASTER_123';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      create: vi.fn().mockResolvedValue({ id: 'cat-1', name: 'Madu Herbal' }),
      update: vi.fn().mockResolvedValue({ id: 'cat-1', name: 'Madu Alami' }),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    product: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn().mockResolvedValue({ id: 'prod-1', title: 'Madu Asli', price: 100000, quantity: 10 }),
      update: vi.fn().mockResolvedValue({ id: 'prod-1', title: 'Madu Asli', price: 100000, quantity: 10 }),
    },
    productImage: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    voucher: {
      findUnique: vi.fn(),
      create: vi.fn().mockResolvedValue({
        id: 'vouch-1',
        code: 'BERKAH_SEHAT-2027',
        type: 'PERCENTAGE',
        discountValue: 20,
        minOrderAmount: null,
        maxDiscount: null,
        expiryDate: new Date('2027-12-31'),
        usageLimit: null,
        usedCount: 0,
        isActive: true,
      }),
    },
    storeSettings: {
      findUnique: vi.fn(),
      upsert: vi.fn().mockResolvedValue({ id: 'default', storeName: 'Toko Al-Kautsar' }),
    },
    admin: {
      findUnique: vi.fn(),
      create: vi.fn().mockResolvedValue({ id: 'adm-1', name: 'Admin Utama', email: 'admin@alkautsar.com', role: 'ADMIN' }),
    },
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'valid-jwt-token' }),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

vi.mock('jose', () => ({
  jwtVerify: vi.fn().mockResolvedValue({ payload: { adminId: 'super-1' } }),
}));

vi.mock('@/lib/auth-guard', () => ({
  requireAdmin: vi.fn().mockResolvedValue({ adminId: 'admin-1', email: 'admin@test.com' }),
}));

vi.mock('@/app/actions/admin-logs', () => ({
  recordAdminLog: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/adminLog', () => ({
  logAdminActivity: vi.fn().mockResolvedValue(true),
}));

describe('Phase 2: Admin Management & Catalog Input Sanitization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TASK-06: saveProduct Validation & Sanitization', () => {
    it('should reject saveProduct if validation fails (e.g. invalid slug or negative price)', async () => {
      const { saveProduct } = await import('@/app/actions/catalog');

      const invalidData = {
        title: 'Madu Randu',
        slug: 'Madu Randu With Uppercase & Spaces', // Invalid slug
        uses: 'Khasiat untuk stamina tubuh',
        price: -50000, // Negative price
        categoryId: 'cat-1',
        productForm: 'Cair',
        directions: 'Minum 2x sehari',
        certificate: 'P-IRT 123456',
        quantity: 10,
      };

      const result = await saveProduct(null, invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Validasi gagal');
    });

    it('should sanitize title, directions, and certificate in saveProduct', async () => {
      const { saveProduct } = await import('@/app/actions/catalog');
      const { prisma } = await import('@/lib/prisma');

      (prisma.product.findFirst as any).mockResolvedValue(null);

      const validData = {
        title: '<script>alert(1)</script>Madu Randu Asli 500g',
        slug: 'madu-randu-asli-500g',
        uses: 'Membantu menjaga dan memelihara daya tahan tubuh secara alami.',
        price: 120000,
        categoryId: 'cat-1',
        productForm: 'Cair / Madu',
        directions: 'Diminum 2 sendok makan <img src=x onerror=alert(1)> setiap pagi',
        certificate: 'BPOM TR 123456781',
        quantity: 50,
      };

      const result = await saveProduct(null, validData);
      expect(result.success).toBe(true);

      expect(prisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'scriptalert(1)/scriptMadu Randu Asli 500g',
            directions: 'Diminum 2 sendok makan img src=x alert(1) setiap pagi',
          }),
        })
      );
    });
  });

  describe('TASK-07: createVoucher Validation & Sanitization', () => {
    it('should reject voucher with invalid code format (special characters or lowercase)', async () => {
      const { createVoucher } = await import('@/app/actions/admin-vouchers');

      const result = await createVoucher({
        code: 'diskon@10#',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        expiryDate: '2027-12-31',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Kode voucher hanya boleh berisi huruf besar, angka, tanda hubung (-), atau garis bawah (_)');
    });

    it('should reject percentage discount greater than 100%', async () => {
      const { createVoucher } = await import('@/app/actions/admin-vouchers');

      const result = await createVoucher({
        code: 'DISKON150',
        discountType: 'PERCENTAGE',
        discountValue: 150,
        expiryDate: '2027-12-31',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Persentase diskon tidak boleh melebihi 100%');
    });

    it('should sanitize and create valid voucher', async () => {
      const { createVoucher } = await import('@/app/actions/admin-vouchers');
      const { prisma } = await import('@/lib/prisma');

      (prisma.voucher.findUnique as any).mockResolvedValue(null);

      const result = await createVoucher({
        code: '  berkah_sehat-2027  ',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        expiryDate: '2027-12-31',
      });

      expect(result.success).toBe(true);
      expect(prisma.voucher.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            code: 'BERKAH_SEHAT-2027',
            discountValue: 20,
          }),
        })
      );
    });
  });

  describe('TASK-08: updateStoreSettings Sanitization & Validation', () => {
    it('should reject invalid store email format', async () => {
      const { updateStoreSettings } = await import('@/app/actions/settings');

      const result = await updateStoreSettings({
        storeName: 'Alkautsar Herbal',
        email: 'invalid-store-email',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Format email toko tidak valid');
    });

    it('should sanitize store name and address', async () => {
      const { updateStoreSettings } = await import('@/app/actions/settings');
      const { prisma } = await import('@/lib/prisma');

      const result = await updateStoreSettings({
        storeName: '<bold>PT. Al-Kautsar Herbal</bold>',
        address: 'Jl. Raya Tajur No. 88 <iframe src=evil.com></iframe>',
        email: 'billing@alkautsar.com',
      });

      expect(result.success).toBe(true);
      expect((prisma as any).storeSettings.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            storeName: 'boldPT. Al-Kautsar Herbal/bold',
            address: 'Jl. Raya Tajur No. 88 iframe src=evil.com/iframe',
          }),
        })
      );
    });
  });

  describe('TASK-09: createCategory & createAdmin Sanitization', () => {
    it('should sanitize category name', async () => {
      const { createCategory } = await import('@/app/actions/catalog');
      const { prisma } = await import('@/lib/prisma');

      const formData = new FormData();
      formData.append('name', '<h1>Herbal Alami</h1>');

      const result = await createCategory(formData);
      expect(result.success).toBe(true);

      expect(prisma.category.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { name: 'h1Herbal Alami/h1' },
        })
      );
    });

    it('should reject invalid admin email during createAdmin', async () => {
      const { createAdmin } = await import('@/app/actions/admin-management');
      const { prisma } = await import('@/lib/prisma');

      (prisma.admin.findUnique as any).mockResolvedValue({ id: 'super-1', role: 'SUPERADMIN' });

      const formData = new FormData();
      formData.append('name', 'Admin Baru');
      formData.append('email', 'not-valid-email');
      formData.append('password', 'ValidPass123!');
      formData.append('role', 'ADMIN');
      formData.append('master_key', 'SECRET_MASTER_123');

      const result = await createAdmin(formData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Format email admin tidak valid');
    });
  });
});
