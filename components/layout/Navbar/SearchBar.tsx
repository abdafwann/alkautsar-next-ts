'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { searchProductsLive } from '@/app/actions/catalog';
import { SearchProduct } from './types';

interface SearchBarProps {
  className?: string;
}

/**
 * Search Bar Component
 * Features:
 * - Desktop and mobile variants
 * - Live search suggestions
 * - Debounced input
 * - Keyboard navigation
 */
export function SearchBar({ className }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      const res = await searchProductsLive(query);
      if (res.success && res.data) {
        setResults(res.data);
      } else {
        setResults([]);
      }
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleResultClick = () => {
    setShowDropdown(false);
    setQuery('');
  };

  return (
    <div className={className} ref={containerRef}>
      <form className="relative w-full" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim()) setShowDropdown(true);
          }}
          onFocus={() => {
            if (query.trim()) setShowDropdown(true);
          }}
          placeholder="Cari produk eksklusif..."
          className="w-full pl-0 pr-10 py-2 border-b border-zinc-200 bg-transparent focus:outline-none focus:border-text-main text-sm transition-all placeholder:text-text-main/40"
        />
        <button
          type="submit"
          className="absolute right-0 top-0 h-full text-text-main/40 hover:text-text-main transition-colors"
        >
          <MagnifyingGlass size={18} weight="duotone" />
        </button>

        {/* Search Dropdown Panel (Soft Floating Elevation & Rounded-2xl) */}
        {showDropdown && query.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.1)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150 py-1.5 border border-gray-100">
            {isSearching ? (
              <div className="p-4 text-center text-xs text-gray-400 animate-pulse font-medium">
                Mencari produk herbal...
              </div>
            ) : results.length > 0 ? (
              <div className="flex flex-col">
                <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-50">
                  Hasil Pencarian
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-emerald-50/60 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 relative border border-gray-100">
                        <Image
                          src={product.images?.[0]?.url || 'https://placehold.co/100'}
                          alt={product.title}
                          width={40}
                          height={40}
                          style={{ width: 'auto', height: 'auto' }}
                          className="max-h-full max-w-full object-contain p-0.5"
                        />
                      </div>
                      <div className="flex-grow min-w-0 flex justify-between items-center gap-2">
                        <h4 className="text-xs font-bold text-gray-900 truncate hover:text-[var(--color-primary-green)]">
                          {product.title}
                        </h4>
                        <span className="text-[10px] font-semibold text-[var(--color-primary-green)] bg-emerald-50 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0">
                          {product.category?.name || 'Herbal'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                  <button
                    type="submit"
                    className="w-full py-2 text-center text-xs text-[var(--color-primary-green)] hover:text-white font-bold bg-white hover:bg-[var(--color-primary-green)] rounded-xl border border-emerald-100 transition-all cursor-pointer shadow-2xs"
                  >
                    Lihat semua hasil untuk &ldquo;{query}&rdquo;
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-gray-500 font-medium">
                Tidak ada produk ditemukan
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
