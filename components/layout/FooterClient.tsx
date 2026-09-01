'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MapPin, Mail, Phone, ArrowRight } from 'lucide-react';

interface StoreSettings {
  storeName: string;
  description: string | null;
  address: string | null;
  email: string | null;
  whatsapp: string | null;
  logoUrl?: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
}

export default function FooterClient({ settings }: { settings: StoreSettings }) {
  const pathname = usePathname();
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  // Fallbacks
  const storeName = settings?.storeName || 'PT. AL-KAUTSAR';
  const logoUrl = settings?.logoUrl;
  const description = settings?.description || 'Menyediakan akses ke obat alami, herbal, dan tradisional berstandar resmi BPOM untuk kebugaran keseharian Anda.';
  const address = settings?.address || 'Jl. Herbal Alami No. 123\nJakarta Selatan, 12345';
  const email = settings?.email || 'hello@alkautsar.com';
  const phone = settings?.whatsapp || '+62 811 2345 6789';

  return (
    <footer className="bg-[#122b1c] text-white py-16 md:py-24 border-t-4 border-primary-green">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Contact Column */}
          <div className="lg:col-span-4 lg:pr-12">
            <h4 className="text-xl font-heading font-extrabold mb-6 tracking-tight flex items-center gap-2.5 text-white">
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="h-8 w-auto max-w-[140px] object-contain brightness-0 invert" />
              ) : (
                <i className="fas fa-leaf text-primary-green text-lg"></i>
              )}
              <span>{storeName}</span>
            </h4>
            <p className="text-sm text-gray-300 mb-8 leading-relaxed whitespace-pre-line max-w-sm">
              {description}
            </p>
            
            <div className="space-y-4 text-sm text-gray-300 font-medium">
              <div className="flex items-start gap-4">
                <MapPin size={16} strokeWidth={1.5} className="text-primary-green shrink-0 mt-0.5" />
                <span className="whitespace-pre-line leading-relaxed">{address}</span>
              </div>
              <div className="flex items-center gap-4">
                <Phone size={16} strokeWidth={1.5} className="text-primary-green shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-4">
                <Mail size={16} strokeWidth={1.5} className="text-primary-green shrink-0" />
                <span>{email}</span>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-2">
            <h4 className="text-xs uppercase tracking-widest font-bold mb-6 text-gray-400">Eksplor</h4>
            <ul className="space-y-4 text-sm text-gray-300 font-medium">
              <li><Link className="hover:text-primary-green transition-colors duration-200" href="/shop">Katalog Belanja</Link></li>
              <li><Link className="hover:text-primary-green transition-colors duration-200" href="/blog">Artikel Kesehatan</Link></li>
              <li><Link className="hover:text-primary-green transition-colors duration-200" href="/">Tentang Kami</Link></li>
              <li><Link className="hover:text-primary-green transition-colors duration-200" href="/">Kontak & Bantuan</Link></li>
            </ul>
          </div>

          {/* Customer Service Column */}
          <div className="lg:col-span-2">
            <h4 className="text-xs uppercase tracking-widest font-bold mb-6 text-gray-400">Layanan</h4>
            <ul className="space-y-4 text-sm text-gray-300 font-medium">
              <li><Link className="hover:text-primary-green transition-colors duration-200" href="/track-order">Lacak Pesanan</Link></li>
              <li><Link className="hover:text-primary-green transition-colors duration-200" href="/shipping-policy">Info Pengiriman</Link></li>
              <li><Link className="hover:text-primary-green transition-colors duration-200" href="/return-policy">Garansi & Retur</Link></li>
              <li><Link className="hover:text-primary-green transition-colors duration-200" href="/privacy-policy">Kebijakan Privasi</Link></li>
            </ul>
          </div>

          {/* Newsletter & Certification Column */}
          <div className="lg:col-span-4">
            <h4 className="text-xs uppercase tracking-widest font-bold mb-6 text-gray-400">Newsletter</h4>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              Dapatkan edukasi kesehatan herbal dan penawaran eksklusif Al-Kautsar.
            </p>
            <form className="flex flex-col gap-3">
              <div className="relative">
                <input 
                  className="w-full pl-4 pr-12 py-3 bg-white/10 border border-white/20 text-white placeholder:text-gray-400 rounded-full focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green transition-all text-sm" 
                  placeholder="Alamat email Anda" 
                  type="email" 
                  required
                />
                <button 
                  className="absolute right-1 top-1 bottom-1 aspect-square bg-primary-green text-white rounded-full flex items-center justify-center hover:bg-primary-green-hover transition-colors" 
                  type="submit"
                  aria-label="Subscribe"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>

            {/* High-Contrast Official Certification Badges */}
            <div className="mt-8">
              <h4 className="text-xs uppercase tracking-widest font-bold mb-4 text-gray-400">Sertifikasi Resmi</h4>
              <div className="flex items-center gap-3">
                {/* Logo BPOM */}
                <div 
                  className="group w-14 h-14 bg-white rounded-xl flex items-center justify-center p-2 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                  title="Sertifikasi Resmi BPOM Republik Indonesia"
                >
                  <img
                    src="/BPOM Logo - Colored - zonalogo.com.svg"
                    alt="Sertifikasi BPOM RI"
                    className="w-auto max-h-7 object-contain transition-transform duration-300 ease-out group-hover:scale-115"
                  />
                </div>

                {/* Logo Halal Indonesia */}
                <div 
                  className="group w-14 h-14 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                  title="Sertifikasi Resmi Halal Indonesia - BPJPH Kemenag"
                >
                  <img
                    src="/Halal Indonesia Logo - Colored - zonalogo.com.svg"
                    alt="Sertifikasi Halal Indonesia"
                    className="w-auto max-h-9 object-contain transition-transform duration-300 ease-out group-hover:scale-115"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="mt-8 flex gap-3">
              {settings?.facebook && (
                <Link href={settings.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-primary-green hover:text-white transition-all duration-300 active:scale-[0.95]" aria-label="Facebook">
                  <i className="fab fa-facebook-f text-sm"></i>
                </Link>
              )}
              {settings?.instagram && (
                <Link href={settings.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-primary-green hover:text-white transition-all duration-300 active:scale-[0.95]" aria-label="Instagram">
                  <i className="fab fa-instagram text-sm"></i>
                </Link>
              )}
              {settings?.twitter && (
                <Link href={settings.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-primary-green hover:text-white transition-all duration-300 active:scale-[0.95]" aria-label="Twitter">
                  <i className="fab fa-twitter text-sm"></i>
                </Link>
              )}
              {settings?.youtube && (
                <Link href={settings.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-primary-green hover:text-white transition-all duration-300 active:scale-[0.95]" aria-label="Youtube">
                  <i className="fab fa-youtube text-sm"></i>
                </Link>
              )}
              {/* Fallback jika tidak ada link sosial disetting */}
              {!settings?.facebook && !settings?.instagram && !settings?.twitter && !settings?.youtube && (
                <>
                  <Link className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-primary-green hover:text-white transition-all duration-300 active:scale-[0.95]" href="#" aria-label="Facebook"><i className="fab fa-facebook-f text-sm"></i></Link>
                  <Link className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-primary-green hover:text-white transition-all duration-300 active:scale-[0.95]" href="#" aria-label="Instagram"><i className="fab fa-instagram text-sm"></i></Link>
                  <Link className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-primary-green hover:text-white transition-all duration-300 active:scale-[0.95]" href="#" aria-label="Twitter"><i className="fab fa-twitter text-sm"></i></Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-medium">
          <p>© {year || new Date().getFullYear()} {storeName}. Hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-6">
            <Link href="/return-policy" className="hover:text-primary-green transition-colors">Syarat & Ketentuan</Link>
            <Link href="/privacy-policy" className="hover:text-primary-green transition-colors">Kebijakan Privasi</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
