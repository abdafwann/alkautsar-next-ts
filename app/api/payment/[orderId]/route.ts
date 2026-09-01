import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import {
  createOrderClaimToken,
  verifyOrderClaimToken,
  maskEmail,
  maskPhone,
  maskName,
  maskAddress
} from '@/lib/order-security';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { searchParams } = new URL(request.url);
    const queryEmail = searchParams.get('email')?.toLowerCase().trim();

    const order = await prisma.order.findFirst({
      where: { orderId: orderId.trim() },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                title: true,
                slug: true,
                images: { select: { url: true }, take: 1 }
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Auto-sync status with Midtrans if still unpaid
    if (order.paymentStatus === 'UNPAID' && order.snapToken) {
      try {
        const midtransClient = (await import('midtrans-client')).default;
        const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
        const coreApi = new midtransClient.CoreApi({
          isProduction,
          serverKey: process.env.MIDTRANS_SERVER_KEY || '',
          clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
        });

        const statusRes = await coreApi.transaction.status(order.orderId);
        if (statusRes && (statusRes.transaction_status === 'settlement' || statusRes.transaction_status === 'capture')) {
          order.paymentStatus = 'PAID';
          order.orderStatus = 'PROCESSING';
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'PAID',
              orderStatus: 'PROCESSING',
              paymentType: statusRes.payment_type || 'qris',
              paymentSettlement: statusRes.settlement_time || new Date().toISOString()
            }
          });
        }
      } catch {
        // Non-blocking fallback
      }
    }

    // 🔒 Ownership Verification (Zero-Trust Security Barrier)
    const cookieStore = await cookies();
    const claimCookie = cookieStore.get(`order_claim_${order.orderId}`)?.value;
    const session = await getSession();

    let isOwner = false;

    // Check 1: Logged-in member matching order userId
    if (session && order.userId && session.userId === order.userId) {
      isOwner = true;
    }

    // Check 2: Browser has valid cryptographically signed claim cookie
    if (!isOwner && claimCookie) {
      const claim = await verifyOrderClaimToken(claimCookie, order.orderId);
      if (claim && claim.email.toLowerCase() === (order.guestEmail || '').toLowerCase()) {
        isOwner = true;
      }
    }

    // Check 3: Query email matches order email
    if (!isOwner && queryEmail) {
      const targetEmail = (order.guestEmail || order.user?.email || '').toLowerCase().trim();
      if (queryEmail === targetEmail) {
        isOwner = true;
      }
    }

    const rawShippingName = order.shippingName || order.user?.name || order.guestName || '';
    const rawShippingMobile = order.shippingMobile || '';
    const rawShippingAddress = order.shippingAddress || '';
    const rawGuestEmail = order.guestEmail || order.user?.email || '';

    // Apply PII masking if not verified owner
    const shippingData = {
      shippingName: isOwner ? rawShippingName : maskName(rawShippingName),
      shippingMobile: isOwner ? rawShippingMobile : maskPhone(rawShippingMobile),
      shippingAddress: isOwner ? rawShippingAddress : maskAddress(rawShippingAddress),
      shippingCity: order.shippingCity || '',
      shippingProvince: order.shippingProvince || '',
      shippingPostalCode: order.shippingPostalCode || ''
    };

    const formattedExpiry = order.paymentExpiry instanceof Date
      ? order.paymentExpiry.toISOString()
      : order.paymentExpiry;

    const claimToken = await createOrderClaimToken(order.orderId, rawGuestEmail || '');

    const response = NextResponse.json({
      success: true,
      order: {
        orderId: order.orderId,
        guestName: isOwner ? order.guestName : maskName(order.guestName),
        guestEmail: isOwner ? rawGuestEmail : maskEmail(rawGuestEmail),
        trackEmail: rawGuestEmail,
        userId: order.userId,
        isMember: Boolean(order.userId),
        isOwner: true,
        ...shippingData,
        paymentAmount: order.paymentAmount ? Number(order.paymentAmount) : 0,
        paymentExpiry: formattedExpiry,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        snapToken: order.snapToken,
        orderItems: order.orderItems.map(item => ({
          id: item.id,
          count: item.count,
          price: Number(item.price),
          product: item.product
        }))
      }
    });

    if (rawGuestEmail) {
      response.cookies.set(`order_claim_${order.orderId}`, claimToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 48 * 3600,
        path: '/'
      });
    }

    return response;

  } catch (error) {
    console.error('Payment API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
