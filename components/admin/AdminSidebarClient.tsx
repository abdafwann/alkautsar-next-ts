'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, LayoutDashboard, Package, Tags, ShoppingCart, Users, Settings, LogOut, ShieldCheck, BarChart3, Ticket, Activity, FileText, MessageSquare } from 'lucide-react';
import { logoutAdmin } from '@/app/actions/auth';
import { motion } from 'framer-motion';

interface AdminSidebarClientProps {
  adminRole: string;
}

export default function AdminSidebarClient({ adminRole }: AdminSidebarClientProps) {
  const pathname = usePathname();

  const isRouteActive = (route: string) => {
    if (route === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(route);
  };

  const navGroups = [
    {
      title: 'Utama',
      items: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Laporan', href: '/admin/reports', icon: BarChart3 }
      ]
    },
    {
      title: 'Katalog',
      items: [
        { name: 'Produk', href: '/admin/products', icon: Package },
        { name: 'Kategori', href: '/admin/categories', icon: Tags },
        { name: 'Voucher', href: '/admin/vouchers', icon: Ticket },
        { name: 'Artikel', href: '/admin/articles', icon: FileText }
      ]
    },
    {
      title: 'Toko',
      items: [
        { name: 'Pesanan', href: '/admin/orders', icon: ShoppingCart },
        { name: 'Pelanggan', href: '/admin/customers', icon: Users },
        { name: 'Inquiry & Kontak', href: '/admin/inquiries', icon: MessageSquare }
      ]
    }
  ];

  return (
    <aside className="w-[280px] bg-white border-r border-zinc-100 flex flex-col fixed h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.01)]">
      {/* Brand Header */}
      <div className="px-6 border-b border-zinc-100 flex items-center gap-4 h-[72px]">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-green to-[#2e4229] text-white rounded-[12px] flex items-center justify-center shadow-sm shadow-primary-green/20 shrink-0">
          <Store size={20} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-gray-900 tracking-tight text-lg leading-tight truncate">Al-Kautsar</span>
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest leading-none mt-1">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-6 overflow-y-auto scrollbar-hide">
        {navGroups.map((group, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <span className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{group.title}</span>
            {group.items.map((item) => {
              const active = isRouteActive(item.href);
              const Icon = item.icon;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className="relative group"
                >
                  {active && (
                    <motion.div 
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-secondary-cream/50 rounded-xl border border-secondary-green/20"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className={`relative px-3 py-2.5 flex items-center gap-3 rounded-xl transition-colors ${
                    active 
                      ? 'text-primary-green font-bold' 
                      : 'text-gray-500 font-medium hover:text-gray-900 hover:bg-gray-50'
                  }`}>
                    <Icon size={18} strokeWidth={active ? 2.5 : 2} className={active ? "text-primary-green" : "text-gray-400 group-hover:text-gray-600 transition-colors"} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Nav */}
      <div className="p-4 border-t border-zinc-100 flex flex-col gap-1.5 bg-gray-50/30">
        {adminRole === 'SUPERADMIN' && (
          <>
            <Link href="/admin/logs" className="relative group">
              {isRouteActive('/admin/logs') && (
                <motion.div 
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 bg-secondary-cream/50 rounded-xl border border-secondary-green/20"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={`relative px-3 py-2.5 flex items-center gap-3 rounded-xl transition-colors ${
                isRouteActive('/admin/logs')
                  ? 'text-primary-green font-bold' 
                  : 'text-gray-500 font-medium hover:text-gray-900 hover:bg-gray-50'
              }`}>
                <Activity size={18} strokeWidth={isRouteActive('/admin/logs') ? 2.5 : 2} className={isRouteActive('/admin/logs') ? "text-primary-green" : "text-gray-400 group-hover:text-gray-600 transition-colors"} />
                <span className="text-sm">Log Aktivitas</span>
              </div>
            </Link>
            
            <Link href="/admin/register-admin" className="relative group">
            {isRouteActive('/admin/register-admin') && (
              <motion.div 
                layoutId="activeNavIndicator"
                className="absolute inset-0 bg-secondary-cream/50 rounded-xl border border-secondary-green/20"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <div className={`relative px-3 py-2.5 flex items-center gap-3 rounded-xl transition-colors ${
              isRouteActive('/admin/register-admin')
                ? 'text-primary-green font-bold' 
                : 'text-gray-500 font-medium hover:text-gray-900 hover:bg-gray-50'
            }`}>
              <ShieldCheck size={18} strokeWidth={isRouteActive('/admin/register-admin') ? 2.5 : 2} className={isRouteActive('/admin/register-admin') ? "text-primary-green" : "text-gray-400 group-hover:text-gray-600 transition-colors"} />
              <span className="text-sm">Kelola Akses</span>
            </div>
          </Link>
          </>
        )}
        
        <Link href="/admin/settings" className="relative group">
          {isRouteActive('/admin/settings') && (
            <motion.div 
              layoutId="activeNavIndicator"
              className="absolute inset-0 bg-secondary-cream/50 rounded-xl border border-secondary-green/20"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <div className={`relative px-3 py-2.5 flex items-center gap-3 rounded-xl transition-colors ${
            isRouteActive('/admin/settings')
              ? 'text-primary-green font-bold' 
              : 'text-gray-500 font-medium hover:text-gray-900 hover:bg-gray-50'
          }`}>
            <Settings size={18} strokeWidth={isRouteActive('/admin/settings') ? 2.5 : 2} className={isRouteActive('/admin/settings') ? "text-primary-green" : "text-gray-400 group-hover:text-gray-600 transition-colors"} />
            <span className="text-sm">Pengaturan</span>
          </div>
        </Link>
        
        <form action={logoutAdmin} className="mt-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer border border-transparent hover:border-red-100">
            <LogOut size={18} strokeWidth={2} className="text-red-500" />
            <span>Keluar</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
