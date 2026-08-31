import { ShieldCheck } from 'lucide-react';

interface ProductTrustSealsProps {
  certificate?: string | null;
}

/**
 * Option 3: Compact Guarantee Pill (Single Integrated Capsule Ribbon).
 * Ultra-compact, stylish horizontal pill that sits seamlessly under the product gallery.
 */
export default function ProductTrustSeals({ certificate: _ }: ProductTrustSealsProps) {
  return (
    <div className="w-full pt-1">
      <div className="w-full bg-[#faf7f2] border border-[#ede7de] rounded-full px-3.5 py-1.5 flex items-center justify-between shadow-2xs">
        
        {/* Official Authority Marks Group */}
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
          <span className="text-[11px] font-bold text-text-main">
            Sertifikasi Resmi
          </span>
        </div>

        {/* Quality Commitment Tag */}
        <div className="flex items-center gap-1 text-[10.5px] font-medium text-text-main/75 shrink-0">
          <ShieldCheck size={13} className="text-primary-green shrink-0" />
          <span>100% Herbal • Standar CPOTB</span>
        </div>

      </div>
    </div>
  );
}
