import Link from 'next/link';
import ShopFilters from '@/components/shop/ShopFilters';
import { CaretRight } from '@phosphor-icons/react/dist/ssr';
import { getCategories, getTotalProductsCount } from '@/app/actions/catalog';
import { Suspense } from 'react';
import ProductGridSkeleton from '@/components/shop/ProductGridSkeleton';
import ProductGridServer from '@/components/shop/ProductGridServer';

export const dynamic = 'force-dynamic';

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  
  // Extract filters from URL
  const query = typeof params.q === 'string' ? params.q.trim() : undefined;
  const categoryId = typeof params.categoryId === 'string' ? params.categoryId : undefined;
  
  let productForms: string[] = [];
  if (params.form) {
    productForms = Array.isArray(params.form) ? params.form : [params.form];
  }

  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  
  const pageParam = params.page ? Number(params.page) : 1;
  const page = isNaN(pageParam) ? 1 : pageParam;

  const sort = typeof params.sort === 'string' ? params.sort : undefined;
  const inStock = params.inStock === 'true';

  // Fetch all categories for sidebar
  const categoriesRes = await getCategories();
  const categories = categoriesRes.success ? categoriesRes.data : [];

  // Get total products count for "Semua Produk" badge
  const countRes = await getTotalProductsCount();
  const totalProducts = countRes.success && typeof countRes.data === 'number' ? countRes.data : 0;

  // Create a unique key for Suspense based on URL params so it re-triggers the fallback
  const suspenseKey = JSON.stringify(params);

  return (
    <div className="bg-[#fcfbf9] min-h-screen pt-12 lg:pt-14">
      {/* Breadcrumbs Semantik */}
      <div className="bg-white border-b border-gray-200 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-gray-500 font-medium flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary-green transition-colors">Beranda</Link>
          <CaretRight size={12} weight="bold" className="text-gray-400" />
          <span className="text-gray-900 font-semibold">Katalog Produk</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar (Filters & Categories) */}
          <div className="lg:col-span-1">
            <ShopFilters categories={categories || []} totalProducts={totalProducts} />
          </div>

          {/* Right Content (Product Grid wrapped in Suspense) */}
          <div className="lg:col-span-3">
            <Suspense key={suspenseKey} fallback={<ProductGridSkeleton />}>
              <ProductGridServer 
                query={query}
                categoryId={categoryId}
                productForms={productForms}
                minPrice={minPrice}
                maxPrice={maxPrice}
                inStock={inStock}
                page={page}
                sort={sort}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
