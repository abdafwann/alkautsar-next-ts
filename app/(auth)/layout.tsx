import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Award, Leaf, Lock } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#fbfdfc] flex flex-col lg:flex-row relative selection:bg-[#00AA5B]/20 selection:text-[#00AA5B]">
      
      {/* 1. Left Showcase Side (Desktop Botanical Brand) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0e2417] text-white p-12 xl:p-16 flex-col justify-between overflow-hidden">
        
        {/* Ambient Botanical Glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#00AA5B]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#00AA5B]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: Logo & Return Navigation */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:bg-[#00AA5B] transition-all duration-300">
              <svg 
                width="22" 
                height="22" 
                viewBox="0 0 40 40" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className="text-white"
              >
                <path d="M20 4C20 4 10 12 10 22C10 27.5228 14.4772 32 20 32C25.5228 32 30 27.5228 30 22C30 12 20 4 20 4Z" fill="currentColor" fillOpacity="0.25"/>
                <path d="M20 4C20 4 10 12 10 22C10 27.5228 14.4772 32 20 32C25.5228 32 30 27.5228 30 22C30 12 20 4 20 4Z" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 32V20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
                <path d="M16 24C16 24 17.5 27 20 27C22.5 27 24 24 24 24" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-[family-name:var(--font-serif)] text-xl font-bold italic tracking-tight text-white leading-none">
                Al-Kautsar
              </span>
              <span className="text-[7.5px] tracking-[0.14em] uppercase font-semibold text-emerald-300 mt-1">
                Indonesian Traditional Herbal Medicine
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-white/90 backdrop-blur-md border border-white/15 transition-all active:scale-95 group"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Center Content: Pure Brand Value & Trust */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <h1 className="font-[family-name:var(--font-serif)] text-4xl xl:text-5xl font-bold text-white leading-[1.18] mb-6">
            Akses Produk Herbal Resmi & Teruji Klinis
          </h1>

          <p className="text-gray-300 text-sm xl:text-base leading-relaxed font-light mb-10">
            Portal resmi PT. Al-Kautsar Perkasa Indonesia untuk pemesanan obat tradisional terstandar BPOM dan Halal.
          </p>

          {/* Clean Integrated Regulatory & Quality Row (3 Core Pillars) */}
          <div className="pt-8 border-t border-white/10 flex flex-wrap items-center gap-5 max-w-lg">
            {/* 1. 100% Herbal Alami */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#00AA5B] shadow-sm shrink-0">
                <Leaf size={20} strokeWidth={2.2} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block leading-tight">100% Herbal</span>
                <span className="text-[10px] text-emerald-300/80 block leading-tight mt-0.5">Ekstrak Murni</span>
              </div>
            </div>

            <div className="h-7 w-px bg-white/15 shrink-0 hidden sm:block" />

            {/* 2. BPOM RI */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-sm shrink-0">
                <img
                  src="/BPOM Logo - Colored - zonalogo.com.svg"
                  alt="Sertifikasi Resmi BPOM RI"
                  className="w-auto max-h-6 object-contain"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-white block leading-tight">BPOM RI</span>
                <span className="text-[10px] text-emerald-300/80 block leading-tight mt-0.5">Uji Klinis Resmi</span>
              </div>
            </div>

            <div className="h-7 w-px bg-white/15 shrink-0 hidden sm:block" />

            {/* 3. Halal Indonesia */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-sm shrink-0">
                <img
                  src="/Halal Indonesia Logo - Colored - zonalogo.com.svg"
                  alt="Sertifikasi Halal Indonesia"
                  className="w-auto max-h-7 object-contain"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-white block leading-tight">Halal Indonesia</span>
                <span className="text-[10px] text-emerald-300/80 block leading-tight mt-0.5">BPJPH Kemenag</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Official Brand Note */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 font-medium">
          <span>PT. Al-Kautsar Perkasa Indonesia</span>
          <span>Official Store Portal</span>
        </div>

      </div>

      {/* 2. Right Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 xl:p-16 min-h-screen">
        
        {/* Mobile Navigation Header */}
        <div className="flex lg:hidden items-center justify-between mb-8 pb-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00AA5B] text-white flex items-center justify-center shadow-xs">
              <svg width="18" height="18" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4C20 4 10 12 10 22C10 27.5228 14.4772 32 20 32C25.5228 32 30 27.5228 30 22C30 12 20 4 20 4Z" fill="white" fillOpacity="0.25"/>
                <path d="M20 4C20 4 10 12 10 22C10 27.5228 14.4772 32 20 32C25.5228 32 30 27.5228 30 22C30 12 20 4 20 4Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-[family-name:var(--font-serif)] text-lg font-bold italic text-gray-900">Al-Kautsar</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Beranda</span>
          </Link>
        </div>

        {/* Center Auth Form */}
        <div className="my-auto w-full max-w-md mx-auto">
          {children}
        </div>

        {/* Footer Security Guarantee */}
        <div className="pt-8 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
          <Lock size={13} className="text-[#00AA5B]" />
          <span>Koneksi aman terenkripsi SSL 256-bit.</span>
        </div>

      </div>

    </div>
  );
}
