import { getProducts } from '@/app/actions/catalog';
import ProductList from './ProductList';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const result = await getProducts();
  const products = result.success ? result.data : [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Katalog Produk</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola semua produk herbal Anda di sini</p>
        </div>
        <Link href="/admin/products/form">
          <Button leftIcon={<Plus size={18} />}>
            Tambah Produk Baru
          </Button>
        </Link>
      </div>

      <ProductList initialProducts={products || []} />
    </div>
  );
}
