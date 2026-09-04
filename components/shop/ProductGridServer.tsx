import Link from 'next/link';
import { CaretLeft, CaretRight, Funnel } from '@phosphor-icons/react/dist/ssr';
import ProductCard from '@/components/product/ProductCard';
import ShopSorting from '@/components/shop/ShopSorting';
import { getShopProducts } from '@/app/actions/catalog';

interface ProductGridServerProps {
  query?: string;
  categoryId?: string;
  productForms: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page: number;
  sort?: string;
}

export default async function ProductGridServer({
  query,
  categoryId,
  productForms,
  minPrice,
  maxPrice,
  inStock,
  page,
  sort
}: ProductGridServerProps) {
  // Fetch filtered products (this is the slow part that will trigger Suspense)
  const productsRes = await getShopProducts({
    query,
    categoryId,
    productForms,
    minPrice,
    maxPrice,
    inStock,
    page,
    sort
  });
  
  const products = productsRes.success ? (productsRes.data || []) : [];
  const pagination = productsRes.success ? productsRes.pagination : null;
  const totalFilteredProducts = pagination?.totalProducts || products.length;
  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.currentPage || 1;

  // Helper function to build pagination URLs
  const buildPageUrl = (newPage: number) => {
    const currentParams = new URLSearchParams();
    if (query) currentParams.set('q', query);
    if (categoryId) currentParams.set('categoryId', categoryId);
    if (minPrice) currentParams.set('minPrice', minPrice.toString());
    if (maxPrice) currentParams.set('maxPrice', maxPrice.toString());
    if (inStock) currentParams.set('inStock', 'true');
    if (sort) currentParams.set('sort', sort);
    productForms.forEach(f => currentParams.append('form', f));
    currentParams.set('page', newPage.toString());
    return `/shop?${currentParams.toString()}`;
  };

  return (
    <div className="flex flex-col">
      {/* Header / Sorting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-base font-semibold text-gray-700">
            {totalFilteredProducts} Produk Ditemukan
          </h1>
          {query && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Hasil pencarian untuk: <strong className="text-gray-900">&quot;{query}&quot;</strong></span>
              <Link 
                href="/shop" 
                className="text-primary-green hover:underline font-semibold transition-colors"
              >
                Hapus pencarian
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Urutkan:</span>
          <ShopSorting />
        </div>
      </div>

      {/* Product Grid - fixed row height allows expansion to float over neighbors */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4" style={{ gridAutoRows: '320px' }}>
        {products.length > 0 ? (
          products.map((product: any) => {
            const isPromoActive = Boolean(
              product.isPromo &&
              product.promoPrice &&
              (!product.promoExpiry || new Date(product.promoExpiry) >= new Date())
            );

            return (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={isPromoActive ? product.promoPrice : product.price}
                originalPrice={isPromoActive ? product.price : undefined}
                discountPercentage={isPromoActive ? product.promoPercentage : undefined}
                imageUrl={product.images && product.images.length > 0 ? product.images[0].url : 'https://placehold.co/400x400?text=No+Image'}
                slug={product.slug}
                productForm={product.productForm}
                quantity={product.quantity}
              />
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-dashed border-gray-200">
            <Funnel className="text-gray-300 mb-4" size={48} weight="duotone" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Tidak ada produk</h3>
            <p className="text-gray-500 text-sm">
              {query 
                ? `Maaf, tidak ada produk yang cocok dengan pencarian "${query}".`
                : 'Maaf, tidak ada produk yang cocok dengan filter pencarian Anda.'}
            </p>
            <Link href="/shop" className="mt-6 text-primary-green font-bold hover:underline text-sm">
              Reset Filter
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <div className="flex gap-2">
            <Link 
              href={currentPage > 1 ? buildPageUrl(currentPage - 1) : '#'}
              className={`w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center transition-colors ${currentPage <= 1 ? 'text-gray-300 pointer-events-none' : 'text-gray-500 hover:bg-gray-50 hover:text-primary-green'}`}
              aria-label="Halaman sebelumnya"
            >
              <CaretLeft size={16} weight="bold" />
            </Link>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link
                key={pageNum}
                href={buildPageUrl(pageNum)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-2xs font-bold transition-all ${
                  currentPage === pageNum 
                    ? 'bg-primary-green text-white' 
                    : 'border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-primary-green'
                }`}
              >
                {pageNum}
              </Link>
            ))}
            
            <Link 
              href={currentPage < totalPages ? buildPageUrl(currentPage + 1) : '#'}
              className={`w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center transition-colors ${currentPage >= totalPages ? 'text-gray-300 pointer-events-none' : 'text-gray-500 hover:bg-gray-50 hover:text-primary-green'}`}
              aria-label="Halaman berikutnya"
            >
              <CaretRight size={16} weight="bold" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
