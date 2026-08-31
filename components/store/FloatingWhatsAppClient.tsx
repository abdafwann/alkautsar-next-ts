'use client';

import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function FloatingWhatsAppClient({ whatsappNumber }: { whatsappNumber?: string | null }) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  // Animasi pop in setelah halaman termuat
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Jangan tampilkan di area admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  if (!whatsappNumber) return null;

  // Pastikan nomor diawali dengan 62
  let formattedNumber = whatsappNumber.replace(/\D/g, '');
  if (formattedNumber.startsWith('0')) {
    formattedNumber = '62' + formattedNumber.substring(1);
  }

  const waLink = `https://wa.me/${formattedNumber}?text=Halo%20Admin%20Al-Kautsar,%20saya%20ingin%20bertanya%20tentang%20produk%20di%20toko%20Anda.`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg shadow-green-500/40 hover:bg-green-600 hover:scale-110 transition-all duration-300 group ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
      aria-label="Hubungi kami via WhatsApp"
    >
      {/* Tooltip */}
      <span className="absolute right-16 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 group-hover:-translate-x-2 transition-all duration-300 whitespace-nowrap pointer-events-none">
        Butuh Bantuan?
        {/* Panah tooltip */}
        <span className="absolute top-1/2 -right-1 -translate-y-1/2 border-[5px] border-transparent border-l-gray-900"></span>
      </span>
      
      <MessageCircle size={32} />
      
      {/* Subtle constant glow */}
      <span className="absolute w-full h-full rounded-full bg-green-500 blur-sm opacity-50 -z-10 group-hover:animate-pulse"></span>
      <span className="absolute w-full h-full rounded-full bg-green-400 opacity-20 animate-ping -z-20"></span>
    </a>
  );
}
