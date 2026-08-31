import ProductCarousel from '@/components/product/ProductCarousel';
import HomeHero from '@/components/store/HomeHero';
import FeaturedCategories from '@/components/store/FeaturedCategories';
import WhyChooseUsClient from '@/components/store/WhyChooseUsClient';
import FlashSaleSection from '@/components/store/FlashSaleSection';
import TestimonialClient from '@/components/store/TestimonialClient';

export default async function Home() {
  return (
    <>
      <HomeHero />
      <FeaturedCategories />
      <FlashSaleSection />
      <ProductCarousel />
      <WhyChooseUsClient />
      <TestimonialClient />
    </>
  );
}
