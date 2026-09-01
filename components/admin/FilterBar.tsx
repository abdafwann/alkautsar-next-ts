'use client';

import { FilterSelect } from '@/components/ui/FilterSelect';
import { SlidersHorizontal } from 'lucide-react';
import type { FilterOption } from '@/types/admin';

interface FilterBarProps {
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  categories?: FilterOption[];
  productForms?: FilterOption[];
}

export function FilterBar({
  filters,
  onFilterChange,
  categories = [],
  productForms = [],
}: FilterBarProps) {
  return (
    <div className="px-6 pb-4 border-b border-gray-50 bg-gray-50/20 flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-gray-500 mr-2 flex items-center gap-2">
        <SlidersHorizontal size={16} />
        Filter:
      </span>

      <FilterSelect
        value={filters.category || 'ALL'}
        onChange={(value) => onFilterChange('category', value)}
        options={[
          { value: 'ALL', label: 'Semua Kategori' },
          ...categories,
        ]}
      />

      <FilterSelect
        value={filters.promo || 'ALL'}
        onChange={(value) => onFilterChange('promo', value)}
        options={[
          { value: 'ALL', label: 'Semua Harga' },
          { value: 'PROMO', label: 'Sedang Promo' },
          { value: 'NORMAL', label: 'Harga Normal' },
        ]}
      />

      <FilterSelect
        value={filters.productForm || 'ALL'}
        onChange={(value) => onFilterChange('productForm', value)}
        options={[
          { value: 'ALL', label: 'Semua Sediaan' },
          ...productForms,
        ]}
      />

      <FilterSelect
        value={filters.stock || 'ALL'}
        onChange={(value) => onFilterChange('stock', value)}
        options={[
          { value: 'ALL', label: 'Semua Stok' },
          { value: 'LOW', label: '⚠️ Stok Kritis (≤ 5)' },
          { value: 'AVAILABLE', label: 'Aman (> 5)' },
        ]}
        className="font-medium"
      />
    </div>
  );
}
