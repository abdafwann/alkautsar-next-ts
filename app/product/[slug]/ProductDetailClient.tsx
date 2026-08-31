'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { toggleDbWishlist } from '@/app/actions/wishlist';

import ProductGallery from '@/components/product/detail/ProductGallery';
import ProductClinicalInfo from '@/components/product/detail/ProductClinicalInfo';
import ProductPurchaseBox from '@/components/product/detail/ProductPurchaseBox';
import RelatedProductsSection, { RelatedProductItem } from '@/components/product/detail/RelatedProductsSection';
import ProductMobileActionBar from '@/components/product/detail/ProductMobileActionBar';

export interface ProductDetailProps {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    promoPrice: number | null;
    isPromo?: boolean | null;
    promoPercentage?: number | null;
    quantity: number;
    sold?: number | null;
    categoryId: string;
    category?: { id: string; name: string; slug?: string } | null;
    images: { id?: string; url: string; publicId?: string }[];
    uses?: string | null;
    composition?: string | null;
    directions?: string | null;
    warnings?: string | null;
    certificate?: string | null;
    productForm?: string | null;
    tags?: string | null;
  };
  relatedProducts: RelatedProductItem[];
}

/**
 * Main Product Details Page Orchestrator.
 * Delegates visual concerns to modular single-responsibility components in @/components/product/detail/.
 */
export default function ProductDetailClient({ product, relatedProducts }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const addItem = useCartStore((s) => s.addItem);
  const wishlistItems = useWishlistStore((s) => s.items);
  const toggleWishlistStore = useWishlistStore((s) => s.toggleItem);

  const isWishlisted = wishlistItems.some((i) => i.id === product.id);

  // Price calculations
  const originalPrice = Number(product.price);
  const promoPrice = product.promoPrice ? Number(product.promoPrice) : null;
  const currentPrice = promoPrice || originalPrice;
  const discountPercent = product.promoPercentage || (promoPrice ? Math.round(((originalPrice - promoPrice) / originalPrice) * 100) : 0);

  // Accommodate up to 3 gallery photos
  const productImages = product.images && product.images.length > 0
    ? product.images.slice(0, 3)
    : [{ url: 'https://placehold.co/600x600/ffffff/00aa5b?text=Al-Kautsar+Herbal' }];
  
  const primaryImage = productImages[0]?.url;

  const handleAddToCart = () => {
    if (product.quantity < 1) {
      toast.error('Maaf, stok produk ini sedang habis.');
      return;
    }
    addItem({
      id: product.id,
      title: product.title,
      price: currentPrice,
      originalPrice: promoPrice ? originalPrice : undefined,
      discountPercentage: discountPercent > 0 ? discountPercent : undefined,
      imageUrl: primaryImage,
      slug: product.slug,
    }, quantity);
    toast.success(`${quantity}x ${product.title} ditambahkan ke keranjang`);
  };

  const handleBuyNow = () => {
    if (product.quantity < 1) {
      toast.error('Maaf, stok produk ini sedang habis.');
      return;
    }
    addItem({
      id: product.id,
      title: product.title,
      price: currentPrice,
      originalPrice: promoPrice ? originalPrice : undefined,
      discountPercentage: discountPercent > 0 ? discountPercent : undefined,
      imageUrl: primaryImage,
      slug: product.slug,
    }, quantity);
    router.push('/cart');
  };

  const handleToggleWishlist = async () => {
    toggleWishlistStore({
      id: product.id,
      title: product.title,
      price: currentPrice,
      originalPrice: promoPrice ? originalPrice : undefined,
      discountPercentage: discountPercent > 0 ? discountPercent : undefined,
      imageUrl: primaryImage,
      slug: product.slug,
    });
    await toggleDbWishlist(product.id);
    toast.success(isWishlisted ? 'Dihapus dari wishlist' : 'Disimpan ke wishlist');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Cek produk herbal alami ${product.title} di PT. Al-Kautsar`,
          url: window.location.href,
        });
      } catch {
        // User dismissed native share sheet
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link produk berhasil disalin!');
    }
  };

  const handleWhatsAppConsultation = () => {
    const adminPhone = '6281234567890';
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const message = `Halo Herbalis PT. Al-Kautsar,\n\nSaya ingin konsultasi mengenai produk *${product.title}*.\n\nApakah cocok untuk keluhan kesehatan saya?\nLink produk: ${currentUrl}`;
    window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen text-[#1a1a1a]">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 md:py-4">
        
        {/* 1. Seamless Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-3.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-[var(--color-primary-green)] transition-colors">Beranda</Link>
            <ChevronRight size={13} className="text-gray-400 shrink-0" />
            <Link href="/shop" className="hover:text-[var(--color-primary-green)] transition-colors">Katalog Herbal</Link>
            {product.category && (
              <>
                <ChevronRight size={13} className="text-gray-400 shrink-0" />
                <Link 
                  href={`/shop?categoryId=${product.categoryId}`} 
                  className="hover:text-[var(--color-primary-green)] transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight size={13} className="text-gray-400 shrink-0" />
            <span className="text-gray-900 font-medium truncate max-w-[200px] md:max-w-md">{product.title}</span>
          </div>
        </nav>

        {/* 2. Main 3-Column Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">

          {/* Left Column: Direct Gallery (Col Span 4) */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start gap-3">
            <ProductGallery
              title={product.title}
              images={productImages}
              isOutOfStock={product.quantity < 1}
            />
          </div>

          {/* Middle Column: Paper Container for Clinical Details (Col Span 5) */}
          <div className="lg:col-span-5 flex flex-col">
            <ProductClinicalInfo
              categoryName={product.category?.name}
              title={product.title}
              originalPrice={originalPrice}
              promoPrice={promoPrice}
              discountPercent={discountPercent}
              productForm={product.productForm}
              certificate={product.certificate}
              uses={product.uses}
              composition={product.composition}
              directions={product.directions}
              warnings={product.warnings}
            />
          </div>

          {/* Right Column: Sticky Purchase Action Card (Col Span 3) */}
          <div className="lg:col-span-3 flex flex-col">
            <ProductPurchaseBox
              quantity={quantity}
              maxStock={product.quantity}
              unitPrice={currentPrice}
              originalPrice={promoPrice ? originalPrice : undefined}
              isWishlisted={isWishlisted}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onToggleWishlist={handleToggleWishlist}
              onShare={handleShare}
              onConsultation={handleWhatsAppConsultation}
            />
          </div>

        </div>

        {/* 3. Related Products Shelf (With Empty State Fallback) */}
        <RelatedProductsSection relatedProducts={relatedProducts} />

      </main>

      {/* 4. Mobile Fixed Bottom Action Bar */}
      <ProductMobileActionBar
        isOutOfStock={product.quantity < 1}
        isWishlisted={isWishlisted}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onToggleWishlist={handleToggleWishlist}
        onConsultation={handleWhatsAppConsultation}
      />
    </div>
  );
}
