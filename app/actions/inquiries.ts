'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin, withAdminAuth } from '@/lib/auth-guard';
import { logAdminActivity } from '@/lib/adminLog';
import { validateInquiry, sanitizeString } from '@/lib/validation';

export async function getInquiries() {
  try {
    await requireAdmin();

    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: inquiries };
  } catch (error: any) {
    console.error('getInquiries error:', error);
    return { success: false, error: error.message || 'Gagal mengambil data pesan' };
  }
}

export const updateInquiryStatus = withAdminAuth(async (adminPayload, id: string, isRead: boolean) => {
  try {
    await prisma.inquiry.update({
      where: { id },
      data: { isRead }
    });

    await logAdminActivity(
      adminPayload.adminId,
      'UPDATE_INQUIRY',
      `Mengubah status pesan ID: ${id}`
    );

    revalidatePath('/admin/inquiries');
    revalidatePath('/admin', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('updateInquiryStatus error:', error);
    return { success: false, error: 'Gagal memperbarui status pesan' };
  }
});

export async function createInquiry(data: { name: string; email: string; subject?: string; message: string }) {
  try {
    // Server-side validation
    const validation = validateInquiry({
      name: sanitizeString(data.name),
      email: sanitizeString(data.email),
      subject: sanitizeString(data.subject || ''),
      message: sanitizeString(data.message),
    });

    if (!validation.success) {
      const errors = Object.values(validation.errors).join(', ');
      return { success: false, error: `Validasi gagal: ${errors}` };
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name: validation.data.name,
        email: validation.data.email,
        subject: validation.data.subject || null,
        message: validation.data.message,
      }
    });

    revalidatePath('/admin/inquiries');
    return { success: true, data: inquiry };
  } catch (error: any) {
    console.error('createInquiry error:', error);
    return { success: false, error: 'Gagal mengirim pesan, silakan coba lagi' };
  }
}
