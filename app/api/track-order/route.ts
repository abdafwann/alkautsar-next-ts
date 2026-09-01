import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';
import { verifyOrderClaimToken } from '@/lib/order-security';

export async function POST(req: Request) {
  try {
    const { email, orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Nomor Pesanan diperlukan' }, { status: 400 });
    }

    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const cleanOrderId = orderId.trim();

    const order = await prisma.order.findUnique({
      where: { orderId: cleanOrderId },
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
            name: true,
            email: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan. Pastikan Nomor Pesanan sudah benar.' }, { status: 404 });
    }

    // Security validation: Verify email, signed cookie token, or member session
    let isAuthorized = false;

    if (cleanEmail) {
      const isValidGuest = order.guestEmail && order.guestEmail.toLowerCase().trim() === cleanEmail;
      const isValidUser = order.user && order.user.email.toLowerCase().trim() === cleanEmail;
      if (isValidGuest || isValidUser) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      const session = await getSession();
      if (session && order.userId && session.userId === order.userId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      const cookieStore = await cookies();
      const claimCookie = cookieStore.get(`order_claim_${cleanOrderId}`)?.value;
      if (claimCookie) {
        const claim = await verifyOrderClaimToken(claimCookie, order.orderId);
        if (claim && claim.email.toLowerCase() === (order.guestEmail || '').toLowerCase()) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Akses ditolak. Silakan masukkan email yang sesuai dengan pesanan ini.' }, { status: 403 });
    }

    // Sanitize output - exclude internal user credentials
    const sanitizedOrder = {
      id: order.id,
      orderId: order.orderId,
      guestEmail: order.guestEmail || order.user?.email || '',
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentAmount: order.paymentAmount ? Number(order.paymentAmount) : 0,
      paymentExpiry: order.paymentExpiry,
      resi: order.resi || '',
      courier: order.courier || '',
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt,
      snapToken: order.paymentStatus === 'UNPAID' ? order.snapToken : null,
      shippingName: order.shippingName || order.user?.name || order.guestName || '',
      shippingMobile: order.shippingMobile || '',
      shippingCity: order.shippingCity || '',
      shippingProvince: order.shippingProvince || '',
      shippingAddress: order.shippingAddress || '',
      shippingPostalCode: order.shippingPostalCode || '',
      shippingNote: order.shippingNote || '',
      shipping: {
        name: order.shippingName || order.user?.name || order.guestName || '',
        mobile: order.shippingMobile || '',
        city: order.shippingCity || '',
        province: order.shippingProvince || '',
        address: order.shippingAddress || '',
        postalCode: order.shippingPostalCode || '',
        note: order.shippingNote || ''
      },
      orderItems: order.orderItems.map(item => ({
        id: item.id,
        count: item.count,
        price: Number(item.price),
        product: {
          title: item.product?.title || '',
          slug: item.product?.slug || '',
          images: item.product?.images || []
        }
      }))
    };

    return NextResponse.json({ success: true, order: sanitizedOrder });

  } catch (error) {
    console.error('Tracking API error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
