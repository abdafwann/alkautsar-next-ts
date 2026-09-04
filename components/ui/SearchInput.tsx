'use client';

import { MagnifyingGlass } from '@phosphor-icons/react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Cari...',
  className = '',
}: SearchInputProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-main/40">
        <MagnifyingGlass size={16} weight="duotone" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50/60 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green sm:text-xs transition-all shadow-2xs"
      />
    </div>
  );
}
