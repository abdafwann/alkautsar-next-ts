'use client';

import { useState } from 'react';
import { 
  CheckCircle, 
  Pill, 
  Drop, 
  Plant, 
  FileText, 
  WarningCircle, 
  ShieldCheck 
} from '@phosphor-icons/react';
import { Badge } from '@/components/ui/Badge';

interface ProductClinicalInfoProps {
  categoryName?: string;
  title: string;
  originalPrice: number;
  promoPrice: number | null;
  discountPercent: number;
  productForm?: string | null;
  certificate?: string | null;
  uses?: string | null;
  composition?: string | null;
  directions?: string | null;
  warnings?: string | null;
}

/*
 * Pemilihan ikon sediaan secara adaptif membantu pembeli memahami wujud fisik 
 * ramuan herbal (kapsul, cair/sirup, atau simplisia/teh) secara intuitif
 */
function getProductFormIcon(form?: string | null) {
  const normalized = (form || '').toLowerCase();
  if (
    normalized.includes('sirup') ||
    normalized.includes('cair') ||
    normalized.includes('tetes') ||
    normalized.includes('madu') ||
    normalized.includes('minyak') ||
    normalized.includes('oil') ||
    normalized.includes('liquid')
  ) {
    return <Drop size={15} weight="duotone" className="text-primary-green" />;
  }
  if (
    normalized.includes('teh') ||
    normalized.includes('serbuk') ||
    normalized.includes('bubuk') ||
    normalized.includes('simplisia')
  ) {
    return <Plant size={15} weight="duotone" className="text-primary-green" />;
  }
  return <Pill size={15} weight="duotone" className="text-primary-green" />;
}

