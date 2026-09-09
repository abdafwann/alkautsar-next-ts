'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { requireAdmin } from '@/lib/auth-guard';
import { SESSION } from '@/lib/constants';
import { verifyOrderClaimToken } from '@/lib/order-security';

export interface InvoiceItem {
  id: string;
  title: string;
  form?: string | null;
  count: number;
  price: number;
  total: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  orderId: string;
  orderDate: string;
  paymentDate?: string | null;
  paymentStatus: string;
  paymentType: string;
  orderStatus: string;
  courier?: string | null;
  resi?: string | null;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    province: string;
    city: string;
    postalCode: string;
    note?: string | null;
  };
  company: {
    name: string;
    tagline: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    website: string;
  };
  items: InvoiceItem[];
  pricing: {
    subtotal: number;
    discountAmount: number;
    voucherCode?: string | null;
    shippingFee: number;
    grandTotal: number;
  };
}

const SAMPLE_INVOICE: InvoiceData = {
  invoiceNumber: `INV/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/ALK/00842`,
  orderId: 'ORDER-20260830-9841',
  orderDate: new Date().toISOString(),
  paymentDate: new Date().toISOString(),
  paymentStatus: 'PAID',
  paymentType: 'Midtrans QRIS / GoPay',
  orderStatus: 'PROCESSING',
  courier: 'JNE Reguler',
  resi: 'JNE889421049281',
  customer: {
    name: 'Ahmad Fauzi',
    email: 'ahmad.fauzi@example.com',
    phone: '0812-8934-2104',
    address: 'Jl. Merak No. 12, RT 04 / RW 02, Kel. Sukamaju, Kec. Cilodong',
    city: 'Kota Depok',
    province: 'Jawa Barat',
    postalCode: '16413',
    note: 'Mohon paket dibungkus bubble wrap ekstra.',
  },
  company: {
    name: 'PT. AL-KAUTSAR HERBAL INDONESIA',
    tagline: 'Penyedia Produk Herbal Alami, Thibbun Nabawi & Suplemen Kesehatan',
    address: 'Kawasan Niaga Herbal, Jl. Raya Tajur No. 88',
    city: 'Kota Bogor, Jawa Barat 16134',
    phone: '+62 812-9000-8841',
    email: 'billing@alkautsar.com',
    website: 'https://alkautsar.com',
  },
  items: [
    {
      id: 'item-1',
      title: 'Minyak Habbatussauda Extra Virgin 100ml',
      form: 'Cair / Minyak',
      count: 2,
      price: 72250,
      total: 144500,
    },
    {
      id: 'item-2',
      title: 'Madu Murni Randu Asli Al-Kautsar 500g',
      form: 'Madu / Cair',
      count: 1,
      price: 120000,
      total: 120000,
    },
    {
      id: 'item-3',
      title: 'Kapsul Daun Bidara Arab 60 Kapsul',
      form: 'Kapsul Herbal',
      count: 1,
      price: 65000,
      total: 65000,
    }
  ],
  pricing: {
    subtotal: 329500,
    discountAmount: 25000,
    voucherCode: 'BERKAHSEHAT',
    shippingFee: 15000,
    grandTotal: 319500,
  }
};

