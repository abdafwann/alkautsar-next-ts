'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, LockKey, Package, SignOut, ShieldCheck } from '@phosphor-icons/react';
import { logoutUser } from '@/app/actions/userAuth';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

const menuItems = [
  { href: '/account', label: 'Profil Saya', icon: User },
  { href: '/account/password', label: 'Ganti Kata Sandi', icon: LockKey },
  { href: '/account/orders', label: 'Pesanan Saya', icon: Package },
];

interface SidebarClientProps {
  user?: {
    name: string;
    email: string;
  };
}

export function SidebarClient({ user }: SidebarClientProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logoutUser();
      useCartStore.getState().clearCart();
      useWishlistStore.getState().clearWishlist();
      toast.success('Berhasil keluar akun.');
      window.location.href = '/login';
    } catch (error) {
      toast.error('Gagal keluar akun.');
    }
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'A';

  return (
    <div className="bg-white rounded-2xl shadow-2xs border border-[#ede8de] overflow-hidden sticky top-24">
      {/* Member Identity Header Card */}
      <div className="p-5 bg-[#faf8f4] border-b border-[#ede8de]/80 flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-full bg-dark-green text-white font-serif font-bold text-lg flex items-center justify-center shrink-0 shadow-xs border border-emerald-900/10">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="font-serif font-bold text-sm text-text-main truncate">
              {user?.name || 'Pelanggan'}
            </h3>
            <ShieldCheck size={14} weight="fill" className="text-primary-green shrink-0" />
          </div>
          <p className="text-[11px] text-text-main/60 truncate mb-1">
            {user?.email || 'Akun Terdaftar'}
          </p>
          <span className="inline-block text-[10px] font-bold text-dark-green bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Member Al-Kautsar
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="p-3 flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors text-xs select-none ${
                isActive 
                  ? 'bg-emerald-50 text-dark-green font-bold shadow-2xs' 
                  : 'text-text-main/75 hover:bg-[#faf7f2] hover:text-text-main'
              }`}
            >
              <Icon 
                size={18} 
                weight={isActive ? 'bold' : 'duotone'} 
                className={isActive ? 'text-primary-green' : 'text-text-main/50'} 
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
        
        <div className="h-px w-full bg-[#ede8de]/70 my-1.5" />
        
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer active:scale-[0.98]"
        >
          <SignOut size={18} weight="duotone" className="text-rose-500" />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </div>
  );
}