export default function ProductClinicalInfo({
  categoryName,
  title,
  originalPrice,
  promoPrice,
  discountPercent,
  productForm,
  certificate,
  uses,
  composition,
  directions,
  warnings,
}: ProductClinicalInfoProps) {
  const [activeTab, setActiveTab] = useState<'benefits' | 'ingredients' | 'directions' | 'warnings'>('benefits');

  const currentPrice = promoPrice || originalPrice;
  const formattedOriginalPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(originalPrice);
  const formattedCurrentPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(currentPrice);

  return (
    <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200 shadow-2xs flex flex-col gap-4">
      {/*
       * Eyebrow kategori dan segel status keaslian produk menegaskan kepatuhan fitofarmaka 
       * dan meyakinkan konsumen terhadap legalitas produk resmi
       */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-accent-brown bg-[#faf7f2] px-3 py-1 rounded-full uppercase tracking-wider border border-[#ede7de]">
          {categoryName || 'Herbal Alami'}
        </span>
        <Badge variant="success" size="sm" className="flex items-center gap-1 font-semibold">
          <ShieldCheck size={13} weight="bold" />
          <span>Produk Resmi</span>
        </Badge>
      </div>

      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
        {title}
      </h1>

      {/*
       * Banner harga menampilkan rincian hemat diskon untuk mendorong keputusan pembelian 
       * tanpa menggunakan countdown artifisial yang tidak etis
       */}
      <div className="p-3.5 bg-[#faf9f6] rounded-xl border border-gray-200/80 flex flex-col gap-1">
        {promoPrice ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 line-through text-xs font-medium font-mono">{formattedOriginalPrice}</span>
              <Badge variant="sale" size="sm">
                Hemat {discountPercent}%
              </Badge>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-primary-green tracking-tight font-mono">
              {formattedCurrentPrice}
            </div>
          </>
        ) : (
          <div className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight font-mono">
            {formattedOriginalPrice}
          </div>
        )}
        <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5">
          <CheckCircle size={14} weight="fill" className="text-primary-green shrink-0" />
          <span>Harga resmi terstandar PT. Al-Kautsar Herbal</span>
        </div>
      </div>

      {/*
       * Grid spesifikasi sediaan dan nomor registrasi BPOM ditonjolkan 
       * untuk memenuhi ekspektasi transparansi konsumen produk kesehatan
       */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-gray-100 bg-[#f9fbf9] p-3 rounded-xl">
          <div className="text-[11px] text-gray-500 font-medium">Bentuk Sediaan</div>
          <div className="text-xs md:text-sm font-bold text-gray-900 mt-0.5 flex items-center gap-1.5">
            {getProductFormIcon(productForm)}
            <span>{productForm || 'Kapsul Ekstrak'}</span>
          </div>
        </div>

        <div className="border border-gray-100 bg-[#f9fbf9] p-3 rounded-xl">
          <div className="text-[11px] text-gray-500 font-medium">Izin Edar Resmi</div>
          <div className="text-xs md:text-sm font-bold text-gray-900 mt-0.5 flex items-center gap-1.5">
            <FileText size={15} weight="duotone" className="text-accent-brown" />
            <span className="truncate font-mono">{certificate || 'POM TR Terdaftar'}</span>
          </div>
        </div>
      </div>

      {/*
       * Kotak penekanan khasiat utama memberi ringkasan terapeutik cepat 
       * sebelum pengguna membaca tab rincian yang lebih panjang
       */}
      {uses && (
        <div className="bg-emerald-50/60 border-l-4 border-primary-green p-3.5 rounded-r-xl">
          <div className="text-[11px] font-bold uppercase tracking-wider text-dark-green mb-1">
            Khasiat & Manfaat Utama
          </div>
          <p className="text-xs md:text-sm text-gray-800 font-medium leading-relaxed">
            {uses}
          </p>
        </div>
      )}

      {/*
       * Tabulasi rincian farmakologis memisahkan informasi klinis 
       * agar tidak membanjiri ruang layar mobile dengan teks rapat
       */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex border-b border-gray-200 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('benefits')}
            className={`pb-2 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === 'benefits' 
                ? 'text-primary-green border-b-2 border-primary-green' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Manfaat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ingredients')}
            className={`pb-2 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === 'ingredients' 
                ? 'text-primary-green border-b-2 border-primary-green' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Komposisi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('directions')}
            className={`pb-2 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === 'directions' 
                ? 'text-primary-green border-b-2 border-primary-green' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Aturan Pakai
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('warnings')}
            className={`pb-2 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === 'warnings' 
                ? 'text-primary-green border-b-2 border-primary-green' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Peringatan
          </button>
        </div>

        <div className="py-2 text-xs md:text-sm text-gray-700 leading-relaxed min-h-[60px]">
          {activeTab === 'benefits' && (
            <p className="whitespace-pre-line">
              {uses || 'Membantu menjaga dan memelihara daya tahan serta kesehatan tubuh secara alami.'}
            </p>
          )}
          {activeTab === 'ingredients' && (
            <div className="bg-[#faf7f2] p-3.5 rounded-xl border border-[#ede7de]">
              <div className="font-bold text-[11px] text-accent-brown uppercase tracking-wider mb-1">Bahan Herbal Aktif</div>
              <p className="whitespace-pre-line text-gray-800 font-medium">
                {composition || 'Diformulasikan dari ekstrak herbal alami murni pilihan kualitas farmasi.'}
              </p>
            </div>
          )}
          {activeTab === 'directions' && (
            <div className="space-y-1">
              <p className="whitespace-pre-line">
                {directions || 'Diminum 2 kali sehari sebanyak 1-2 kapsul setelah makan, disertai air hangat.'}
              </p>
            </div>
          )}
          {activeTab === 'warnings' && (
            <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-xl text-amber-900 text-xs leading-relaxed flex items-start gap-2">
              <WarningCircle size={17} weight="fill" className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                {warnings || 'Simpan di tempat kering dan sejuk di bawah suhu 30°C. Jauhkan dari jangkauan anak-anak dan paparan sinar matahari langsung.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