export async function getInvoiceData(orderIdentifier: string): Promise<{ success: boolean; data?: InvoiceData; error?: string }> {
  try {
    if (!orderIdentifier) {
      return { success: false, error: 'ID Pesanan wajib disertakan' };
    }

    // Direct sample request
    if (orderIdentifier.toLowerCase() === 'sample' || orderIdentifier.toLowerCase() === 'preview') {
      return { success: true, data: SAMPLE_INVOICE };
    }

    // Try finding order in DB
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderIdentifier },
          { orderId: orderIdentifier },
          { invoiceId: orderIdentifier }
        ]
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: {
          include: {
            product: {
              select: { id: true, title: true, productForm: true, price: true }
            }
          }
        }
      }
    });

    if (!order) {
      return { success: false, error: 'Pesanan tidak ditemukan' };
    }

    // 🔒 BOLA / IDOR Protection: Verify identity of requester
    const session = await getSession();
    const cookieStore = await cookies();
    const effectiveOrderId = order.orderId || order.id;
    const claimCookie = effectiveOrderId ? cookieStore.get(`order_claim_${effectiveOrderId}`)?.value : undefined;
    const adminCookie = cookieStore.get(SESSION.ADMIN_COOKIE)?.value;

    let isAdmin = false;
    if (adminCookie) {
      try {
        const admin = await requireAdmin();
        if (admin) isAdmin = true;
      } catch {
        isAdmin = false;
      }
    }
    const isMember = Boolean(session?.userId && order.userId && session.userId === order.userId);
    const hasClaimToken = Boolean(claimCookie && (await verifyOrderClaimToken(claimCookie, effectiveOrderId)));

    if (!isAdmin && !isMember && !hasClaimToken) {
      return {
        success: false,
        error: 'Akses ditolak: Verifikasi identitas atau klaim sesi diperlukan untuk melihat faktur.'
      };
    }

    // Generate and persist invoiceId if missing
    let invoiceNumber = order.invoiceId;
    if (!invoiceNumber) {
      const dateStr = order.createdAt.toISOString().slice(0, 10).replace(/-/g, '');
      const uniqueSuffix = order.id.slice(-5).toUpperCase();
      invoiceNumber = `INV/${dateStr}/ALK/${uniqueSuffix}`;

      // Update in DB asynchronously
      try {
        await prisma.order.update({
          where: { id: order.id },
          data: { invoiceId: invoiceNumber }
        });
      } catch {
        // Non-blocking update failure
      }
    }

    // Calculate itemized totals
    const items: InvoiceItem[] = order.orderItems.map((item) => {
      const price = Number(item.price);
      const total = price * item.count;
      return {
        id: item.id,
        title: item.product?.title || 'Produk Herbal Al-Kautsar',
        form: item.product?.productForm || 'Herbal Alami',
        count: item.count,
        price,
        total,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = order.discountAmount ? Number(order.discountAmount) : 0;
    const grandTotal = Number(order.paymentAmount || (subtotal - discountAmount));
    const shippingFee = Math.max(0, grandTotal - (subtotal - discountAmount));

    const invoiceData: InvoiceData = {
      invoiceNumber,
      orderId: order.orderId || order.id,
      orderDate: order.createdAt.toISOString(),
      paymentDate: order.paymentSettlement || (order.paymentStatus === 'PAID' ? order.updatedAt.toISOString() : null),
      paymentStatus: order.paymentStatus,
      paymentType: formatPaymentType(order.paymentType),
      orderStatus: order.orderStatus,
      courier: order.courier || 'Kurir Standar',
      resi: order.resi || null,
      customer: {
        name: order.shippingName || order.guestName || order.user?.name || 'Pelanggan',
        email: order.guestEmail || order.user?.email || '-',
        phone: order.shippingMobile || '-',
        address: order.shippingAddress || '-',
        province: order.shippingProvince || '-',
        city: order.shippingCity || '-',
        postalCode: order.shippingPostalCode || '-',
        note: order.shippingNote || null,
      },
      company: {
        name: 'PT. AL-KAUTSAR HERBAL INDONESIA',
        tagline: 'Penyedia Produk Herbal Alami, Thibbun Nabawi & Suplemen Kesehatan',
        address: 'Kawasan Niaga Herbal, Jl. Raya Tajur No. 88',
        city: 'Kota Bogor, Jawa Barat 16134',
        phone: '+62 812-9000-8841',
        email: 'billing@alkautsar.com',
        website: 'https://alkautsar.com',
      },
      items,
      pricing: {
        subtotal,
        discountAmount,
        voucherCode: order.voucherCode || null,
        shippingFee,
        grandTotal,
      }
    };

    return { success: true, data: invoiceData };
  } catch (error: any) {
    console.error('getInvoiceData error:', error);
    return { success: false, error: error.message || 'Gagal memuat data faktur' };
  }
}

function formatPaymentType(type?: string | null): string {
  if (!type) return 'Midtrans Payment Gateway';
  const t = type.toLowerCase();
  if (t.includes('qris') || t.includes('gopay') || t.includes('shopeepay')) return 'Midtrans QRIS / E-Wallet';
  if (t.includes('bca') || t.includes('echannel') || t.includes('va') || t.includes('bank_transfer')) return 'Virtual Account (VA)';
  if (t.includes('cstore') || t.includes('indomaret') || t.includes('alfamart')) return 'Gerai Ritel (Indomaret/Alfamart)';
  return type.toUpperCase();
}
