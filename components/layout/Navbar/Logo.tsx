'use client';

import Link from 'next/link';

interface LogoProps {
  storeName?: string;
}

/**
 * Brand Logo Component.
 * Features botanical leaf emblem and gradient branding.
 */
export function Logo({ storeName = 'AL Kautsar' }: LogoProps) {
  return (
    <Link href="/" className="flex items-center gap-3 shrink-0 group">
      <div className="w-9 h-9 flex items-center justify-center">
        <svg 
          width="36" 
          height="36" 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="text-[var(--color-primary-green)] group-hover:scale-105 transition-transform duration-300"
        >
          <path d="M20 4C20 4 10 12 10 22C10 27.5228 14.4772 32 20 32C25.5228 32 30 27.5228 30 22C30 12 20 4 20 4Z" fill="currentColor" fillOpacity="0.15"/>
          <path d="M20 4C20 4 10 12 10 22C10 27.5228 14.4772 32 20 32C25.5228 32 30 27.5228 30 22C30 12 20 4 20 4Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 32V20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M16 24C16 24 17.5 27 20 27C22.5 27 24 24 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-[var(--color-primary-green)] to-[var(--color-dark-green)] bg-clip-text text-transparent">
          {storeName}
        </span>
        <span className="text-[9px] tracking-[0.15em] uppercase text-gray-400 font-medium">
          Herbal Indonesia
        </span>
      </div>
    </Link>
  );
}
