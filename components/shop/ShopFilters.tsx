'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';

interface Category {
  id: string;
  name: string;
  _count?: {
    products: number;
  };
}

interface ShopFiltersProps {
  categories: Category[];
  totalProducts: number;
}

export default function ShopFilters({ categories, totalProducts }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil state dari URL
  const currentCategory = searchParams.get('categoryId') || '';
  const initialForms = searchParams.getAll('form');
  const initialMinPrice = searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';
  const initialInStock = searchParams.get('inStock') === 'true';

  // Local state
  const [selectedForms, setSelectedForms] = useState<string[]>(initialForms);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [inStockOnly, setInStockOnly] = useState(initialInStock);

  const productForms = [
    'Kapsul',
    'Sirup',
    'Madu',
    'Minyak',
    'Serbuk',
    'Teh Celup',
    'Tablet',
    'Pil',
    'Salep',
    'Lainnya',
  ];

  // Handle Form Checkbox (Auto Apply)
  const handleFormToggle = (form: string) => {
    const isChecked = selectedForms.includes(form);
    const newForms = isChecked ? selectedForms.filter(f => f !== form) : [...selectedForms, form];
    setSelectedForms(newForms);
    
    const params = new URLSearchParams(searchParams.toString());
    params.delete('form');
    newForms.forEach(f => params.append('form', f));
    params.delete('page');
    router.push(`/shop?${params.toString()}`);
  };

  // Handle In-Stock Checkbox (Auto Apply)
  const handleInStockToggle = (checked: boolean) => {
    setInStockOnly(checked);
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.set('inStock', 'true');
    } else {
      params.delete('inStock');
    }
    params.delete('page');
    router.push(`/shop?${params.toString()}`);
  };

  // Build URL parameters function
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  };

  // Apply Filters
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentCategory) params.set('categoryId', currentCategory);
    if (minPrice) params.set('minPrice', minPrice); else params.delete('minPrice');
    if (maxPrice) params.set('maxPrice', maxPrice); else params.delete('maxPrice');
    if (inStockOnly) params.set('inStock', 'true'); else params.delete('inStock');
    
    params.delete('form');
    selectedForms.forEach(form => {
      params.append('form', form);
    });
    params.delete('page');

    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-2xs border border-gray-200">
      {/* Header */}
      <h3 className="font-bold text-gray-900 mb-4 text-xs uppercase tracking-wider">Filter Produk</h3>

      {/* Categories */}
      <div className="mb-5 pb-5 border-b border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Kategori</h4>
        <ul className="flex flex-col gap-2">
          <li>
            <Link
              href="/shop"
              className={`flex items-center justify-between text-sm transition-colors ${!currentCategory ? 'text-primary-green font-bold' : 'text-gray-600 hover:text-primary-green'}`}
            >
              <span>Semua Produk</span>
              <span className={`${!currentCategory ? 'bg-emerald-50 text-primary-green font-bold' : 'bg-gray-100 text-gray-500'} px-2 py-0.5 rounded-full text-xs font-mono`}>
                {totalProducts}
              </span>
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/shop?${createQueryString('categoryId', cat.id)}`}
                className={`flex items-center justify-between text-sm transition-colors ${currentCategory === cat.id ? 'text-primary-green font-bold' : 'text-gray-600 hover:text-primary-green'}`}
              >
                <span>{cat.name}</span>
                <span className={`${currentCategory === cat.id ? 'bg-emerald-50 text-primary-green font-bold' : 'bg-gray-100 text-gray-500'} px-2 py-0.5 rounded-full text-xs font-mono`}>
                  {cat._count?.products || 0}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Ketersediaan Stok Filter */}
      <div className="mb-5 pb-5 border-b border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Ketersediaan</h4>
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              className="peer appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-primary-green checked:border-primary-green transition-all cursor-pointer"
              checked={inStockOnly}
              onChange={(e) => handleInStockToggle(e.target.checked)}
            />
            <svg className="absolute w-3 h-3 text-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm text-gray-700 group-hover:text-primary-green transition-colors font-medium">Hanya Produk Tersedia</span>
        </label>
      </div>

      {/* Sediaan (Form) Filter */}
      <div className="mb-5 pb-5 border-b border-gray-100">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Bentuk Sediaan</h4>
        <div className="flex flex-col gap-2">
          {productForms.map(form => (
            <label key={form} className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-primary-green checked:border-primary-green transition-all cursor-pointer"
                  checked={selectedForms.includes(form)}
                  onChange={() => handleFormToggle(form)}
                />
                <svg className="absolute w-3 h-3 text-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-sm text-gray-700 group-hover:text-primary-green transition-colors">{form}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Rentang Harga</h4>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs font-medium w-5">Min</span>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Rp</span>
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-7 pr-2 py-1.5 text-xs focus:outline-none focus:border-primary-green transition-shadow"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs font-medium w-5">Max</span>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Rp</span>
              <input
                type="number"
                placeholder="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-7 pr-2 py-1.5 text-xs focus:outline-none focus:border-primary-green transition-shadow"
              />
            </div>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={applyFilters}
            className="w-full text-xs font-bold shadow-2xs mt-1"
          >
            Terapkan Filter
          </Button>
        </div>
      </div>

    </div>
  );
}
