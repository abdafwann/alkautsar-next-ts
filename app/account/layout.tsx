import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { SidebarClient } from './SidebarClient';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Protect all /account routes
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-64 shrink-0">
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="lg:hidden mb-6">
              <h1 className="text-xl font-bold text-gray-900">Akun Saya</h1>
              <p className="text-sm text-gray-500">Kelola informasi profil dan pesanan Anda.</p>
            </div>
            
            <SidebarClient />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-zinc-100 p-5 sm:p-6 lg:p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
