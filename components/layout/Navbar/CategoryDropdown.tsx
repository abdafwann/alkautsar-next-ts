'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Category } from './types';

interface CategoryDropdownProps {
  categories: Category[];
  isOpen: boolean;
  onToggle: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}

export function CategoryDropdown({
  categories,
  isOpen,
  onToggle,
  onMouseEnter,
  onMouseLeave,
  onClose,
}: CategoryDropdownProps) {
  return (
    <div
      className="relative shrink-0"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        type="button"
        onClick={onToggle}
        className={`h-9 flex items-center gap-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
          isOpen
            ? 'text-[var(--color-primary-green)] bg-[var(--color-secondary-green)]'
            : 'text-gray-700 hover:text-[var(--color-primary-green)] hover:bg-[var(--color-secondary-green)]'
        }`}
      >
        <span>Kategori</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--color-primary-green)]' : 'text-gray-400'}`}
        />
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 top-full mt-2 w-56 bg-white shadow-[0_12px_36px_rgba(0,0,0,0.1)] rounded-2xl py-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="px-4 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1">
            Kategori Herbal
          </div>
          <div className="max-h-72 overflow-y-auto">
            {categories.length === 0 ? (
              <div className="py-4 text-center text-xs text-gray-400">
                Memuat kategori...
              </div>
            ) : (
              categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?categoryId=${cat.id}`}
                  onClick={onClose}
                  className="block px-4 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-[var(--color-primary-green)] transition-colors truncate"
                >
                  {cat.name}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
