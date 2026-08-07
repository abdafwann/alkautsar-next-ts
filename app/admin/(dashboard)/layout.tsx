import Link from 'next/link';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { Store, LayoutDashboard, Package, Tags, ShoppingCart, Users, Settings, LogOut } from 'lucide-react';
import { logoutAdmin } from '@/app/actions/auth';
import AdminHeader from '@/components/admin/AdminHeader';
import { prisma } from '@/lib/prisma';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read admin data from cookie
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  
  let adminName = 'Admin';
  let adminEmail = 'admin@alkautsar.com';

  if (token) {
    try {
      const secretKey = process.env.JWT_SECRET || 'alkautsar-super-secret-key-2026';
      const key = new TextEncoder().encode(secretKey);
      const verified = await jwtVerify(token, key);
      adminEmail = verified.payload.email as string;
      
      // We can also fetch the name from DB if it's not in JWT
      const admin = await prisma.admin.findUnique({ where: { email: adminEmail } });
      if (admin) adminName = admin.name;
    } catch (e) {
      console.error('Invalid token in layout');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3 h-16">
          <div className="w-8 h-8 bg-green-50 text-primary-green rounded-lg flex items-center justify-center">
            <Store size={18} />
          </div>
          <span className="font-bold text-gray-900 tracking-tight text-lg">Alkautsar Admin</span>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-primary-green bg-green-50">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          
          <div className="pt-4 pb-2">
            <span className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Katalog</span>
          </div>
          <Link href="/admin/products" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:text-primary-green hover:bg-gray-50 transition-colors">
            <Package size={18} />
            Produk
          </Link>
          <Link href="/admin/categories" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:text-primary-green hover:bg-gray-50 transition-colors">
            <Tags size={18} />
            Kategori
          </Link>

          <div className="pt-4 pb-2">
            <span className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Toko</span>
          </div>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:text-primary-green hover:bg-gray-50 transition-colors">
            <ShoppingCart size={18} />
            Pesanan
          </Link>
          <Link href="/admin/customers" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:text-primary-green hover:bg-gray-50 transition-colors">
            <Users size={18} />
            Pelanggan
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100 flex flex-col gap-2">
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:text-primary-green hover:bg-gray-50 transition-colors">
            <Settings size={18} />
            Pengaturan
          </Link>
          <form action={logoutAdmin}>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
              <LogOut size={18} />
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        
        <AdminHeader adminName={adminName} adminEmail={adminEmail} />

        {/* Page Content */}
        <main className="p-8 flex-1 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
