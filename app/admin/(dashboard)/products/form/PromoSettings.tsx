'use client';

import { Input } from '@/components/ui/Input';
import type { ProductFormData } from './types';

interface PromoSettingsProps {
  formData: ProductFormData;
  onChange: (updates: Partial<ProductFormData>) => void;
}

/**
 * Promo Settings Component
 * Handles:
 * - Promo toggle
 * - Percentage input
 * - Auto-calculated promo price
 * - Expiry date
 */
export function PromoSettings({ formData, onChange }: PromoSettingsProps) {
  const { isPromo, promoPercentage, promoPrice, promoExpiry } = formData;

  // Auto-calculate promo price when percentage changes
  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = e.target.value;
    let calculatedPromoPrice = '';

    if (formData.price && percentage) {
      const percVal = parseFloat(percentage);
      const priceVal = parseFloat(formData.price);
      if (!isNaN(percVal) && !isNaN(priceVal) && priceVal > 0) {
        calculatedPromoPrice = Math.round(priceVal - (priceVal * percVal / 100)).toString();
      }
    }

    onChange({ promoPercentage: percentage, promoPrice: calculatedPromoPrice });
  };

  const todayString = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-5">
      {/* Toggle Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Pengaturan Promo & Diskon</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Aktifkan untuk memberikan potongan harga flash sale pada produk ini.
          </p>
        </div>

        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isPromo}
            onChange={(e) => onChange({ isPromo: e.target.checked })}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-green"></div>
        </label>
      </div>

      {/* Promo Fields */}
      {isPromo && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-emerald-100/60">
          {/* Percentage */}
          <Input
            label="Persentase Diskon (%)"
            type="number"
            min="1"
            max="100"
            placeholder="Misal: 15"
            value={promoPercentage}
            onChange={handlePercentageChange}
            required
          />

          {/* Calculated Promo Price */}
          <Input
            label="Harga Promo Akhir (Rp)"
            type="number"
            placeholder="Otomatis dihitung"
            value={promoPrice}
            readOnly
            className="bg-gray-50 font-bold text-emerald-700 font-mono"
          />

          {/* Expiry Date (Minimum is Today) */}
          <Input
            label="Berlaku Sampai Tanggal"
            type="date"
            min={todayString}
            value={promoExpiry}
            onChange={(e) => onChange({ promoExpiry: e.target.value })}
            required
          />
        </div>
      )}
    </div>
  );
}
