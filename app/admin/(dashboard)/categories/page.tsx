import { Metadata } from 'next';
import { getCategories } from '@/app/actions/catalog';
import CategoryManager from './CategoryManager';
import AdminPageErrorBoundary from '../_components/AdminPageErrorBoundary';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Kategori Produk | Admin Al-Kautsar',
  description: 'Kelola kategori untuk klasifikasi produk herbal katalog',
};

export default async function CategoriesPage() {
  const result = await getCategories();
  const categories = result.success && result.data ? (result.data as any[]) : [];

  return (
    <AdminPageErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kategori Produk</h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola klasifikasi taksonomi untuk mengorganisasi produk herbal dan memudahkan navigasi toko.
            </p>
          </div>
        </div>

        {/* Category Manager Client Component */}
        <CategoryManager 
          initialCategories={categories} 
          error={!result.success ? result.error : undefined}
        />
      </div>
    </AdminPageErrorBoundary>
  );
}
