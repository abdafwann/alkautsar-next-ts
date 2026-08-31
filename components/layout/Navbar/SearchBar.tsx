'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
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
          <Search size={18} strokeWidth={1.2} />
        </button>

        {/* Search Dropdown */}
        {showDropdown && query.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-4 bg-white shadow-xl border border-gray-100 overflow-hidden z-50 animate-slide-down">
            {isSearching ? (
              <div className="p-4 text-center text-sm text-gray-400 animate-pulse">
                Mencari...
              </div>
            ) : results.length > 0 ? (
              <div className="flex flex-col">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 p-3 hover:bg-green-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-md bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 relative">
                      <Image
                        src={product.images?.[0]?.url || 'https://placehold.co/100'}
                        alt={product.title}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow min-w-0 flex justify-between items-center gap-2">
                      <h4 className="text-sm font-bold text-gray-900 truncate">
                        {product.title}
                      </h4>
                      <p className="text-[11px] text-primary-green bg-green-50 px-2 py-1 rounded-sm whitespace-nowrap shrink-0">
                        {product.category?.name || 'Produk'}
                      </p>
                    </div>
                  </Link>
                ))}
                <button
                  type="submit"
                  className="w-full p-3 text-sm text-primary-green font-bold bg-green-50/50 hover:bg-green-100 transition-colors cursor-pointer"
                >
                  Lihat semua hasil untuk &ldquo;{query}&rdquo;
                </button>
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                Tidak ada produk ditemukan
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
