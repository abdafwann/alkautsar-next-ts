import { Metadata } from 'next';
import { getActiveBanner, getFeaturedCategories } from '@/app/actions/store-frontend';
import { getProducts, getCategories } from '@/app/actions/catalog';
import HomeClient2 from '@/components/home/v2/HomeClient2';

export const metadata: Metadata = {
  title: 'Al-Kautsar Herbal Indonesia | Solusi Sehat Alami Keluarga',
  description: 'Formula obat herbal terstandar resmi BPOM & Halal MUI untuk mengatasi asam urat, gula darah, lambung, dan stamina secara aman tanpa efek samping kimia.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  // 1. Fetch Banner Data
  const bannerRes = await getActiveBanner();
  const bannerUrl = bannerRes.success && bannerRes.data?.bannerUrl
    ? bannerRes.data.bannerUrl
    : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1200';
  const storeName = bannerRes.success && bannerRes.data?.storeName
    ? bannerRes.data.storeName
    : 'Al-Kautsar Herbal';

  // 2. Fetch Featured Categories (Top 3 for Section 2) & All Categories (for Section 4)
  const [featuredCatRes, allCatRes] = await Promise.all([
    getFeaturedCategories(3),
    getCategories(),
  ]);

  let featuredCategories = featuredCatRes.success && featuredCatRes.data ? featuredCatRes.data : [];
  if (featuredCategories.length === 0) {
    featuredCategories = [
      { id: 'cat-1', name: 'Herbal Alami', description: 'Koleksi produk herbal murni tanpa campuran bahan kimia.' } as any,
      { id: 'cat-2', name: 'Perawatan Tubuh', description: 'Nutrisi dan perawatan untuk kesehatan kulit dan tubuh.' } as any,
      { id: 'cat-3', name: 'Suplemen Kesehatan', description: 'Suplemen harian untuk menjaga vitalitas dan imunitas.' } as any,
    ];
  }

  const allCategories = allCatRes.success && allCatRes.data ? allCatRes.data : featuredCategories;

  // 3. Fetch All Products
  const prodRes = await getProducts();
  const allProducts = prodRes.success && prodRes.data ? prodRes.data : [];

  // Filter flash sale products (has valid promo price or isPromo flag & not expired)
  const now = new Date();
  const flashSaleProducts = allProducts.filter((product: any) => {
    const isPromoActive = product.isPromo === true;
    const hasPromoPrice = product.promoPrice && Number(product.promoPrice) < Number(product.price);
    const hasValidExpiry = !product.promoExpiry || new Date(product.promoExpiry) >= now;
    return (isPromoActive || hasPromoPrice) && hasValidExpiry;
  });

  return (
    <HomeClient2
      storeName={storeName}
      bannerUrl={bannerUrl}
      categories={featuredCategories}
      allCategories={allCategories}
      products={allProducts}
      flashSaleProducts={flashSaleProducts}
    />
  );
}
