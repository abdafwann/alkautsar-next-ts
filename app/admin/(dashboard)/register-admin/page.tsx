import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import AdminManagerClient from './AdminManagerClient';
import AdminPageErrorBoundary from '../_components/AdminPageErrorBoundary';
import { ShieldAlert } from 'lucide-react';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Manajemen Staff & RBAC | Admin Al-Kautsar',
  description: 'Kelola hak akses dan peran administrator toko herbal',
};

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  throw new Error('JWT_SECRET environment variable is required');
}

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
    
    // Direct database role check guarantees live permission revocation without stale JWT payload
    const { prisma } = await import('@/lib/prisma');
    const admin = await prisma.admin.findUnique({ where: { email: adminEmail } });
    
    if (!admin || admin.role !== 'SUPERADMIN') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-3.5 border border-red-100 shadow-xs">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Akses Terbatas</h2>
          <p className="text-xs text-gray-500 max-w-sm">
            Halaman manajemen administrator dan hak akses RBAC hanya dapat dibuka oleh akun dengan role <strong>SuperAdmin</strong>.
          </p>
        </div>
      );
    }
  } catch {
    redirect('/admin/login');
  }

  return (
    <AdminPageErrorBoundary>
      <AdminManagerClient />
    </AdminPageErrorBoundary>
  );
}
