'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function ShopSorting() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'newest';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    
    // Reset page to 1 when sorting changes
    params.delete('page');
    
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <select 
      value={currentSort}
      onChange={handleSortChange}
      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green bg-white shadow-sm cursor-pointer"
    >
      <option value="newest">Terbaru</option>
      <option value="price_asc">Harga: Rendah ke Tinggi</option>
      <option value="price_desc">Harga: Tinggi ke Rendah</option>
    </select>
  );
}
