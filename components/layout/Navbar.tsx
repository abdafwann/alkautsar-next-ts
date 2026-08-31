'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Store, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { getAuthSession, logoutUser } from '@/app/actions/userAuth';
import { getDbCart } from '@/app/actions/cart';
import { getCategories } from '@/app/actions/category';

import {
  Logo,
  SearchBar,
  CategoryDropdown,
  CartDropdown,
  WishlistDropdown,
  ProfileDropdown,
  MobileMenu,
  Category,
  User,
  DropdownType,
} from './Navbar/index';

/**
 * Main Navbar Orchestrator.
 * Hierarchical order: Kategori -> Shop -> Artikel -> Cart -> Wishlist -> Profile.
 * Fully stabilized layout to prevent any jitter or layout shifts on hover.
 */
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch categories and user session on mount
  useEffect(() => {
    if (pathname.startsWith('/admin')) return;

    getCategories().then((res) => {
      if (res.success && res.data) {
        setCategories(res.data);
      }
    });

    getAuthSession().then((session) => {
      if (session) {
        setUser({ name: session.name, email: session.email });
        getDbCart().then((res) => {
          if (res.success && res.data) {
            useCartStore.getState().setCart(res.data);
          }
          setIsSyncing(false);
        });
      } else {
        setIsSyncing(false);
      }
    });
  }, [pathname]);

  const toggleDropdown = (dropdown: 'category' | 'cart' | 'wishlist' | 'profile') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  const handleMouseEnter = (dropdown: 'category' | 'cart' | 'wishlist' | 'profile') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const handleLogout = async () => {
    await logoutUser();
    useCartStore.getState().clearCart();
    setUser(null);
    setActiveDropdown(null);
    toast.success('Berhasil keluar!');
    router.push('/');
    router.refresh();
  };

  // Skip rendering standard navbar on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 gap-3 lg:gap-6">
          
          {/* 1. Brand Logo (Fixed Shrink-0) */}
          <div className="shrink-0">
            <Logo />
          </div>

          {/* 2. Live Search Input (Desktop - Stabilized Width) */}
          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-2">
            <SearchBar className="w-full" />
          </div>

          {/* 3. Desktop Navigation & Action Icons (Shrink-0 to prevent layout shifts) */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1.5 shrink-0">
            
            {/* 1. Kategori Dropdown */}
            <CategoryDropdown
              categories={categories}
              isOpen={activeDropdown === 'category'}
              onToggle={() => toggleDropdown('category')}
              onMouseEnter={() => handleMouseEnter('category')}
              onMouseLeave={handleMouseLeave}
              onClose={() => setActiveDropdown(null)}
            />

            {/* 2. Shop Link */}
            <Link
              href="/shop"
              className={`h-9 flex items-center gap-1.5 px-3 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                pathname === '/shop'
                  ? 'text-[var(--color-primary-green)] bg-[var(--color-secondary-green)]'
                  : 'text-gray-700 hover:text-[var(--color-primary-green)] hover:bg-[var(--color-secondary-green)]'
              }`}
            >
              <Store size={15} />
              <span>Shop</span>
            </Link>

            {/* 3. Artikel Link */}
            <Link
              href="/blog"
              className={`h-9 flex items-center gap-1.5 px-3 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                pathname.startsWith('/blog')
                  ? 'text-[var(--color-primary-green)] bg-[var(--color-secondary-green)]'
                  : 'text-gray-700 hover:text-[var(--color-primary-green)] hover:bg-[var(--color-secondary-green)]'
              }`}
            >
              <BookOpen size={15} />
              <span>Artikel</span>
            </Link>

            {/* Visual Divider Between Navigation & Shopper Actions */}
            <div className="h-5 w-px bg-gray-200 mx-1 shrink-0" />

            {/* 4. Shopping Cart Dropdown */}
            <CartDropdown
              isOpen={activeDropdown === 'cart'}
              onToggle={() => toggleDropdown('cart')}
              onMouseEnter={() => handleMouseEnter('cart')}
              onMouseLeave={handleMouseLeave}
              onClose={() => setActiveDropdown(null)}
              isSyncing={isSyncing}
            />

            {/* 5. Wishlist Dropdown */}
            <WishlistDropdown
              isOpen={activeDropdown === 'wishlist'}
              onToggle={() => toggleDropdown('wishlist')}
              onMouseEnter={() => handleMouseEnter('wishlist')}
              onMouseLeave={handleMouseLeave}
              onClose={() => setActiveDropdown(null)}
              isSyncing={isSyncing}
            />

            {/* Visual Divider Before Profile */}
            <div className="h-5 w-px bg-gray-200 mx-1 shrink-0" />

            {/* 6. Profile / Tombol Masuk Dropdown */}
            <ProfileDropdown
              isOpen={activeDropdown === 'profile'}
              onToggle={() => toggleDropdown('profile')}
              onMouseEnter={() => handleMouseEnter('profile')}
              onMouseLeave={handleMouseLeave}
              onClose={() => setActiveDropdown(null)}
              user={user}
              onLogout={handleLogout}
            />
          </nav>

          {/* 4. Mobile Actions (Hamburger & Search) */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Buka Menu"
            >
              <Menu size={22} />
            </button>
          </div>

        </div>
      </div>

      {/* 5. Mobile Slide-out Drawer */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        categories={categories}
        user={user}
        onLogout={handleLogout}
        searchQuery={mobileSearchQuery}
        setSearchQuery={setMobileSearchQuery}
      />
    </header>
  );
}
