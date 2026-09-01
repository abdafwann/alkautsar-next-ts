'use server';

import { redis } from '@/lib/redis';
import { requireAdmin, withAdminAuth } from '@/lib/auth-guard';

const DRAFT_TTL = 86400; // 24 hours in seconds

interface DraftResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export const saveDraft = withAdminAuth(async (admin, data: Record<string, unknown>) => {
  try {
    const draftKey = `draft_product_${admin.adminId}`;
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    await redis.set(draftKey, payload, { ex: DRAFT_TTL });

    return { success: true };
  } catch (error) {
    console.error('Error saving draft:', error);
    return { success: false, error: 'Gagal menyimpan draft' };
  }
});

export const getDraft = async (): Promise<DraftResponse> => {
  try {
    const admin = await requireAdmin();
    const draftKey = `draft_product_${admin.adminId}`;
    const draftData = await redis.get<string>(draftKey);

    if (!draftData) {
      return { success: true, data: null };
    }

    return { success: true, data: draftData };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal memuat draft' };
  }
};

export const deleteDraft = withAdminAuth(async (admin) => {
  try {
    const draftKey = `draft_product_${admin.adminId}`;
    await redis.del(draftKey);
    return { success: true };
  } catch (error) {
    console.error('Error deleting draft:', error);
    return { success: false, error: 'Gagal menghapus draft' };
  }
});
