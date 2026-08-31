'use server';

import { prisma } from '@/lib/prisma';
import { cookies, headers } from 'next/headers';
import { jwtVerify } from 'jose';
import { encodedKey } from '@/lib/session';

async function verifySuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;

  if (!token) return { isAuthorized: false };

  try {
    const verified = await jwtVerify(token, encodedKey);
    const payload = verified.payload as any;
    
    if (payload.role !== 'SUPERADMIN') {
      return { isAuthorized: false };
    }
    return { isAuthorized: true };
  } catch (error) {
    return { isAuthorized: false };
  }
}

/**
 * Record an administrative activity for security auditing and accountability.
 */
export async function recordAdminLog({
  adminId,
  action,
  entity = 'system',
  entityId,
  details,
}: {
  adminId: string;
  action: string;
  entity?: string;
  entityId?: string;
  details?: string;
}) {
  try {
    let ipAddress = '127.0.0.1';
    let userAgent = 'Unknown';

    try {
      const headerList = await headers();
      ipAddress = headerList.get('x-forwarded-for')?.split(',')[0].trim() || headerList.get('x-real-ip') || '127.0.0.1';
      userAgent = headerList.get('user-agent') || 'Unknown';
    } catch {
      // Ignored outside Next.js request lifecycle (e.g. in test runners)
    }

    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        entity,
        entityId,
        details,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Non-blocking log recording
  }
}

export async function getAdminLogs() {
  const { isAuthorized } = await verifySuperAdmin();
  
  if (!isAuthorized) {
    return { success: false, error: 'Akses Ditolak: Hanya SuperAdmin yang dapat melihat log aktivitas.' };
  }

  try {
    const logs = await prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: { name: true, email: true, role: true }
        }
      },
      take: 100 // Batasi 100 log terbaru untuk performa
    });

    return { success: true, data: logs };
  } catch (error: any) {
    console.error('getAdminLogs error:', error);
    return { success: false, error: 'Gagal mengambil log aktivitas: ' + error.message };
  }
}
