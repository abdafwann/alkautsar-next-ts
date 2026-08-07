'use client';

import Link from 'next/link';
import { Plus, Check, Headset, Truck, Percent, CreditCard, Heart, Minus, MessageSquare, Share2 } from 'lucide-react';
import { useState } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { useCartStore } from '@/store/useCartStore';
import { useToastStore } from '@/components/ui/ToastContainer';
import { useRouter } from 'next/navigation';

export default function ProductDetailClient({ product, relatedProducts }: { product: any, relatedProducts: any[] }) {
  const [activeTab, setActiveTab] = useState('Description');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Magnifier State
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });

  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);
  const router = useRouter();

  // Price Calculation
  const originalPrice = Number(product.price);
  const promoPrice = product.isPromo && product.promoPrice ? Number(product.promoPrice) : null;
  const currentPrice = promoPrice || originalPrice;
  
  const formattedOriginalPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(originalPrice);
  const formattedPromoPrice = promoPrice ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(promoPrice) : null;
  const formattedSubtotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(currentPrice * quantity);

  // Images
  const images = product.images.length > 0 ? product.images : [{ url: 'https://placehold.co/600x600/e2e8f0/64748b?text=No+Image' }];
  const activeImage = images[activeImageIndex].url;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ ...zoomStyle, display: 'none' });
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: currentPrice,
      originalPrice: originalPrice,
      discountPercentage: product.promoPercentage || 0,
      imageUrl: images[0].url,
      slug: product.slug,
    }, quantity);
    addToast(`${product.title} (${quantity}x) ditambahkan ke keranjang`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  const handleWhatsAppChat = () => {
    const adminPhone = '6281234567890'; // Ganti dengan nomor WhatsApp Admin yang sebenarnya
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const message = `Halo Admin PT. Al-Kautsar,\n\nSaya tertarik dengan produk *${product.title}*.\n\nApakah stoknya masih tersedia sejumlah ${quantity} buah?\n\nLink Produk: ${currentUrl}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${adminPhone}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="bg-slate-50 relative overflow-hidden">
      {/* Mesh Gradient Blobs */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary-green/10 to-transparent z-0 pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-green/20 rounded-full blur-[100px] z-0 pointer-events-none"></div>
      <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-[80px] z-0 pointer-events-none"></div>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="container mx-auto px-4 text-xs text-gray-500 flex gap-2">
          <Link href="/" className="hover:text-primary-green">Home</Link>
          <span>&gt;</span>
          <Link href={`/shop?categoryId=${product.categoryId}`} className="hover:text-primary-green">{product.category?.name || 'Kategori'}</Link>
          <span>&gt;</span>
          <span className="text-gray-900 font-medium">{product.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* Left Column: Image Gallery (Col span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Main Image with Magnifier */}
            <div 
              className="relative rounded-2xl p-6 flex items-center justify-center aspect-square shadow-sm overflow-hidden cursor-crosshair group bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-gray-50 border border-gray-100/50"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={activeImage}
                alt={product.title}
                className="max-h-full object-contain transition-opacity duration-300 group-hover:opacity-0"
              />
              {/* Zoom Layer */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  ...zoomStyle,
                  backgroundImage: `url(${activeImage})`,
                  backgroundSize: '250%', 
                  backgroundRepeat: 'no-repeat',
                }}
              />
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img: any, idx: number) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`bg-white shadow-sm rounded-xl p-2 aspect-square flex items-center justify-center cursor-pointer transition-all duration-300 ring-1 hover:ring-primary-green/50 ${activeImageIndex === idx ? 'ring-2 ring-primary-green shadow-md' : 'ring-gray-200'}`}
                  >
                    <img src={img.url} alt={`Thumb ${idx + 1}`} className="max-h-full object-contain" />
                  </div>
                ))}
              </div>
            )}

            {/* Sertifikasi */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-2">
              <h3 className="font-bold text-gray-900 mb-6">Sertifikasi</h3>
              <div className="flex justify-around items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-xs text-center p-2 leading-tight">
                  {product.certificate || 'BPOM'}
                </div>
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-xs text-center p-2 leading-tight">
                  Halal MUI
                </div>
              </div>
            </div>

          </div>

          {/* Middle Column: Product Info (Col span 5) */}
          <div className="lg:col-span-5 flex flex-col pt-4">
            
            {/* Card-ification for Info */}
            <div className="bg-white/70 backdrop-blur-xl p-6 lg:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative z-10 flex flex-col h-full">

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">{product.title}</h1>

            <div className="flex flex-wrap gap-3 mb-6">
              <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full">Bentuk: {product.productForm || 'Kapsul'}</span>
              <span className="bg-gray-100 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                <Check size={14} className="text-black" /> BPOM Certified
              </span>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-gray-200 via-gray-200 to-transparent mb-6"></div>

            {promoPrice ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-gray-400 line-through text-xl font-medium">{formattedOriginalPrice}</span>
                  <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-sm text-xs font-bold px-3 py-1 rounded-full animate-pulse">Hemat {product.promoPercentage}%</span>
                </div>
                <div className="text-[2rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-green to-[#00c96b] mb-6 leading-none">
                  {formattedPromoPrice}
                </div>
              </>
            ) : (
              <div className="text-[2rem] font-bold text-gray-900 mb-6 leading-none tracking-tight">
                {formattedOriginalPrice}
              </div>
            )}

            <div className="mb-6 flex items-center gap-1.5 text-sm">
              <span className="font-bold text-gray-900">Tags:</span>
              <span className="text-primary-green font-medium">{product.tags || product.category?.name}</span>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-gray-200 via-gray-200 to-transparent mb-6"></div>

            <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
              <h3 className="font-bold text-dark-green text-sm mb-1 uppercase tracking-wider">Khasiat & Kegunaan</h3>
              <p className="text-gray-700 font-medium leading-relaxed">{product.uses}</p>
            </div>

            {/* Tabs Section */}
            <div className="mt-8">
              <div className="flex flex-wrap gap-2 mb-4 bg-gray-50 p-1 rounded-full w-fit border border-gray-100">
                <button
                  onClick={() => setActiveTab('Description')}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'Description' ? 'bg-white shadow-sm text-primary-green' : 'text-gray-500 hover:text-gray-700 font-medium'}`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('Ingredients')}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'Ingredients' ? 'bg-white shadow-sm text-primary-green' : 'text-gray-500 hover:text-gray-700 font-medium'}`}
                >
                  Ingredients
                </button>
                <button
                  onClick={() => setActiveTab('Usage')}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'Usage' ? 'bg-white shadow-sm text-primary-green' : 'text-gray-500 hover:text-gray-700 font-medium'}`}
                >
                  Usage Instructions
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm min-h-[150px]">
                {activeTab === 'Description' && (
                  <p className="text-gray-800 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                    {product.uses || 'Belum ada deskripsi spesifik untuk produk ini. Hubungi admin untuk detail lebih lanjut.'}
                  </p>
                )}
                {activeTab === 'Ingredients' && (
                  <p className="text-gray-800 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                    {product.composition || 'Informasi komposisi tidak tersedia.'}
                  </p>
                )}
                {activeTab === 'Usage' && (
                  <p className="text-gray-800 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                    {product.directions || 'Gunakan sesuai dengan petunjuk pada kemasan atau anjuran dokter.'}
                    {product.warnings && (
                      <>
                        <br/><br/>
                        <strong>Peringatan:</strong><br/>
                        {product.warnings}
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>
            {/* End of Card-ification */}
            </div>
          </div>

          {/* Right Column: Trust & Certifications (Col span 3) */}
          <div className="lg:col-span-3 flex flex-col gap-6 pt-4">

            {/* Buy Card */}
            <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-green-900/5 border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Atur jumlah dan catatan</h3>

              <div className="flex items-center gap-3 mb-4">
                <img
                  src={images[0].url}
                  alt="Thumbnail"
                  className="w-12 h-12 object-contain rounded-lg border border-gray-100 p-1"
                />
                <span className="text-gray-800 font-medium text-sm line-clamp-2">{product.title}</span>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6"></div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-10 w-32 bg-gray-50/50">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors active:scale-95"><Minus size={16} /></button>
                  <input type="text" value={quantity} className="w-full text-center font-bold text-gray-900 border-none focus:ring-0 p-0 bg-transparent" readOnly />
                  <button onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))} className="w-10 h-full flex items-center justify-center text-primary-green hover:bg-gray-100 transition-colors active:scale-95"><Plus size={16} /></button>
                </div>
                <span className="text-gray-500 text-sm">Stok: <span className="font-bold text-gray-900">{product.quantity}</span></span>
              </div>

              <div className="flex justify-between items-end mb-6">
                <span className="text-gray-500">Subtotal</span>
                <div className="text-right">
                  {promoPrice && <div className="text-gray-400 line-through text-sm">{formattedOriginalPrice}</div>}
                  <div className="text-xl font-bold text-gray-900">{formattedSubtotal}</div>
                </div>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                <button onClick={handleAddToCart} className="bg-gradient-to-r from-primary-green to-[#00c96b] text-white font-bold rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30 w-full py-3 flex items-center justify-center gap-2 text-sm active:scale-95">
                  + Keranjang
                </button>
                <button onClick={handleBuyNow} className="bg-white border-2 border-primary-green text-primary-green font-bold rounded-xl transition-all duration-300 hover:bg-green-50 hover:-translate-y-0.5 w-full py-3 flex items-center justify-center text-sm active:scale-95">
                  Beli Langsung
                </button>
              </div>

              <div className="flex items-center justify-between px-2">
                <button onClick={handleWhatsAppChat} className="flex items-center gap-2 text-gray-500 hover:text-primary-green font-semibold text-xs transition-all hover:-translate-y-0.5">
                  <MessageSquare size={16} /> Chat
                </button>
                <div className="w-px h-4 bg-gray-200"></div>
                <button className="flex items-center gap-2 text-gray-500 hover:text-primary-green font-semibold text-xs transition-all hover:-translate-y-0.5">
                  <Heart size={16} /> Wishlist
                </button>
                <div className="w-px h-4 bg-gray-200"></div>
                <button className="flex items-center gap-2 text-gray-500 hover:text-primary-green font-semibold text-xs transition-all hover:-translate-y-0.5">
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>



            {/* Keunggulan Produk */}
            <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-6 text-center mt-4">Keunggulan Produk</h3>

              <div className="flex flex-col gap-6 mb-4">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Check size={24} className="text-gray-500" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Kualitas Produk Terjamin</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Kualitas produk terjamin, aman dengan standar teruji.</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Truck size={24} className="text-gray-500" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Free Ongkir</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">Free ongkir pulau jawa dengan syarat tidak memberatkan.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <hr className="border-gray-200" />
      </div>

      {/* Related Products Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Produk Terkait</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

          {relatedProducts.map((item) => (
            <ProductCard
              key={item.id}
              title={item.title}
              price={Number(item.price)}
              originalPrice={item.isPromo && item.promoPrice ? Number(item.price) : undefined}
              discountPercentage={item.promoPercentage || undefined}
              imageUrl={item.images?.[0]?.url || 'https://placehold.co/400'}
              slug={item.slug}
            />
          ))}

        </div>
      </div>

      {/* Value Proposition / Trust Badges Banner */}
      <div className="border-t border-gray-100 py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Headset size={32} className="text-gray-400" />
              <span className="font-bold text-gray-700 text-sm md:text-base leading-tight">Layanan<br />Penjualan</span>
            </div>
            <div className="flex items-center gap-3">
              <Truck size={32} className="text-gray-400" />
              <span className="font-bold text-gray-700 text-sm md:text-base leading-tight">Instant<br />Delivery</span>
            </div>
            <div className="flex items-center gap-3">
              <Percent size={32} className="text-gray-400" />
              <span className="font-bold text-gray-700 text-sm md:text-base leading-tight">Promo<br />Bulanan</span>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard size={32} className="text-gray-400" />
              <span className="font-bold text-gray-700 text-sm md:text-base leading-tight">Pembayaran<br />Online</span>
            </div>
            <div className="flex items-center gap-3">
              <Truck size={32} className="text-gray-400" />
              <span className="font-bold text-gray-700 text-sm md:text-base leading-tight">Free<br />Ongkir</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
