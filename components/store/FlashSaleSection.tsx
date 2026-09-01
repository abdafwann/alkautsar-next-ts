import { getProducts } from '@/app/actions/catalog';
import FlashSaleSectionClient from './FlashSaleSectionClient';

export default async function FlashSaleSection() {
  const response = await getProducts();
  const allProducts = response.success ? response.data || [] : [];

  // Filter only products with active flash sale (has promoPrice AND not expired)
  const now = new Date();
  const flashSaleProducts = allProducts.filter((product: any) => {
    const hasPromoPrice = product.promoPrice && product.promoPrice < product.price;
    const hasValidExpiry = product.promoExpiry && new Date(product.promoExpiry) > now;
    return hasPromoPrice && hasValidExpiry;
  });

  return <FlashSaleSectionClient products={flashSaleProducts} />;
}
