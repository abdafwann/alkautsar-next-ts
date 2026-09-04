'use client';

import React from 'react';
import { Minus, Plus } from '@phosphor-icons/react';

export interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  isExceeded?: boolean;
  onDecrement: () => void;
  onIncrement: () => void;
  className?: string;
  itemTitle?: string;
}

/*
 * Mengabstraksikan kontrol kuantitas agar logika pembatasan stok dan aksesibilitas ARIA 
 * tersentralisasi, serta mencegah reflow manual di berbagai view cart dan product detail
 */
export function QuantityStepper({
  value,
  min = 1,
  max = 999,
  disabled = false,
  isExceeded = false,
  onDecrement,
  onIncrement,
  className = '',
  itemTitle,
}: QuantityStepperProps) {
  const isDecrementDisabled = disabled || value <= min;
  const isIncrementDisabled = disabled || value >= max;

  return (
    <div
      className={`flex items-center border border-gray-200 rounded-xl bg-gray-50/80 p-0.5 shadow-2xs ${className}`}
    >
      {/*
       * Tombol aksi menggunakan aria-label spesifik nama produk guna memenuhi standar WCAG 2.1 
       * saat screen reader menjelajahi daftar produk tabular
       */}
      <button
        type="button"
        onClick={onDecrement}
        disabled={isDecrementDisabled}
        className="w-7 h-7 rounded-lg bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center transition-colors cursor-pointer border border-gray-200/70 disabled:opacity-40 disabled:cursor-not-allowed active:scale-90"
        aria-label={itemTitle ? `Kurangi kuantitas ${itemTitle}` : 'Kurangi jumlah'}
      >
        <Minus size={12} weight="bold" />
      </button>

      {/*
       * Pewarnaan teks amber memberi sinyal visual langsung jika kuantitas melebihi sisa stok valid
       */}
      <span
        className={`w-9 text-center font-bold text-xs ${
          isExceeded ? 'text-amber-700' : 'text-gray-900'
        }`}
        aria-live="polite"
      >
        {value}
      </span>

      <button
        type="button"
        onClick={onIncrement}
        disabled={isIncrementDisabled}
        className="w-7 h-7 rounded-lg bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center transition-colors cursor-pointer border border-gray-200/70 disabled:opacity-40 disabled:cursor-not-allowed active:scale-90"
        aria-label={itemTitle ? `Tambah kuantitas ${itemTitle}` : 'Tambah jumlah'}
      >
        <Plus size={12} weight="bold" />
      </button>
    </div>
  );
}
