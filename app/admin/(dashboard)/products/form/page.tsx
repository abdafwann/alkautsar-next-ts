import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getProduct, getCategories } from '@/app/actions/catalog';
import ProductForm from './ProductForm';
import AdminPageErrorBoundary from '../../_components/AdminPageErrorBoundary';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const id = typeof params.id === 'string' ? params.id : null;
  return {
    title: id ? 'Edit Produk Herbal | Admin Al-Kautsar' : 'Tambah Produk Baru | Admin Al-Kautsar',
    description: 'Formulir pengelolaan master data katalog produk herbal Al-Kautsar',
  };
}

export default async function ProductFormPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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
  const categories = catRes.success && catRes.data ? (catRes.data as any[]) : [];

  return (
    <AdminPageErrorBoundary>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-xs"
            title="Kembali ke Daftar Produk"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                {id ? 'Edit Data Produk Herbal' : 'Tambah Produk Herbal Baru'}
              </h1>
              {id && (
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                  Mode Edit
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Lengkapi spesifikasi klinis, taksonomi sediaan, stok gudang, dan promo diskon produk.
            </p>
          </div>
        </div>

        {/* Main 2-Column Form Component */}
        <ProductForm initialData={product} categories={categories} />
      </div>
    </AdminPageErrorBoundary>
  );
}
