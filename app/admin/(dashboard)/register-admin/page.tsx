import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import AdminManagerClient from './AdminManagerClient';

const secretKey = process.env.JWT_SECRET || 'alkautsar-super-secret-key-2026';
const key = new TextEncoder().encode(secretKey);

export default async function AdminsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;

  if (!token) {
    redirect('/admin/login');
  }

  try {
    const verified = await jwtVerify(token, key);
    const adminEmail = verified.payload.email as string;
    
    // Check actual role from DB to avoid legacy token issues
    const { prisma } = await import('@/lib/prisma');
    const admin = await prisma.admin.findUnique({ where: { email: adminEmail } });
    
    if (!admin || admin.role !== 'SUPERADMIN') {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
          <p className="text-gray-500">Hanya SuperAdmin yang dapat mengakses halaman ini.</p>
        </div>
      );
    }
  } catch (error) {
    redirect('/admin/login');
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manajemen Admin</h1>
        <p className="text-gray-500 mt-2">Kelola akses pengguna ke panel admin.</p>
      </div>

      <AdminManagerClient />
    </div>
  );
}
