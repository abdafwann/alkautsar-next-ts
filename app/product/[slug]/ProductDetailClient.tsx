'use client';

import Link from 'next/link';
import { CaretRight } from '@phosphor-icons/react';
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

/*
 * Komponen orkestrator detail produk memusatkan state transaksi (kuantitas, mutasi keranjang, wishlist) 
 * agar sub-komponen tampilan tetap murni (presentational) dan mudah diuji secara modular
 */
export default function ProductDetailClient({ product, relatedProducts }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const addItem = useCartStore((s) => s.addItem);
  const wishlistItems = useWishlistStore((s) => s.items);
  const toggleWishlistStore = useWishlistStore((s) => s.toggleItem);

  const isWishlisted = wishlistItems.some((i) => i.id === product.id);

  /*
   * Normalisasi harga dan persentase promo dilakukan di level orkestrator 
   * agar seluruh komponen turunan menampilkan kalkulasi diskon yang identik
   */
  const originalPrice = Number(product.price);
  const promoPrice = product.promoPrice ? Number(product.promoPrice) : null;
  const currentPrice = promoPrice || originalPrice;
  const discountPercent = product.promoPercentage || (promoPrice ? Math.round(((originalPrice - promoPrice) / originalPrice) * 100) : 0);

  /*
   * Membatasi galeri foto maksimal 3 slot dan menyediakan placeholder resmi 
   * untuk menjaga rasio viewport dan menghindari layout shifting pada perangkat mobile
   */
  const productImages = product.images && product.images.length > 0
    ? product.images.slice(0, 3)
    : [{ url: 'https://placehold.co/600x600/ffffff/00aa5b?text=Al-Kautsar+Herbal' }];
  
  const primaryImage = productImages[0]?.url;

  const cartItems = useCartStore((s) => s.items);
  const currentInCart = cartItems.find((i) => i.id === product.id)?.quantity || 0;

  /*
   * Pengecekan limit stok memadukan kuantitas yang sudah ada di cart dengan kuantitas baru 
   * guna mencegah pesanan melebihi inventaris fisik yang tersedia
   */
  const handleAddToCart = () => {
    if (product.quantity < 1) {
      toast.error('Maaf, stok produk ini sedang habis.');
      return;
    }
    if (currentInCart + quantity > product.quantity) {
      const remainingToAdd = Math.max(0, product.quantity - currentInCart);
      if (remainingToAdd === 0) {
        toast.error(`Stok maksimal (${product.quantity} item) sudah ada di keranjang belanja Anda.`);
      } else {
        toast.error(`Stok tidak mencukupi. Anda hanya dapat menambahkan ${remainingToAdd} item lagi (${currentInCart} sudah di keranjang).`);
      }
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

  /*
   * Alur Beli Sekarang mengarahkan pelanggan langsung ke halaman checkout setelah item ditambahkan 
   * untuk memangkas friksi langkah konversi transaksi
   */
  const handleBuyNow = () => {
    if (product.quantity < 1) {
      toast.error('Maaf, stok produk ini sedang habis.');
      return;
    }
    if (quantity > product.quantity) {
      toast.error(`Stok tidak mencukupi. Stok tersedia: ${product.quantity}`);
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

  /*
   * Optimistic update pada local store dipadukan dengan sync asinkron ke database 
   * agar tombol wishlist merespons instan tanpa hambatan latensi jaringan
   */
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

  /*
   * Mendukung Web Share API bawaan perangkat mobile dengan fallback clipboard otomatis 
   * pada browser desktop guna memastikan tautan produk selalu dapat disalin dengan mulus
   */
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Cek produk herbal alami ${product.title} di PT. Al-Kautsar`,
          url: window.location.href,
        });
      } catch {
        // Dialog share dibatalkan oleh pengguna, tidak memerlukan tindakan fallback
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link produk berhasil disalin!');
    }
  };

  /*
   * Pesan konsultasi WhatsApp menyertakan konteks URL produk aktif 
   * agar tim herbalis dapat langsung merespons pertanyaan klinis pelanggan tanpa bertanya ulang
   */
  const handleWhatsAppConsultation = () => {
    const adminPhone = '6281234567890';
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const message = `Halo Herbalis PT. Al-Kautsar,\n\nSaya ingin konsultasi mengenai produk *${product.title}*.\n\nApakah cocok untuk keluhan kesehatan saya?\nLink produk: ${currentUrl}`;
    window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-[#fcfbf9] min-h-screen text-gray-900">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 md:py-5">
        
        {/*
         * Breadcrumb semantik berlatar netral memandu konteks kategori produk 
         * dengan ikon Phosphor CaretRight yang konsisten
         */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-primary-green transition-colors">Beranda</Link>
            <CaretRight size={12} weight="bold" className="text-gray-400 shrink-0" />
            <Link href="/shop" className="hover:text-primary-green transition-colors">Katalog Herbal</Link>
            {product.category && (
              <>
                <CaretRight size={12} weight="bold" className="text-gray-400 shrink-0" />
                <Link 
                  href={`/shop?categoryId=${product.categoryId}`} 
                  className="hover:text-primary-green transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <CaretRight size={12} weight="bold" className="text-gray-400 shrink-0" />
            <span className="text-gray-900 font-medium truncate max-w-[200px] md:max-w-md">{product.title}</span>
          </div>
        </nav>

        {/*
         * Layout 3 kolom membagi fokus visual menjadi: Galeri Foto (4 col), 
         * Lembar Informasi Klinis (5 col), dan Sticky Kotak Transaksi (3 col)
         */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          <div className="lg:col-span-4 flex flex-col items-center lg:items-start gap-3">
            <ProductGallery
              title={product.title}
              images={productImages}
              isOutOfStock={product.quantity < 1}
            />
          </div>

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

        <RelatedProductsSection relatedProducts={relatedProducts} />

      </main>

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
