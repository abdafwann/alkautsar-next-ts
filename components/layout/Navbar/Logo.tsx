'use client';

import Link from 'next/link';
import Image from 'next/image';

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
export function Logo({ storeName, logoUrl }: LogoProps) {
  // Brand title di navbar menggunakan nama brand ringkas "AL Kautsar"
  const displayName = 'AL Kautsar';

  return (
    <Link 
      href="/" 
      className="flex items-center gap-3 shrink-0 group py-1"
      aria-label={displayName}
    >
      {/* Brand Icon / Logo Emblem */}
      {logoUrl ? (
        <div className="h-10 max-h-10 flex items-center shrink-0">
          <Image 
            src={logoUrl} 
            alt={displayName} 
            width={140}
            height={36}
            priority
            className="h-9 w-auto max-w-[150px] object-contain group-hover:scale-103 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 via-[#f0f9f4] to-[#e8f5e9] border border-emerald-200/70 flex items-center justify-center shrink-0 shadow-2xs group-hover:shadow-xs group-hover:border-[#00AA5B]/60 transition-all duration-300">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 40 40" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="text-[#00AA5B] group-hover:scale-110 transition-transform duration-300 drop-shadow-2xs"
          >
            <path 
              d="M20 4C20 4 10 12 10 22C10 27.5228 14.4772 32 20 32C25.5228 32 30 27.5228 30 22C30 12 20 4 20 4Z" 
              fill="currentColor" 
              fillOpacity="0.2"
            />
            <path 
              d="M20 4C20 4 10 12 10 22C10 27.5228 14.4772 32 20 32C25.5228 32 30 27.5228 30 22C30 12 20 4 20 4Z" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M20 32V20" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round"
            />
            <path 
              d="M16 24C16 24 17.5 27 20 27C22.5 27 24 24 24 24" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/* Brand Title & Tagline - TasteSkill v2 Centered Heritage Typography */}
      <div className="flex flex-col items-center justify-center text-center select-none">
        {/* Top: Al-Kautsar centered */}
        <span className="font-[family-name:var(--font-serif)] text-[23px] sm:text-[25px] font-black italic tracking-tight text-[#122b1c] group-hover:text-[#00AA5B] transition-colors leading-none">
          Al-Kautsar
        </span>

        {/* Bottom: Tagline centered */}
        <span className="text-[7.5px] sm:text-[8px] tracking-[0.06em] uppercase font-bold text-[#00AA5B] mt-1 whitespace-nowrap leading-none">
          Indonesian Traditional Herbal Medicine
        </span>
      </div>
    </Link>
  );
}
