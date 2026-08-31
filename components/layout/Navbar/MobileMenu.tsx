'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { X, Search, Store, BookOpen, Heart, Package, User } from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { Category, User as UserType } from './types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  user: UserType | null;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
      {children}
    </div>
  );
}

interface MobileNavLinkProps {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  badge?: number;
  onClick?: () => void;
}

function MobileNavLink({
  href,
  icon,
  children,
  badge,
  onClick,
}: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 last:border-0"
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-400">{icon}</span>
        <span>{children}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="bg-primary-green text-white text-[10px] rounded-full px-2 py-0.5">
          {badge}
        </span>
      )}
    </Link>
  );
}

function MobileSearchBar({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="p-4 border-b border-gray-100">
      <form
        className="relative w-full"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cari produk..."
          className="w-full pl-4 pr-10 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green text-sm"
        />
        <button
          type="submit"
          className="absolute right-0 top-0 h-full px-4 text-gray-400"
        >
          <Search size={18} strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}

function MobileAuthSection({
  user,
  onLogout,
  onClose,
}: {
  user: UserType | null;
  onLogout: () => void;
  onClose: () => void;
}) {
  if (user) {
    return (
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-primary-green/10 rounded-full flex items-center justify-center text-primary-green">
            <User size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
            <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/account"
            onClick={onClose}
            className="flex-1 text-center py-2 text-sm text-gray-700 border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
          >
            Profil Saya
          </Link>
          <button
            onClick={onLogout}
            className="flex-1 text-center py-2 text-sm text-red-500 font-medium hover:bg-red-50 rounded-lg"
          >
            Keluar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
      <div className="flex gap-2">
        <Link
          href="/login"
          onClick={onClose}
          className="flex-1 text-center py-2 text-sm bg-primary-green text-white font-bold rounded-lg shadow-sm"
        >
          Masuk
        </Link>
        <Link
          href="/register"
          onClick={onClose}
          className="flex-1 text-center py-2 text-sm text-primary-green border border-primary-green font-bold rounded-lg bg-white"
        >
          Daftar
        </Link>
      </div>
    </div>
  );
}

/**
 * Mobile Menu Component
 * Full-screen slide-out menu for mobile devices
 */
export function MobileMenu({
  isOpen,
  onClose,
  categories,
  user,
  onLogout,
  searchQuery,
  setSearchQuery,
}: MobileMenuProps) {
  const router = useRouter();
  const wishlistItems = useWishlistStore((s) => s.items);
  const cartItems = useCartStore((s) => s.items);

  if (!isOpen) return null;

  const handleSearchSubmit = () => {
    onClose();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end md:hidden">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl flex flex-col overflow-hidden ml-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2 text-accent-gold font-bold">
            <i className="fas fa-mortar-pestle text-xl"></i> PT. AL-KAUTSAR
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 bg-white rounded-full shadow-sm border border-gray-100"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Search */}
        <MobileSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSearchSubmit}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Main Menu */}
          <div className="py-2">
            <SectionHeader>Menu Utama</SectionHeader>
            <MobileNavLink href="/shop" icon={<Store size={18} />}>
              Semua Produk
            </MobileNavLink>
            <MobileNavLink href="/blog" icon={<BookOpen size={18} />}>
              Blog & Informasi
            </MobileNavLink>
            <MobileNavLink
              href="/wishlist"
              icon={<Heart size={18} />}
              badge={wishlistItems.length}
            >
              Wishlist
            </MobileNavLink>
            <MobileNavLink href="/track-order" icon={<Package size={18} />}>
              Lacak Pesanan
            </MobileNavLink>
          </div>

          {/* Categories */}
          <div className="py-2">
            <SectionHeader>Kategori</SectionHeader>
            {categories.map((cat) => (
              <MobileNavLink
                key={cat.id}
                href={`/shop?categoryId=${cat.id}`}
                onClick={onClose}
              >
                {cat.name}
              </MobileNavLink>
            ))}
          </div>
        </div>

        {/* Auth Section */}
        <MobileAuthSection user={user} onLogout={onLogout} onClose={onClose} />
      </div>
    </div>
  );
}
