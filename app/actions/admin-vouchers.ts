'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth-guard';
import { logAdminActivity } from '@/lib/adminLog';
import { VoucherType } from '@prisma/client';
import { sanitizeString } from '@/lib/validation';

interface CreateVoucherInput {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit?: number;
}

// Helper to serialize voucher from Prisma
function serializeVoucher(v: {
  id: string;
  code: string;
  type: VoucherType;
  discountValue: unknown;
  minOrderAmount: unknown;
  maxDiscount: unknown;
  expiryDate: Date;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
}) {
  return {
    id: v.id,
    code: v.code,
    discountType: v.type,
    discountValue: Number(v.discountValue),
    minOrderAmount: v.minOrderAmount ? Number(v.minOrderAmount) : null,
    maxDiscount: v.maxDiscount ? Number(v.maxDiscount) : null,
    expiryDate: v.expiryDate.toISOString(),
    usageLimit: v.usageLimit,
    usedCount: v.usedCount,
    isActive: v.isActive,
  };
}

export async function createVoucher(data: CreateVoucherInput) {
  try {
    const admin = await requireAdmin();

    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Data voucher tidak valid' };
    }

    const cleanCode = sanitizeString(data.code).toUpperCase().trim();
    if (!cleanCode || cleanCode.length < 3 || cleanCode.length > 30) {
      return { success: false, error: 'Kode voucher harus terdiri dari 3-30 karakter.' };
    }

    const codeRegex = /^[A-Z0-9_-]+$/;
    if (!codeRegex.test(cleanCode)) {
      return { success: false, error: 'Kode voucher hanya boleh berisi huruf besar, angka, tanda hubung (-), atau garis bawah (_).' };
    }

    if (data.discountType !== 'PERCENTAGE' && data.discountType !== 'FIXED_AMOUNT') {
      return { success: false, error: 'Tipe diskon tidak valid.' };
    }

    const discountVal = Number(data.discountValue);
    if (isNaN(discountVal) || discountVal <= 0) {
      return { success: false, error: 'Nilai diskon harus lebih besar dari 0.' };
    }

    if (data.discountType === 'PERCENTAGE' && discountVal > 100) {
      return { success: false, error: 'Persentase diskon tidak boleh melebihi 100%.' };
    }

    const expiry = new Date(data.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(expiry.getTime()) || expiry < today) {
      return { success: false, error: 'Tanggal berakhir voucher tidak boleh di masa lampau.' };
    }

    // Check code uniqueness
    const existing = await prisma.voucher.findUnique({
      where: { code: cleanCode }
    });
    if (existing) {
      return { success: false, error: 'Kode voucher sudah digunakan. Silakan buat kode lain.' };
    }

    const minOrderAmount = data.minOrderAmount ? Math.max(0, Number(data.minOrderAmount)) : null;
    const maxDiscount = data.maxDiscount ? Math.max(0, Number(data.maxDiscount)) : null;
    const usageLimit = data.usageLimit ? Math.max(1, Math.floor(Number(data.usageLimit))) : null;

    const voucher = await prisma.voucher.create({
      data: {
        code: cleanCode,
        type: data.discountType as VoucherType,
        discountValue: discountVal,
        minOrderAmount,
        maxDiscount,
        expiryDate: expiry,
        usageLimit,
        isActive: true,
      },
    });

    const discountLabel = voucher.type === 'PERCENTAGE' 
      ? `${voucher.discountValue}%` 
      : `Rp ${Number(voucher.discountValue).toLocaleString('id-ID')}`;

    await logAdminActivity(
      admin.adminId, 
      'CREATE_VOUCHER', 
      `Menerbitkan kupon voucher baru: ${voucher.code} (Diskon ${discountLabel})`
    );

    revalidatePath('/admin/vouchers');
    revalidatePath('/admin/logs');
    return { success: true, data: serializeVoucher(voucher) };
  } catch (error: any) {
    console.error('Create voucher error:', error);
    return { success: false, error: error.message || 'Gagal membuat voucher' };
  }
}

export async function toggleVoucherStatus(id: string, currentStatus: boolean) {
  try {
    const admin = await requireAdmin();

    const voucher = await prisma.voucher.update({
      where: { id },
      data: { isActive: !currentStatus },
    });

    await logAdminActivity(
      admin.adminId, 
      'UPDATE_VOUCHER', 
      `Mengubah status kupon voucher ${voucher.code} menjadi ${!currentStatus ? 'Aktif' : 'Nonaktif'}`
    );

    revalidatePath('/admin/vouchers');
    revalidatePath('/admin/logs');
    return { success: true, data: serializeVoucher(voucher) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal mengubah status voucher' };
  }
}

export async function deleteVoucher(id: string) {
  try {
    const admin = await requireAdmin();

    const existing = await prisma.voucher.findUnique({
      where: { id },
      select: { code: true, type: true, discountValue: true }
    });

    await prisma.voucher.delete({
      where: { id },
    });

    if (existing) {
      await logAdminActivity(
        admin.adminId, 
        'DELETE_VOUCHER', 
        `Menghapus kupon voucher: ${existing.code}`
      );
    }

    revalidatePath('/admin/vouchers');
    revalidatePath('/admin/logs');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal menghapus voucher' };
  }
}

// Get all vouchers (for admin listing)
export async function getVouchers() {
  try {
    await requireAdmin();

    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: vouchers.map(serializeVoucher),
    };
  } catch (error: any) {
    console.error('Get vouchers error:', error);
    return { success: false, error: error.message || 'Gagal mengambil voucher' };
  }
}
