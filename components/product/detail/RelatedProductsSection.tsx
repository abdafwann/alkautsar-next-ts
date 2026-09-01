import Link from 'next/link';
import { ChevronRight, PackageOpen } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';

export interface RelatedProductItem {
  id: string;
  title: string;
  price: number | string;
  promoPrice?: number | string | null;
  promoPercentage?: number | null;
  images?: { url: string }[];
  slug: string;
  productForm?: string | null;
}

interface RelatedProductsSectionProps {
  relatedProducts: RelatedProductItem[];
}

/**
 * Curated related products shelf.
 * If zero matching items exist, renders an engaging empty state with catalogue redirection
 * rather than an awkward empty gap.
 */
export default function RelatedProductsSection({ relatedProducts }: RelatedProductsSectionProps) {
  const hasProducts = relatedProducts && relatedProducts.length > 0;

  return (
    <section className="mt-8 md:mt-10 pt-6 pb-6 border-t border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base md:text-lg font-extrabold text-gray-900 tracking-tight">
            Pilihan Herbal Terkait
          </h2>
          <p className="text-xs text-gray-500">
            Produk kesehatan dengan manfaat sinergis untuk mengoptimalkan pemulihan Anda
          </p>
        </div>
        {hasProducts && (
          <Link 
            href="/shop" 
            className="text-xs font-bold text-[var(--color-primary-green)] hover:underline flex items-center gap-0.5"
          >
            Lihat Semua <ChevronRight size={13} />
          </Link>
        )}
      </div>

      {hasProducts ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {relatedProducts.map((item) => (
            <ProductCard
              key={item.id}
              id={item.id}
              title={item.title}
              price={Number(item.price)}
              originalPrice={item.promoPrice ? Number(item.price) : undefined}
              discountPercentage={item.promoPercentage || undefined}
              imageUrl={item.images?.[0]?.url || 'https://placehold.co/400'}
              slug={item.slug}
              productForm={item.productForm}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 text-center flex flex-col items-center justify-center gap-2.5 my-2 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-[var(--color-primary-green)] flex items-center justify-center">
            <PackageOpen size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Belum Ada Produk Terkait</h3>
            <p className="text-xs text-gray-500 max-w-md mt-0.5 leading-relaxed">
              Saat ini belum ada produk herbal lain dalam kategori yang sama. Temukan ragam produk herbal alami berkualitas lainnya di katalog lengkap kami.
            </p>
          </div>
          <Link
            href="/shop"
            className="mt-1 inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[var(--color-primary-green)] hover:bg-[var(--color-primary-green-hover)] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            Jelajahi Katalog Herbal <ChevronRight size={14} />
          </Link>
        </div>
      )}
    </section>
  );
}
