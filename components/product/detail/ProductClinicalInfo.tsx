'use client';

import { useState } from 'react';
import { CheckCircle2, Pill, Droplets, Leaf, FileText, AlertCircle, ShieldCheck } from 'lucide-react';

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
    return <Droplets size={14} className="text-primary-green" />;
  }
  if (
    normalized.includes('teh') ||
    normalized.includes('serbuk') ||
    normalized.includes('bubuk') ||
    normalized.includes('simplisia')
  ) {
    return <Leaf size={14} className="text-primary-green" />;
  }
  return <Pill size={14} className="text-primary-green" />;
}

/**
 * Product detail clinical info & apothecary tabs.
 * Clean, restrained, and 100% free from fake ratings and AI sparkles.
 */
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
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-200/80 shadow-xs flex flex-col gap-4">
      {/* Category Eyebrow & Status */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-accent-brown bg-secondary-cream px-3 py-1 rounded-full uppercase tracking-wider border border-secondary-cream">
          {categoryName || 'Herbal Alami'}
        </span>
        <span className="text-xs font-semibold text-dark-green bg-secondary-green px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <ShieldCheck size={13} className="text-primary-green" />
          <span>Produk Resmi</span>
        </span>
      </div>

      {/* Product Title */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-text-main tracking-tight leading-snug">
        {title}
      </h1>

      {/* Price Banner */}
      <div className="p-3.5 bg-[#fbfaf7] rounded-xl border border-[#ede8de] flex flex-col gap-1">
        {promoPrice ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 line-through text-xs font-medium">{formattedOriginalPrice}</span>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                Hemat {discountPercent}%
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-primary-green tracking-tight">
              {formattedCurrentPrice}
            </div>
          </>
        ) : (
          <div className="text-2xl md:text-3xl font-extrabold text-text-main tracking-tight">
            {formattedOriginalPrice}
          </div>
        )}
        <div className="text-[11px] text-text-main/60 mt-0.5 flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-primary-green shrink-0" />
          <span>Harga resmi terstandar PT. Al-Kautsar Herbal</span>
        </div>
      </div>

      {/* Herbal Specification Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-gray-100 bg-[#f9fbf9] p-3 rounded-xl">
          <div className="text-[11px] text-gray-500 font-medium">Bentuk Sediaan</div>
          <div className="text-xs md:text-sm font-bold text-text-main mt-0.5 flex items-center gap-1.5">
            {getProductFormIcon(productForm)}
            <span>{productForm || 'Kapsul Ekstrak'}</span>
          </div>
        </div>

        <div className="border border-gray-100 bg-[#f9fbf9] p-3 rounded-xl">
          <div className="text-[11px] text-gray-500 font-medium">Izin Edar Resmi</div>
          <div className="text-xs md:text-sm font-bold text-text-main mt-0.5 flex items-center gap-1.5">
            <FileText size={14} className="text-accent-brown" />
            <span className="truncate font-mono">{certificate || 'POM TR Terdaftar'}</span>
          </div>
        </div>
      </div>

      {/* Main Therapeutic Utility Highlight */}
      {uses && (
        <div className="bg-secondary-green/50 border-l-4 border-primary-green p-3 rounded-r-xl">
          <div className="text-[11px] font-bold uppercase tracking-wider text-dark-green mb-1">
            Khasiat & Manfaat Utama
          </div>
          <p className="text-xs md:text-sm text-text-main font-medium leading-relaxed">
            {uses}
          </p>
        </div>
      )}

      {/* Apothecary Clinical Tabs */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex border-b border-gray-200 gap-4">
          <button
            onClick={() => setActiveTab('benefits')}
            className={`pb-2 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === 'benefits' 
                ? 'text-primary-green border-b-2 border-primary-green' 
                : 'text-gray-500 hover:text-text-main'
            }`}
          >
            Manfaat
          </button>
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`pb-2 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === 'ingredients' 
                ? 'text-primary-green border-b-2 border-primary-green' 
                : 'text-gray-500 hover:text-text-main'
            }`}
          >
            Komposisi
          </button>
          <button
            onClick={() => setActiveTab('directions')}
            className={`pb-2 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === 'directions' 
                ? 'text-primary-green border-b-2 border-primary-green' 
                : 'text-gray-500 hover:text-text-main'
            }`}
          >
            Aturan Pakai
          </button>
          <button
            onClick={() => setActiveTab('warnings')}
            className={`pb-2 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === 'warnings' 
                ? 'text-primary-green border-b-2 border-primary-green' 
                : 'text-gray-500 hover:text-text-main'
            }`}
          >
            Peringatan
          </button>
        </div>

        <div className="py-2 text-xs md:text-sm text-text-main/80 leading-relaxed min-h-[60px]">
          {activeTab === 'benefits' && (
            <p className="whitespace-pre-line">
              {uses || 'Membantu menjaga dan memelihara daya tahan serta kesehatan tubuh secara alami.'}
            </p>
          )}
          {activeTab === 'ingredients' && (
            <div className="bg-secondary-cream p-3 rounded-xl border border-[#ede8de]">
              <div className="font-bold text-[11px] text-accent-brown uppercase tracking-wider mb-1">Bahan Herbal Aktif</div>
              <p className="whitespace-pre-line text-text-main font-medium">
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
            <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-xl text-amber-900 text-xs leading-relaxed flex items-start gap-2">
              <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
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
