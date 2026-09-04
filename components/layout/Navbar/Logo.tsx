'use client';

import Link from 'next/link';

interface LogoProps {
  storeName?: string | null;
  logoUrl?: string | null;
}

/**
 * Brand Logo Component.
 * Supports custom uploaded brand logo from Admin Settings,
 * with graceful fallback to the signature botanical leaf emblem.
 * Features redesigned tagline: "Indonesian Traditional Herbal Medicine"
 */
export function Logo({ storeName: _ }: LogoProps) {
  return (
    <Link 
      href="/" 
      className="flex flex-col items-center justify-center text-center select-none shrink-0 group py-0.5"
      aria-label="Al-Kautsar Indonesian Traditional Herbal Medicine"
    >
      {/* Primary Brand Wordmark */}
      <span className="font-serif text-[23px] sm:text-[26px] font-bold tracking-tight text-[#122b1c] group-hover:text-[#00AA5B] transition-colors leading-tight">
        Al-Kautsar
      </span>

      {/* Editorial Heritage Apothecary Tagline (Centered & Letterspaced) */}
      <span className="text-[7.5px] sm:text-[8px] tracking-[0.2em] uppercase font-bold text-[#8B5A2B] group-hover:text-[#00AA5B] transition-colors mt-0.5 whitespace-nowrap">
        Indonesian Traditional Herbal Medicine
      </span>
    </Link>
  );
}
