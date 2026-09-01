import { Metadata } from 'next';
import { getProducts } from '@/app/actions/catalog';
import ProductList from './ProductList';
import AdminPageErrorBoundary from '../_components/AdminPageErrorBoundary';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Katalog Produk | Admin Al-Kautsar',
  description: 'Kelola daftar produk, stok gudang, harga, dan promo produk herbal',
};

export default async function ProductsPage() {
  const result = await getProducts();
  const products = result.success && result.data ? result.data : [];

  return (
    <AdminPageErrorBoundary>
      <div className="space-y-6">
        {/* Product List Client */}
        <ProductList 
          initialProducts={products as any[]} 
          error={!result.success ? result.error : undefined}
        />
      </div>
    </AdminPageErrorBoundary>
  );
}
