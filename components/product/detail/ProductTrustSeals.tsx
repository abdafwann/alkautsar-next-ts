import { ShieldCheck } from '@phosphor-icons/react';

interface ProductTrustSealsProps {
  certificate?: string | null;
}

/*
 * Kapsul jaminan resmi BPOM dan Halal diposisikan tepat di bawah foto sediaan 
 * untuk membangun keyakinan legalitas (regulatory trust) sebelum pembeli berpindah ke tombol checkout
 */
export default function ProductTrustSeals({ certificate: _ }: ProductTrustSealsProps) {
  return (
    <div className="w-full pt-1">
      <div className="w-full bg-[#faf7f2] border border-[#ede7de] rounded-full px-3.5 py-1.5 flex items-center justify-between shadow-2xs">
        
        {/*
         * Logo resmi BPOM dan Halal Indonesia diapit dalam pill kontras 
         * guna membuktikan kepatuhan standar fitofarmaka nasional
         */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 shrink-0 bg-white px-2 py-0.5 rounded-full border border-[#ede7de]">
            <img
              src="/BPOM Logo - Colored - zonalogo.com.svg"
              alt="BPOM RI"
              className="h-4.5 w-auto object-contain"
              title="Terdaftar Resmi BPOM RI"
            />
            <div className="w-px h-3 bg-gray-200" />
            <img
              src="/Halal Indonesia Logo - Colored - zonalogo.com.svg"
              alt="Halal Indonesia"
              className="h-5.5 w-auto object-contain"
              title="Sertifikasi Halal Indonesia"
            />
          </div>
          <span className="text-[11px] font-bold text-gray-900">
            Sertifikasi Resmi
          </span>
        </div>

        {/*
         * Penanda komitmen CPOTB (Cara Pembuatan Obat Tradisional yang Baik) 
         * memberikan garansi higienitas dan mutu formulasi herbal
         */}
        <div className="flex items-center gap-1 text-[10.5px] font-medium text-gray-700 shrink-0">
          <ShieldCheck size={14} weight="fill" className="text-primary-green shrink-0" />
          <span>100% Herbal • Standar CPOTB</span>
        </div>

      </div>
    </div>
  );
}
