import Link from 'next/link';
import ShopFilters from '@/components/shop/ShopFilters';
import { ChevronRight } from 'lucide-react';
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

  // Fetch all categories for sidebar
  const categoriesRes = await getCategories();
  const categories = categoriesRes.success ? categoriesRes.data : [];

  // Get total products count for "Semua Produk" badge
  const countRes = await getTotalProductsCount();
  const totalProducts = countRes.success ? countRes.data : 0;

  // Create a unique key for Suspense based on URL params so it re-triggers the fallback
  const suspenseKey = JSON.stringify(params);

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="container mx-auto px-4 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-primary-green transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-bold">Katalog Produk</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar (Filters & Categories) */}
          <div className="lg:col-span-1">
            <ShopFilters categories={categories || []} totalProducts={totalProducts} />
          </div>

          {/* Right Content (Product Grid wrapped in Suspense) */}
          <div className="lg:col-span-3">
            <Suspense key={suspenseKey} fallback={<ProductGridSkeleton />}>
              <ProductGridServer 
                categoryId={categoryId}
                productForms={productForms}
                minPrice={minPrice}
                maxPrice={maxPrice}
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
