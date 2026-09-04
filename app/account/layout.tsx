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

  const user = {
    name: (session.name as string) || 'Pelanggan Setia',
    email: (session.email as string) || '',
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] border-b border-[#ede8de]/70 py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Section Breadcrumb / Kicker */}
        <div className="mb-8">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-accent-brown block mb-1.5">
            Portal Anggota Resmi
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-text-main tracking-tight">
            Akun &amp; <span className="italic font-normal text-dark-green">Layanan Pelanggan</span>
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <div className="w-full lg:w-72 shrink-0">
            <SidebarClient user={user} />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full min-w-0">
            <div className="bg-white rounded-2xl shadow-2xs border border-[#ede8de] p-6 sm:p-8 md:p-10">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
