'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Filter } from 'lucide-react';
import { useState } from 'react';

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

  // Local state
  const [selectedForms, setSelectedForms] = useState<string[]>(initialForms);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

  const productForms = ['Kapsul', 'Sirup', 'Serbuk', 'Minyak', 'Lainnya'];

  // Handle Form Checkbox (Auto Apply)
  const handleFormToggle = (form: string) => {
    const isChecked = selectedForms.includes(form);
    const newForms = isChecked ? selectedForms.filter(f => f !== form) : [...selectedForms, form];
    setSelectedForms(newForms);
    
    const params = new URLSearchParams(searchParams.toString());
    params.delete('form');
    newForms.forEach(f => params.append('form', f));
    // Reset page to 1 when filter changes
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
    const params = new URLSearchParams();
    if (currentCategory) params.set('categoryId', currentCategory);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    
    selectedForms.forEach(form => {
      params.append('form', form);
    });

    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Categories */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4 text-lg">Kategori Produk</h3>
        <ul className="flex flex-col gap-3">
          <li>
            <Link 
              href="/shop" 
              className={`flex items-center justify-between transition-colors ${!currentCategory ? 'text-primary-green font-bold' : 'text-gray-600 hover:text-primary-green'}`}
            >
              <span>Semua Produk</span>
              <span className={`${!currentCategory ? 'bg-green-50 text-primary-green' : 'bg-gray-50 text-gray-400'} px-2 py-0.5 rounded-full text-xs font-semibold`}>
                {totalProducts}
              </span>
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link 
                href={`/shop?${createQueryString('categoryId', cat.id)}`} 
                className={`flex items-center justify-between transition-colors ${currentCategory === cat.id ? 'text-primary-green font-bold' : 'text-gray-600 hover:text-primary-green'}`}
              >
                <span>{cat.name}</span>
                <span className={`${currentCategory === cat.id ? 'bg-green-50 text-primary-green' : 'bg-gray-50 text-gray-400'} px-2 py-0.5 rounded-full text-xs font-semibold`}>
                  {cat._count?.products || 0}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Sediaan (Form) Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4 text-lg">Bentuk Sediaan</h3>
        <div className="flex flex-col gap-3">
          {productForms.map(form => (
            <label key={form} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  className="peer appearance-none w-5 h-5 border border-gray-300 rounded-md checked:bg-primary-green checked:border-primary-green transition-all"
                  checked={selectedForms.includes(form)}
                  onChange={() => handleFormToggle(form)}
                />
                <svg className="absolute w-3.5 h-3.5 text-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-sm text-gray-700 group-hover:text-primary-green transition-colors">{form}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-gray-900" />
          <h3 className="font-bold text-gray-900 text-lg">Filter Harga</h3>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm font-medium w-6">Min</span>
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
              <input 
                type="number" 
                placeholder="0" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green transition-shadow"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm font-medium w-6">Max</span>
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
              <input 
                type="number" 
                placeholder="0" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green transition-shadow"
              />
            </div>
          </div>
          <button 
            onClick={applyFilters}
            className="w-full bg-primary-green text-white font-bold rounded-xl py-3 mt-2 hover:bg-primary-green-hover transition-colors shadow-sm"
          >
            Terapkan Filter
          </button>
        </div>
      </div>

    </div>
  );
}
