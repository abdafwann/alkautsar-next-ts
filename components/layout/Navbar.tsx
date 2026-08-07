'use client';

import Link from 'next/link';
import { Search, Store, ShoppingCart, Heart, User, X, Trash2, LogIn, UserPlus, LogOut, Package, ChevronDown, Leaf, Pill, HeartPulse, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getAuthSession, logoutUser } from '@/app/actions/userAuth';
import { getDbCart } from '@/app/actions/cart';
import { getCategories } from '@/app/actions/category';
import { toast } from 'react-hot-toast';

export default function Navbar() {
  const pathname = usePathname();
  const cartItems = useCartStore((s) => s.items);
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const removeCartItem = useCartStore((s) => s.removeItem);

  const wishlistItems = useWishlistStore((s) => s.items);
  const removeWishlistItem = useWishlistStore((s) => s.removeItem);

  const [activeDropdown, setActiveDropdown] = useState<'cart' | 'wishlist' | 'profile' | 'category' | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [user, setUser] = useState<{ name: string, email: string } | null>(null);
  const [dbCategories, setDbCategories] = useState<{ id: string, name: string }[]>([]);
  const cartRef = useRef<HTMLDivElement>(null);
  const wishlistRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    setMounted(true);

    // Fetch categories
    getCategories().then(res => {
      if (res.success && res.data) {
        setDbCategories(res.data);
      }
    });

    getAuthSession().then((session) => {
      if (session) {
        setUser({ name: session.name, email: session.email });
        // Sync cart from DB on mount
        getDbCart().then(res => {
          if (res.success && res.data) {
            useCartStore.getState().setCart(res.data);
          }
          setIsSyncing(false);
        });
      } else {
        setIsSyncing(false);
      }
    });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        cartRef.current && !cartRef.current.contains(target) &&
        wishlistRef.current && !wishlistRef.current.contains(target) &&
        profileRef.current && !profileRef.current.contains(target) &&
        categoryRef.current && !categoryRef.current.contains(target)
      ) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (dropdown: 'cart' | 'wishlist' | 'profile' | 'category') => {
    setActiveDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  const handleMouseEnter = (dropdown: 'cart' | 'wishlist' | 'profile' | 'category') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  const handleLogout = async () => {
    await logoutUser();
    useCartStore.getState().clearCart();
    setUser(null);
    setActiveDropdown(null);
    toast.success('Berhasil keluar! Sampai jumpa lagi.');
    window.location.href = '/';
  };

  const totalItems = mounted ? getTotalItems() : 0;
  const totalPrice = mounted ? getTotalPrice() : 0;
  const wishlistCount = mounted ? wishlistItems.length : 0;
  const formattedTotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalPrice);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gray-50 text-gray-500 text-xs py-2 border-b border-gray-200 font-medium">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <span>PT. AL-KAUTSAR PERKASA INDONESIA</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-green-500">
              <i className="fab fa-whatsapp text-sm"></i>
              <span>0851238592344</span>
            </div>
            <div className="flex items-center gap-1.5">
              <i className="far fa-envelope text-sm"></i>
              <span>webkautsar@example.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* MainHeader */}
      <header className="bg-white py-4 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between gap-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 flex items-center justify-center text-accent-gold text-3xl">
              <i className="fas fa-mortar-pestle"></i>
            </div>
            <h1 className="font-bold text-gray-800 text-xl tracking-tight whitespace-nowrap">PT. AL-KAUTSAR</h1>
          </Link>

          {/* Search Bar */}
          <div className="flex-grow max-w-3xl">
            <div className="relative w-full">
              <input
                className="w-full pl-5 pr-12 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green text-sm"
                placeholder="Cari produk..."
                type="text"
              />
              <button className="absolute right-0 top-0 h-full px-4 text-gray-400 hover:text-primary-green transition-colors">
                <Search size={20} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-5 shrink-0 text-gray-600">
            {/* Category Dropdown */}
            <div
              className="relative"
              ref={categoryRef}
              onMouseEnter={() => handleMouseEnter('category')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => toggleDropdown('category')}
                className={`hover:text-primary-green transition-colors font-medium text-sm flex items-center gap-1.5 ${activeDropdown === 'category' ? 'text-primary-green' : ''}`}
              >
                Kategori
                <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'category' ? 'rotate-180' : ''}`} />
              </button>

              {activeDropdown === 'category' && (
                <div className="absolute left-0 top-full mt-6 w-[240px] bg-white shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col animate-slide-down">
                  <div className="flex flex-col max-h-[400px] overflow-y-auto custom-scrollbar">
                    {dbCategories.length === 0 ? (
                      <div className="py-8 text-center text-gray-400 text-sm animate-pulse">Memuat kategori...</div>
                    ) : (
                      dbCategories.map(cat => (
                        <Link
                          key={cat.id}
                          href={`/shop?categoryId=${cat.id}`}
                          onClick={() => setActiveDropdown(null)}
                          className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary-green transition-colors border-b border-gray-50 last:border-0"
                        >
                          {cat.name}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-gray-200 mx-1"></div>

            <Link className="hover:text-primary-green transition-colors" href="/shop">
              <Store size={22} strokeWidth={1.5} />
            </Link>

            <div className="h-6 w-px bg-gray-200 mx-1"></div>

            {/* Cart with Dropdown */}
            <div
              className="relative"
              ref={cartRef}
              onMouseEnter={() => handleMouseEnter('cart')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => toggleDropdown('cart')}
                className="relative hover:text-primary-green transition-colors"
              >
                <ShoppingCart size={22} strokeWidth={1.5} />
                {mounted && !isSyncing && totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-green text-white text-[10px] rounded-full h-[18px] w-[18px] flex items-center justify-center font-bold border-2 border-white">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>

              {activeDropdown === 'cart' && (
                <div className="absolute right-0 top-full mt-5 w-[360px] bg-white shadow-xl border border-gray-100 z-50 overflow-hidden animate-slide-down">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Keranjang ({totalItems})</h3>
                    <button
                      onClick={() => setActiveDropdown(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto">
                    {!mounted || isSyncing ? (
                      <div className="flex flex-col p-4 gap-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex items-center gap-3 animate-pulse">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg shrink-0"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-3.5 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : cartItems.length === 0 ? (
                      <div className="py-12 text-center">
                        <ShoppingCart size={40} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">Keranjang masih kosong</p>
                      </div>
                    ) : (
                      <div className="flex flex-col divide-y divide-gray-50">
                        {cartItems.slice(0, 4).map((item) => {
                          const itemTotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price * item.quantity);
                          return (
                            <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                <img src={item.imageUrl} alt={item.title} className="max-h-full object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                                <p className="text-xs text-gray-500">{item.quantity}x · <span className="text-primary-green font-bold">{itemTotal}</span></p>
                              </div>
                              <button
                                onClick={() => {
                                  removeCartItem(item.id);
                                  import('@/app/actions/cart').then(m => m.removeFromDbCart(item.id).catch(console.error));
                                }}
                                className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                        {cartItems.length > 4 && (
                          <div className="px-5 py-2 text-center text-xs text-gray-400">
                            +{cartItems.length - 4} produk lainnya
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {cartItems.length > 0 && (
                    <div className="border-t border-gray-100 px-5 py-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-500">Total</span>
                        <span className="text-lg font-bold text-primary-green">{formattedTotal}</span>
                      </div>
                      <Link
                        href="/cart"
                        onClick={() => setActiveDropdown(null)}
                        className="block w-full text-center bg-primary-green text-white font-bold rounded-xl py-3 hover:bg-primary-green-hover transition-colors text-sm"
                      >
                        Lihat Semua Keranjang
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-gray-200 mx-1"></div>

            {/* Wishlist with Dropdown */}
            <div
              className="relative"
              ref={wishlistRef}
              onMouseEnter={() => handleMouseEnter('wishlist')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => toggleDropdown('wishlist')}
                className="relative hover:text-primary-green transition-colors"
              >
                <Heart size={22} strokeWidth={1.5} />
                {mounted && !isSyncing && wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent-gold text-white text-[10px] rounded-full h-[18px] w-[18px] flex items-center justify-center font-bold border-2 border-white">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </button>

              {activeDropdown === 'wishlist' && (
                <div className="absolute right-0 top-full mt-5 w-[360px] bg-white shadow-xl border border-gray-100 z-50 overflow-hidden animate-slide-down">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Wishlist ({wishlistCount})</h3>
                    <button
                      onClick={() => setActiveDropdown(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto">
                    {!mounted || isSyncing ? (
                      <div className="flex flex-col p-4 gap-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex items-center gap-3 animate-pulse">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg shrink-0"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-3.5 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : wishlistItems.length === 0 ? (
                      <div className="py-12 text-center">
                        <Heart size={40} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">Wishlist masih kosong</p>
                      </div>
                    ) : (
                      <div className="flex flex-col divide-y divide-gray-50">
                        {wishlistItems.slice(0, 4).map((item) => {
                          const itemPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price);
                          return (
                            <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                              <Link href={`/product/${item.slug}`} onClick={() => setActiveDropdown(null)} className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                <img src={item.imageUrl} alt={item.title} className="max-h-full object-contain" />
                              </Link>
                              <div className="flex-1 min-w-0">
                                <Link href={`/product/${item.slug}`} onClick={() => setActiveDropdown(null)}>
                                  <p className="text-sm font-semibold text-gray-900 truncate hover:text-primary-green transition-colors">{item.title}</p>
                                </Link>
                                <p className="text-xs text-primary-green font-bold">{itemPrice}</p>
                              </div>
                              <button
                                onClick={() => removeWishlistItem(item.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                        {wishlistItems.length > 4 && (
                          <div className="px-5 py-2 text-center text-xs text-gray-400">
                            +{wishlistItems.length - 4} produk lainnya
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {wishlistItems.length > 0 && (
                    <div className="border-t border-gray-100 px-5 py-4">
                      <Link
                        href="/wishlist"
                        onClick={() => setActiveDropdown(null)}
                        className="block w-full text-center bg-accent-gold text-white font-bold rounded-xl py-3 hover:opacity-90 transition-colors text-sm"
                      >
                        Lihat Semua Wishlist
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-gray-200 mx-1"></div>

            {/* Profile Dropdown */}
            <div
              className="relative"
              ref={profileRef}
              onMouseEnter={() => handleMouseEnter('profile')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => toggleDropdown('profile')}
                className="relative hover:text-primary-green transition-colors text-accent-gold flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-gray-50 overflow-hidden"
              >
                {user ? (
                  <span className="font-bold text-sm text-primary-green">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User size={20} strokeWidth={1.5} className="text-gray-400" />
                )}
              </button>

              {activeDropdown === 'profile' && (
                <div className="absolute right-0 top-full mt-5 w-[240px] bg-white shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col animate-slide-down">
                  {user ? (
                    <>
                      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          href="/profile"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary-green transition-colors"
                        >
                          <User size={16} />
                          Profil Saya
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary-green transition-colors"
                        >
                          <Package size={16} />
                          Pesanan Saya
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 py-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-5 py-2.5 text-sm text-red-500 hover:bg-red-50 text-left transition-colors font-medium"
                        >
                          <LogOut size={16} />
                          Keluar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-3.5 border-b border-gray-100 bg-gradient-to-br from-green-50 to-emerald-50/30">
                        <p className="text-sm font-bold text-gray-900">Selamat Datang!</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">Masuk untuk menikmati pengalaman belanja yang maksimal.</p>
                      </div>
                      <div className="p-3 space-y-2">
                        <Link
                          href="/login"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center justify-center gap-2 w-full bg-primary-green text-white font-bold rounded-lg py-2 hover:bg-primary-green-hover transition-colors text-sm shadow-sm"
                        >
                          <LogIn size={16} />
                          Masuk
                        </Link>
                        <div className="relative flex items-center py-1.5">
                          <div className="flex-grow border-t border-gray-100"></div>
                          <span className="flex-shrink-0 mx-3 text-[10px] text-gray-400 font-medium uppercase tracking-wider">Atau</span>
                          <div className="flex-grow border-t border-gray-100"></div>
                        </div>
                        <Link
                          href="/register"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center justify-center gap-2 w-full bg-white text-primary-green border border-primary-green font-bold rounded-lg py-2 hover:bg-green-50 transition-colors text-sm"
                        >
                          <UserPlus size={16} />
                          Daftar Akun
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
