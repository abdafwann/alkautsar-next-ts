import { getProduct } from '@/app/actions/catalog';
import { getCategories } from '@/app/actions/catalog';
import ProductForm from './ProductForm';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProductFormPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const id = typeof params.id === 'string' ? params.id : null;
  
  let product = null;
  if (id) {
    const res = await getProduct(id);
    if (res.success) {
      product = res.data;
    }
  }

  const catRes = await getCategories();
  const categories = catRes.success ? catRes.data : [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm" className="px-2">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Isi detail produk herbal di bawah ini
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <ProductForm initialData={product} categories={categories || []} />
      </div>
    </div>
  );
}
