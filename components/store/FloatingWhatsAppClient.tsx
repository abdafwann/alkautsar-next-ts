'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FloatingWhatsAppClient({ 
  whatsappNumber 
}: { 
  whatsappNumber?: string | null 
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid SSR hydration issues
  if (!mounted) return null;

  // Do not show in admin panel or auth pages
  if (
    !pathname ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password')
  ) {
    return null;
  }

  if (!whatsappNumber) return null;

  // Format valid Indonesian phone number to international 62 format
  let cleanNumber = whatsappNumber.replace(/\D/g, '');
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '62' + cleanNumber.substring(1);
  } else if (!cleanNumber.startsWith('62')) {
    cleanNumber = '62' + cleanNumber;
  }

  const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    'Halo Admin Al-Kautsar, saya ingin bertanya dan konsultasi mengenai produk herbal.'
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center group">
      {/* Sleek Tooltip */}
      <span className="hidden sm:inline-block absolute right-full mr-3 px-3 py-1.5 bg-[#0e2417] text-white text-xs font-semibold rounded-xl shadow-lg opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap border border-white/10">
        Konsultasi WhatsApp
      </span>

      {/* Floating Action Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Konsultasi langsung via WhatsApp"
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 hover:scale-105 active:scale-95 transition-all duration-200"
      >
        {/* Official WhatsApp Vector SVG */}
        <svg 
          width="28" 
          height="28" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-white fill-current"
        >
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.05 21.45a.75.75 0 0 0 .922.923l4.382-1.378A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Zm-3.85 6.3a.75.75 0 0 0-1.06 0l-.38.38a2.31 2.31 0 0 0-.6 1.768c.112 1.636.93 3.328 2.33 4.728 1.4 1.4 3.092 2.218 4.728 2.33a2.31 2.31 0 0 0 1.768-.6l.38-.38a.75.75 0 0 0 0-1.06l-1.5-1.5a.75.75 0 0 0-1.06 0l-.5.5a.75.75 0 0 1-.772.164 6.74 6.74 0 0 1-2.58-1.602 6.74 6.74 0 0 1-1.602-2.58.75.75 0 0 1 .164-.772l.5-.5a.75.75 0 0 0 0-1.06l-1.5-1.5Z" 
          />
        </svg>
      </a>
    </div>
  );
}
