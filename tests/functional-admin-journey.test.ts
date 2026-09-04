import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveProduct, updateStock, deleteProduct } from '@/app/actions/catalog';
import { updateOrderStatus, updateOrderResi } from '@/app/actions/admin-orders';
import { createVoucher, toggleVoucherStatus, deleteVoucher } from '@/app/actions/admin-vouchers';
import { getAdminCustomers, toggleCustomerBlockStatus } from '@/app/actions/admin-customers';
import { getArticles, getArticleBySlug } from '@/app/actions/articles';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';

vi.mock('@/lib/auth-guard', () => ({
  requireAdmin: vi.fn(),
  withAdminAuth: vi.fn((fn) => (...args: any[]) => fn({ adminId: 'admin-test-1', email: 'admin@alkautsar.com', role: 'SUPER_ADMIN' }, ...args)),
}));

vi.mock('@/lib/adminLog', () => ({
  logAdminActivity: vi.fn(),
}));

vi.mock('@/app/actions/admin-logs', () => ({
  recordAdminLog: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    order: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    voucher: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    article: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Phase 3 Functional: Admin Panel Journey (D1–D10)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue({
      adminId: 'admin-super-1',
      email: 'admin@alkautsar.com',
      role: 'SUPER_ADMIN',
    } as any);
  });

  describe('D2, D3, D4: Product Management CRUD', () => {
    it('D2: creates a new product with complete validated fields', async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.product.create).mockResolvedValue({
        id: 'new-prod-id',
        title: 'Madu Randu Asli',
        slug: 'madu-randu-asli',
        price: 125000 as any,
        quantity: 50,
      } as any);

      const productData = {
        title: 'Madu Randu Asli',
        slug: 'madu-randu-asli',
        uses: 'Meningkatkan imunitas tubuh',
        price: 125000,
        categoryId: 'cat-madu',
        productForm: 'Liquid',
        composition: '100% Madu Randu',
        directions: 'Minum 2 sendok makan sehari',
        certificate: 'P-IRT No. 123456789',
        quantity: 50,
        isPromo: false,
      };

      const res = await saveProduct(null, productData);

      expect(res.success).toBe(true);
      expect(res.data?.title).toBe('Madu Randu Asli');
      expect(prisma.product.create).toHaveBeenCalled();
    });

    it('D3: increments product inventory stock', async () => {
      vi.mocked(prisma.product.update).mockResolvedValue({
        id: 'prod-stock-1',
        title: 'Madu Super',
        quantity: 35, // 20 + 15
      } as any);

      const res = await updateStock('prod-stock-1', 15);

      expect(res.success).toBe(true);
      expect(res.data?.newQuantity).toBe(35);
      expect(prisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod-stock-1' },
          data: { quantity: { increment: 15 } },
        })
      );
    });

    it('D4: deletes a product by ID', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue({
        title: 'Produk Untuk Dihapus',
      } as any);
      vi.mocked(prisma.product.delete).mockResolvedValue({} as any);

      const res = await deleteProduct('prod-del-1');

      expect(res.success).toBe(true);
      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: 'prod-del-1' },
      });
    });
  });

  describe('D5: Admin Order Processing & Resi Number Input', () => {
    it('updates order status to PREPARING or IN_DELIVERY', async () => {
      vi.mocked(prisma.order.update).mockResolvedValue({
        id: 'ord-db-1',
        orderStatus: 'PREPARING',
      } as any);

      const res = await updateOrderStatus('ord-db-1', 'PREPARING');

      expect(res.success).toBe(true);
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ord-db-1' },
          data: expect.objectContaining({ orderStatus: 'PREPARING' }),
        })
      );
    });

    it('saves courier resi tracking number and marks order as IN_DELIVERY', async () => {
      vi.mocked(prisma.order.update).mockResolvedValue({
        id: 'ord-db-resi',
        resi: 'JNE-987654321',
        courier: 'JNE Reguler',
        orderStatus: 'IN_DELIVERY',
      } as any);

      const res = await updateOrderStatus('ord-db-resi', {
        status: 'IN_DELIVERY',
        resi: 'JNE-987654321',
        courier: 'JNE Reguler',
      });

      expect(res.success).toBe(true);
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ord-db-resi' },
          data: expect.objectContaining({
            resi: 'JNE-987654321',
            courier: 'JNE Reguler',
            orderStatus: 'IN_DELIVERY',
          }),
        })
      );
    });
  });

  describe('D7: Voucher Management CRUD', () => {
    it('creates a new percentage voucher', async () => {
      vi.mocked(prisma.voucher.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.voucher.create).mockResolvedValue({
        id: 'vouch-created-1',
        code: 'PROMOHEMAT',
        type: 'PERCENTAGE',
        discountValue: 15 as any,
        minOrderAmount: 100000 as any,
        maxDiscount: 25000 as any,
        expiryDate: new Date('2026-12-31'),
        usageLimit: 50,
        usedCount: 0,
        isActive: true,
      } as any);

      const res = await createVoucher({
        code: 'PROMOHEMAT',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minOrderAmount: 100000,
        maxDiscount: 25000,
        expiryDate: '2026-12-31T23:59:59.000Z',
        usageLimit: 50,
      });

      expect(res.success).toBe(true);
      expect(res.data?.code).toBe('PROMOHEMAT');
      expect(res.data?.discountValue).toBe(15);
    });

    it('toggles voucher active status', async () => {
      vi.mocked(prisma.voucher.update).mockResolvedValue({
        id: 'vouch-toggle',
        code: 'AKTIFKAN',
        type: 'FIXED_AMOUNT',
        discountValue: 10000 as any,
        minOrderAmount: null,
        maxDiscount: null,
        expiryDate: new Date(),
        usageLimit: null,
        usedCount: 0,
        isActive: true,
      } as any);

      // Passing currentStatus = false will set isActive = true
      const res = await toggleVoucherStatus('vouch-toggle', false);

      expect(res.success).toBe(true);
      expect(prisma.voucher.update).toHaveBeenCalledWith({
        where: { id: 'vouch-toggle' },
        data: { isActive: true },
      });
    });

    it('deletes an unused voucher', async () => {
      vi.mocked(prisma.voucher.findUnique).mockResolvedValue({
        id: 'vouch-del',
        code: 'DELETE_ME',
        usedCount: 0,
      } as any);
      vi.mocked(prisma.voucher.delete).mockResolvedValue({} as any);

      const res = await deleteVoucher('vouch-del');

      expect(res.success).toBe(true);
      expect(prisma.voucher.delete).toHaveBeenCalledWith({
        where: { id: 'vouch-del' },
      });
    });
  });

  describe('D8: Customer Management & Block Toggle', () => {
    it('retrieves customers list with calculated order totals and spent stats', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([
        {
          id: 'cust-1',
          name: 'Pelanggan Setia',
          email: 'setia@example.com',
          mobile: '08123456789',
          avatar: null,
          province: 'Jawa Timur',
          city: 'Surabaya',
          address: 'Jl. Pemuda No. 1',
          isBlocked: false,
          createdAt: new Date('2026-01-01'),
          _count: { orders: 2 },
          orders: [
            { orderItems: [{ price: 100000 as any, count: 2 }] }, // 200,000
            { orderItems: [{ price: 150000 as any, count: 1 }] }, // 150,000
          ],
        } as any,
      ]);

      const res = await getAdminCustomers();

      expect(res.success).toBe(true);
      expect(res.data).toHaveLength(1);
      expect(res.data?.[0].totalOrders).toBe(2);
      expect(res.data?.[0].totalSpent).toBe(350000);
    });

    it('toggles customer account blocked state', async () => {
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      const res = await toggleCustomerBlockStatus('cust-block-1', true);

      expect(res.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'cust-block-1' },
        data: { isBlocked: true },
      });
    });
  });

  describe('D10: Articles Management CRUD', () => {
    it('retrieves published articles list', async () => {
      vi.mocked(prisma.article.findMany).mockResolvedValue([
        {
          id: 'art-1',
          title: 'Manfaat Habbatussauda Untuk Imun',
          slug: 'manfaat-habbatussauda-untuk-imun',
          isPublished: true,
          createdAt: new Date(),
        } as any,
      ]);

      const res = await getArticles();

      expect(res.success).toBe(true);
      expect(res.data).toHaveLength(1);
      expect(res.data?.[0].title).toContain('Manfaat Habbatussauda');
    });

    it('retrieves single article by slug', async () => {
      vi.mocked(prisma.article.findUnique).mockResolvedValue({
        id: 'art-slug-1',
        title: 'Khasiat Madu Randu',
        slug: 'khasiat-madu-randu',
        content: 'Madu randu memiliki khasiat...',
      } as any);

      const res = await getArticleBySlug('khasiat-madu-randu');

      expect(res.success).toBe(true);
      expect(res.data?.title).toBe('Khasiat Madu Randu');
    });
  });
});
