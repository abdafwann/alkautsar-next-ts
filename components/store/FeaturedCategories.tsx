import { getFeaturedCategories } from '@/app/actions/store-frontend';
import FeaturedCategoriesClient from './FeaturedCategoriesClient';

export default async function FeaturedCategories() {
  const response = await getFeaturedCategories(3); // Grab top 3
  let categories = response.success ? response.data || [] : [];

  // Fallback dummy data jika database masih kosong
  if (categories.length === 0) {
    categories = [
      { id: 'dummy-1', name: 'Herbal Alami', description: 'Koleksi produk herbal murni tanpa campuran bahan kimia.' } as any,
      { id: 'dummy-2', name: 'Perawatan Tubuh', description: 'Nutrisi dan perawatan untuk kesehatan kulit dan tubuh.' } as any,
      { id: 'dummy-3', name: 'Suplemen Kesehatan', description: 'Suplemen harian untuk menjaga vitalitas dan imunitas.' } as any
    ];
  }

  // Cukup ambil 3 karena layout Asymmetric Bento Grid kita dirancang untuk 3 item
  const top3 = categories.slice(0, 3);

  return <FeaturedCategoriesClient categories={top3 as any} />;
}
