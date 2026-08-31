'use server';

import { prisma } from '@/lib/prisma';

export async function checkVoucher(code: string, cartTotal: number, normalItemsTotal: number = cartTotal) {
  try {
    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!voucher) {
      return { success: false, error: 'Voucher tidak ditemukan.' };
    }

    if (!voucher.isActive) {
      return { success: false, error: 'Voucher sudah tidak aktif.' };
    }

    if (new Date(voucher.expiryDate) < new Date()) {
      return { success: false, error: 'Voucher sudah kedaluwarsa.' };
    }

    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return { success: false, error: 'Kuota penggunaan voucher ini sudah habis.' };
    }

    if (voucher.minOrderAmount && cartTotal < Number(voucher.minOrderAmount)) {
      return { 
        success: false, 
        error: `Minimal belanja Rp ${new Intl.NumberFormat('id-ID').format(Number(voucher.minOrderAmount))} untuk menggunakan voucher ini.` 
      };
    }

    if (normalItemsTotal <= 0) {
      return { success: false, error: 'Voucher tidak dapat digunakan untuk produk Promo/Flash Sale.' };
    }

    // Calculate discount based on normalItemsTotal
    let discountAmount = 0;
    if (voucher.type === 'PERCENTAGE') {
      discountAmount = (normalItemsTotal * Number(voucher.discountValue)) / 100;
      if (voucher.maxDiscount && discountAmount > Number(voucher.maxDiscount)) {
        discountAmount = Number(voucher.maxDiscount);
      }
    } else {
      discountAmount = Number(voucher.discountValue);
    }

    // Cap discount at normal items total
    if (discountAmount > normalItemsTotal) {
      discountAmount = normalItemsTotal;
    }

    return {
      success: true,
      data: {
        id: voucher.id,
        code: voucher.code,
        discountAmount,
        discountType: voucher.type,
        discountValue: Number(voucher.discountValue)
      }
    };

  } catch (error: any) {
    console.error('Check voucher error:', error);
    return { success: false, error: 'Terjadi kesalahan saat memeriksa voucher.' };
  }
}
