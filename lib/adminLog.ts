import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function logAdminActivity(
  adminId: string, 
  action: string, 
  details?: string,
  entity: string = 'system',
  entityId?: string
) {
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
        userAgent
      }
    });
  } catch (error) {
    // Non-blocking log recording
  }
}
