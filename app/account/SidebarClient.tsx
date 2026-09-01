'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Lock, Package, LogOut } from 'lucide-react';
import { logoutUser } from '@/app/actions/userAuth';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

const menuItems = [
  { href: '/account', label: 'Profil Saya', icon: User },
  { href: '/account/password', label: 'Ganti Kata Sandi', icon: Lock },
  { href: '/account/orders', label: 'Pesanan Saya', icon: Package },
];

export function SidebarClient() {
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-100 p-4 sticky top-24">
      <div className="flex flex-col gap-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
                isActive 
                  ? 'bg-primary-green/10 text-primary-green' 
                  : 'text-gray-600 hover:bg-zinc-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-primary-green' : 'text-gray-400'} />
              {item.label}
            </Link>
          );
        })}
        
        <div className="h-px w-full bg-zinc-100 my-2" />
        
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </div>
  );
}
