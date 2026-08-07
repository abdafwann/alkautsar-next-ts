import { getCategories } from '@/app/actions/catalog';
import CategoryManager from './CategoryManager';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const result = await getCategories();
  const categories = result.success ? result.data : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Kategori Produk</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola kategori untuk mengorganisir produk Anda</p>
      </div>

      {/* Client Component untuk mengelola state form dan tabel */}
      <CategoryManager initialCategories={categories || []} />
    </div>
  );
}
