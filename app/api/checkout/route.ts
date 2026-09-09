import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import midtransClient from 'midtrans-client';
import { getSession } from '@/lib/session';
import { checkoutLimiter } from '@/lib/ratelimit';
import { createOrderClaimToken } from '@/lib/order-security';
import { sanitizeString, isValidEmail } from '@/lib/validation';
import { calculateShippingFee } from '@/lib/shipping';

// Initialize Midtrans Snap Client with dynamic environment support
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const snap = new midtransClient.Snap({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-YOUR_SERVER_KEY_HERE',
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-YOUR_CLIENT_KEY_HERE'
});

export async function POST(req: Request) {
  try {
    // 1. Rate limiting for checkout - prevent spam
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = await checkoutLimiter.limit(ip);

    if (!success) {
      return NextResponse.json({
        error: 'Terlalu banyak permintaan checkout. Coba lagi dalam beberapa menit.'
      }, { status: 429 });
    }

    const body = await req.json();
    const {
      items,
      name,
      email,
      phone,
      address,
      province,
      city,
      postalCode,
      note,
      shippingFee = 0,
      voucherCode
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Keranjang belanja kosong' }, { status: 400 });
    }

    // Sanitize & validate shipping inputs
    const cleanName = sanitizeString(name).slice(0, 100);
    const cleanEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';
    const cleanPhone = sanitizeString(phone).slice(0, 30);
    const cleanAddress = sanitizeString(address).slice(0, 500);
    const cleanProvince = sanitizeString(province || '').slice(0, 100);
    const cleanCity = sanitizeString(city || '').slice(0, 100);
    const cleanPostalCode = sanitizeString(postalCode || '').slice(0, 20);
    const cleanNote = note ? sanitizeString(note).slice(0, 500) : null;
    
    // Server-side authoritative shipping fee calculation (prevents client-side price tampering)
    const { shippingFee: serverShippingFee } = calculateShippingFee({
      province: cleanProvince,
      city: cleanCity
    });

    if (!cleanName || !cleanEmail || !cleanPhone || !cleanAddress) {
      return NextResponse.json({ error: 'Data pengiriman tidak lengkap' }, { status: 400 });
    }

    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: 'Format alamat email tidak valid' }, { status: 400 });
    }

    // Validate integer quantities for all cart items (prevent NaN/negative/float exploitation)
    for (const item of items) {
      const qty = Math.floor(Number(item.quantity));
      if (!Number.isInteger(qty) || qty < 1 || qty > 999) {
        return NextResponse.json({ error: 'Kuantitas produk dalam keranjang tidak valid' }, { status: 400 });
      }
      item.quantity = qty;
    }

    const session = await getSession();

    // 2. Anti-Hoarding Check: User cannot place another order if they already have an active unpaid order
    const existingUnpaidOrder = await prisma.order.findFirst({
      where: {
        OR: [
          session ? { userId: session.userId } : undefined,
          { guestEmail: cleanEmail },
        ].filter(Boolean) as any[],
        orderStatus: 'WAITING_FOR_PAYMENT',
        paymentExpiry: { gt: new Date() }
      }
    });

    if (existingUnpaidOrder) {
      if (!existingUnpaidOrder.snapToken) {
        // Automatically clean up incomplete/orphaned order so user can checkout cleanly
        await prisma.order.update({
          where: { id: existingUnpaidOrder.id },
          data: { orderStatus: 'CANCELLED' }
        });
      } else {
        return NextResponse.json({
          error: 'Anda masih memiliki pesanan aktif yang belum dibayar. Silakan selesaikan pembayaran atau batalkan pesanan sebelumnya di menu pesanan.'
        }, { status: 400 });
      }
    }

    const productIds: string[] = items.map((item: any) => item.id);
    const sortedProductIds = [...productIds].sort(); // Prevent deadlock in concurrent locking
    const orderId = `ORDER-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();

    // 3. Pessimistic Row Locking & Transactional Order Processing
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Row lock on all involved products
      const lockedProducts = await tx.$queryRaw<any[]>`
        SELECT id, title, price, "promoPrice", "isPromo", "promoExpiry", quantity 
        FROM "Product" 
        WHERE id = ANY(${sortedProductIds}::text[]) 
        FOR UPDATE
      `;

      const productMap = new Map(lockedProducts.map(p => [p.id, p]));
      let subtotal = 0;
      let normalSubtotal = 0;
      const orderItems = [];
      let isLowStockOrder = false;

      for (const item of items) {
        const product = productMap.get(item.id);

        if (!product) {
          throw new Error(`Produk tidak ditemukan: ${item.id}`);
        }

        // Exact stock verification under lock
        if (product.quantity < item.quantity) {
          throw new Error(`Stok produk "${product.title}" tidak mencukupi permintaan Anda (tersedia: ${product.quantity} item).`);
        }

        // If remaining stock after purchase is <= 2, trigger 1-hour urgent reservation window
        if (product.quantity - item.quantity <= 2) {
          isLowStockOrder = true;
        }

        const isPromoValid = product.isPromo && (!product.promoExpiry || new Date(product.promoExpiry) >= now);
        const unitPrice = isPromoValid && product.promoPrice ? Number(product.promoPrice) : Number(product.price);

        subtotal += unitPrice * item.quantity;
        if (!isPromoValid) {
          normalSubtotal += unitPrice * item.quantity;
        }

        orderItems.push({
          productId: product.id,
          count: item.quantity,
          price: unitPrice,
          name: product.title
        });
      }

      // Dynamic cooldown: 1 hour for low-stock items (<= 2 left), 6 hours for standard stock
      const cooldownHours = isLowStockOrder ? 1 : 6;
      const paymentExpiry = new Date(Date.now() + cooldownHours * 60 * 60 * 1000);

      // Voucher validation under row lock with type & maxDiscount protection
      let finalDiscountAmount = 0;
      let finalVoucherId: string | null = null;

      if (voucherCode) {
        const cleanVoucherCode = voucherCode.toUpperCase().trim();
        const lockedVouchers = await tx.$queryRaw<any[]>`
          SELECT * FROM "Voucher" WHERE code = ${cleanVoucherCode} FOR UPDATE
        `;

        if (lockedVouchers.length > 0) {
          const v = lockedVouchers[0];
          const isVoucherValid =
            v.isActive &&
            new Date(v.expiryDate) >= now &&
            (!v.usageLimit || v.usedCount < v.usageLimit) &&
            (!v.minOrderAmount || subtotal >= Number(v.minOrderAmount));

          if (isVoucherValid && normalSubtotal > 0) {
            const vType = v.type || v.discountType;
            if (vType === 'PERCENTAGE') {
              finalDiscountAmount = (normalSubtotal * Number(v.discountValue)) / 100;
              if (v.maxDiscount && finalDiscountAmount > Number(v.maxDiscount)) {
                finalDiscountAmount = Number(v.maxDiscount);
              }
            } else {
              finalDiscountAmount = Number(v.discountValue);
            }

            if (finalDiscountAmount > normalSubtotal) {
              finalDiscountAmount = normalSubtotal;
            }

            await tx.voucher.update({
              where: { code: cleanVoucherCode },
              data: { usedCount: { increment: 1 } }
            });

            finalVoucherId = v.id;
          }
        }
      }

      // Atomically decrement inventory stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.id },
          data: { quantity: { decrement: item.quantity } }
        });
      }

      const grossAmount = subtotal - finalDiscountAmount + serverShippingFee;

      // Create Order
      const createdOrder = await tx.order.create({
        data: {
          orderId,
          userId: session ? session.userId : null,
          guestName: cleanName,
          guestEmail: cleanEmail,
          shippingName: cleanName,
          shippingMobile: cleanPhone,
          shippingAddress: cleanAddress,
          shippingProvince: cleanProvince,
          shippingCity: cleanCity,
          shippingPostalCode: cleanPostalCode,
          shippingNote: cleanNote,
          paymentAmount: grossAmount,
          orderStatus: 'WAITING_FOR_PAYMENT',
          paymentStatus: 'UNPAID',
          paymentExpiry,
          voucherId: finalDiscountAmount > 0 ? finalVoucherId : null,
          voucherCode: finalDiscountAmount > 0 && voucherCode ? voucherCode.toUpperCase().trim() : null,
          discountAmount: finalDiscountAmount > 0 ? finalDiscountAmount : 0,
          orderItems: {
            create: orderItems.map(oi => ({
              productId: oi.productId,
              count: oi.count,
              price: oi.price
            }))
          }
        }
      });

      /*
       * Mengosongkan keranjang di database untuk akun member segera setelah pesanan terbentuk 
       * guna mencegah item yang sama tertinggal atau terbayar ganda pada sesi berikutnya
       */
      if (session?.userId) {
        await tx.cartItem.deleteMany({
          where: { userId: session.userId }
        });
      }

      return {
        order: createdOrder,
        orderItems,
        grossAmount,
        finalDiscountAmount,
        cooldownHours,
        paymentExpiry
      };
    });

    /*
     * Menghapus cache keranjang di Redis agar panggilan sinkronisasi cart berikutnya 
     * langsung merefleksikan status keranjang kosong tanpa menunggu TTL 5 menit habis
     */
    if (session?.userId) {
      try {
        const { redis } = await import('@/lib/redis');
        await redis.del(`cart:${session.userId}`);
      } catch {}
    }

    // 4. Prepare Midtrans Snap parameters with dynamic expiry
    const itemDetails = transactionResult.orderItems.map(item => ({
      id: item.productId,
      price: item.price,
      quantity: item.count,
      name: item.name.substring(0, 50)
    }));

    if (serverShippingFee > 0) {
      itemDetails.push({
        id: 'SHIPPING',
        price: serverShippingFee,
        quantity: 1,
        name: 'Ongkos Kirim'
      });
    }

    if (transactionResult.finalDiscountAmount > 0) {
      itemDetails.push({
        id: 'DISCOUNT',
        price: -transactionResult.finalDiscountAmount,
        quantity: 1,
        name: `Diskon Voucher (${voucherCode ? voucherCode.toUpperCase().trim() : ''})`
      });
    }

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: transactionResult.grossAmount
      },
      customer_details: {
        first_name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        shipping_address: {
          first_name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          address: cleanAddress,
          city: cleanCity,
          postal_code: cleanPostalCode,
          country_code: 'IDN'
        }
      },
      item_details: itemDetails,
      expiry: {
        unit: 'minute',
        duration: transactionResult.cooldownHours * 60
      }
    };

    // 5. Create Snap transaction
    const transaction = await snap.createTransaction(parameter);
    const token = transaction.token;

    // 6. Update order with snapToken
    await prisma.order.update({
      where: { id: transactionResult.order.id },
      data: { snapToken: token }
    });

    // 7. Generate cryptographically signed claim token cookie for seamless & secure verification
    const claimToken = await createOrderClaimToken(orderId, cleanEmail);

    const response = NextResponse.json({
      token,
      orderId,
      paymentExpiry: transactionResult.paymentExpiry.toISOString(),
      cooldownHours: transactionResult.cooldownHours
    });

    response.cookies.set(`order_claim_${orderId}`, claimToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 48 * 3600,
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({
      error: error.message || 'Terjadi kesalahan saat memproses checkout'
    }, { status: 400 });
  }
}
