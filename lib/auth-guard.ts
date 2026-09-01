import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { encodedKey } from '@/lib/session';
import { VALID_ADMIN_ROLES, SESSION } from '@/lib/constants';
import { prisma } from '@/lib/prisma';

export type AdminPayload = {
  adminId: string;
  email: string;
  role: string;
  name?: string;
  [key: string]: any;
};

/**
 * Validate admin session and return the payload.
 * Also checks the database to guarantee instant revocation if admin account was deleted.
 * Throws 'Unauthorized' if no valid session exists.
 */
export async function requireAdmin(): Promise<AdminPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION.ADMIN_COOKIE)?.value;

  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    const { payload } = await jwtVerify(token, encodedKey);
    const adminPayload = payload as AdminPayload;

    // Database lookup to enforce immediate revocation if deleted or role changed
    const admin = await prisma.admin.findUnique({
      where: { id: adminPayload.adminId }
    });

    if (!admin) {
      throw new Error('Unauthorized');
    }

    return {
      ...adminPayload,
      role: admin.role,
      email: admin.email,
      name: admin.name,
    };
  } catch (error) {
    throw new Error('Unauthorized');
  }
}

/**
 * A Higher-Order Function (Wrapper) to protect Server Actions.
 * It ensures only valid Admins can execute the wrapped action.
 */
export function withAdminAuth<T extends any[], R>(
  action: (adminPayload: AdminPayload, ...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | { error: string }> => {
    try {
      const adminPayload = await requireAdmin();

      // Role check
      const role = adminPayload.role as string;
      if (!VALID_ADMIN_ROLES.includes(role as any)) {
        return { error: 'Akses ditolak: Anda tidak memiliki izin Admin.' };
      }

      // Execute the actual server action, passing the validated payload
      return await action(adminPayload, ...args);
    } catch (error) {
      console.error('Auth Guard Error:', error);
      return { error: 'Akses ditolak: Token tidak valid atau kedaluwarsa.' };
    }
  };
}
