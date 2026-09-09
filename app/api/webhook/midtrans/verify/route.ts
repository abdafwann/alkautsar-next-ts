import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { requireAdmin } from '@/lib/auth-guard';
import { SESSION } from '@/lib/constants';
import { verifyOrderClaimToken } from '@/lib/order-security';
import { paymentSyncLimiter } from '@/lib/ratelimit';
import { syncPaymentStatus } from '@/app/actions/order';
import { sanitizeString } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    // 1. Rate limiting - Prevent Midtrans API flooding / Denial of Service
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = await paymentSyncLimiter.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan verifikasi status. Coba lagi dalam satu menit.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawOrderId = body?.orderId;

    if (!rawOrderId || typeof rawOrderId !== 'string') {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const cleanOrderId = sanitizeString(rawOrderId).trim();

    // 2. Fetch order
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderId: cleanOrderId },
          { id: cleanOrderId }
        ]
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    // 3. Authorization Guard: Admin, Member Owner, or Signed Claim Token Holder
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
      return NextResponse.json(
        { error: 'Akses ditolak: Verifikasi otorisasi diperlukan untuk menyinkronkan status pesanan ini.' },
        { status: 403 }
      );
    }

    const result = await syncPaymentStatus(order.orderId || order.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Verify payment endpoint error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
