'use client';

import Link from 'next/link';
import { User, Package, LogOut, LogIn, UserPlus, FileSearch, ChevronDown } from 'lucide-react';
import { User as UserType } from './types';

interface ProfileDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
  user: UserType | null;
  onLogout: () => void;
}

/**
 * Profile & Authentication Control (Borderless, Minimalist & Clean).
 */
export function ProfileDropdown({
  isOpen,
  onToggle,
  onMouseEnter,
  onMouseLeave,
  onClose,
  user,
  onLogout,
}: ProfileDropdownProps) {
  return (
    <div
      className="relative shrink-0"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Trigger Button: Borderless Clean Masuk Button or Member Pill */}
      {user ? (
        <button
          type="button"
          onClick={onToggle}
          className={`h-9 flex items-center gap-2 pl-1.5 pr-2.5 rounded-full transition-colors cursor-pointer ${
            isOpen
              ? 'bg-emerald-50 text-[var(--color-primary-green)]'
              : 'bg-gray-50 hover:bg-emerald-50/60 text-gray-800'
          }`}
          title={`Akun: ${user.name}`}
          aria-label="Menu Profil"
        >
          <div className="w-6 h-6 rounded-full bg-[var(--color-primary-green)] text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-bold truncate max-w-[90px]">{user.name.split(' ')[0]}</span>
          <ChevronDown 
            size={13} 
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--color-primary-green)]' : ''}`} 
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          className={`h-9 flex items-center gap-1.5 px-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            isOpen
              ? 'bg-[var(--color-primary-green)] text-white shadow-xs'
              : 'bg-emerald-50 hover:bg-emerald-100/80 text-[var(--color-primary-green)]'
          }`}
          title="Masuk ke Akun"
          aria-label="Masuk ke Akun"
        >
          <LogIn size={14} />
          <span>Masuk</span>
        </button>
      )}

      {/* Dropdown Panel: Soft Floating Elevation, No Harsh Outer Border */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-[260px] bg-white rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.1)] py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 flex flex-col before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {user ? (
            <>
              {/* User Header */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60">
                <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">{user.email}</p>
              </div>

              {/* Navigation Links */}
              <div className="py-1.5">
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-[var(--color-primary-green)] transition-colors"
                >
                  <User size={15} />
                  <span>Profil Saya</span>
                </Link>
                <Link
                  href="/orders"
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-[var(--color-primary-green)] transition-colors"
                >
                  <Package size={15} />
                  <span>Pesanan Saya</span>
                </Link>
              </div>

              {/* Logout Button */}
              <div className="border-t border-gray-100 pt-1.5">
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 text-left transition-colors cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Keluar</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Guest Greeting */}
              <div className="px-4 py-3 border-b border-gray-100 bg-[#f8fafc]">
                <p className="text-xs font-bold text-gray-900">Selamat Datang!</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                  Masuk atau buat akun untuk kemudahan belanja & tracking obat herbal.
                </p>
              </div>

              {/* Guest Actions */}
              <div className="p-3 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 w-full bg-[var(--color-primary-green)] hover:bg-[var(--color-primary-green-hover)] text-white text-xs font-bold py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  <LogIn size={14} />
                  <span>Masuk Sekarang</span>
                </Link>

                <Link
                  href="/register"
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 w-full bg-emerald-50 hover:bg-emerald-100 text-[var(--color-primary-green)] text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <UserPlus size={14} />
                  <span>Daftar Akun Baru</span>
                </Link>

                <div className="border-t border-gray-100 my-0.5" />

                <Link
                  href="/track-order"
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 w-full bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  <FileSearch size={14} />
                  <span>Lacak Pesanan Cepat</span>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
