'use client';

// Section 1: Original Homepage Hero
import HomeHeroClient from '@/components/store/HomeHeroClient';

// Sections 2 - 6: Redesigned V2 Components
import FeaturedCategoriesV2 from './FeaturedCategoriesV2';
import FlashSaleSectionV2 from './FlashSaleSectionV2';
import HealthFocusExplorer from './HealthFocusExplorer';
import ProductCarouselV2 from './ProductCarouselV2';
import WhyAlKautsarBento from './WhyAlKautsarBento';
import HealthArticlesV2 from './HealthArticlesV2';

interface HomeClient2Props {
  storeName: string;
  bannerUrl: string;
  categories: any[];
  allCategories?: any[];
  products: any[];
  flashSaleProducts: any[];
}

/**
 * /homeclient Sections Breakdown (1 - 7):
 * - Section 1: Original HomeHeroClient (Hero Banner)
 * - Section 2: FeaturedCategoriesV2 (Editorial Category Gallery)
 * - Section 3: FlashSaleSectionV2 (Live Countdown + Promo Shelf)
 * - Section 4: HealthFocusExplorer (Interactive Category & Health Focus Solution Explorer)
 * - Section 5: ProductCarouselV2 (Best Sellers Catalog)
 * - Section 6: WhyAlKautsarBento (TasteSkill v2 Asymmetrical Bento Grid Trust Story)
 * - Section 7: HealthArticlesV2 (Edukasi & Artikel Kesehatan Herbal)
 */
export default function HomeClient2({
  storeName,
  bannerUrl,
  categories,
  allCategories,
  products,
  flashSaleProducts,
}: HomeClient2Props) {
  return (
    <main className="min-h-screen bg-white">
      {/* Section 1: Original Homepage Hero */}
      <HomeHeroClient storeName={storeName} bannerUrl={bannerUrl} />

      {/* Section 2: Featured Categories (Editorial Gallery) */}
      <FeaturedCategoriesV2 categories={categories} />

      {/* Section 3: Flash Sale Promo Spotlight */}
      <FlashSaleSectionV2 products={flashSaleProducts} />

      {/* Section 4: Interactive Category Solution Explorer with Real DB Categories */}
      <HealthFocusExplorer categories={allCategories || categories} products={products} />

      {/* Section 5: Best Sellers Product Carousel */}
      <ProductCarouselV2 products={products} title="Produk Terlaris" />

      {/* Section 6: Standar Mutu & Bento Grid Keunggulan Fitofarmaka */}
      <WhyAlKautsarBento />

      {/* Section 7: Edukasi & Artikel Kesehatan Herbal */}
      <HealthArticlesV2 />
    </main>
  );
}
