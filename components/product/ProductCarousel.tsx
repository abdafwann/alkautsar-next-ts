import { getProducts } from '@/app/actions/catalog';
import ProductCarouselClient from './ProductCarouselClient';

export default async function ProductCarousel() {
  const response = await getProducts();
  const products = response.success ? response.data || [] : [];
  const latestProducts = products.slice(0, 8);
  return <ProductCarouselClient products={latestProducts} title="Best Sellers" />;
}
