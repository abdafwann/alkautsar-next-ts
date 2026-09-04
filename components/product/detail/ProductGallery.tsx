'use client';

import { useState } from 'react';
import Image from 'next/image';
import { SquaresFour } from '@phosphor-icons/react';

interface ProductGalleryProps {
  title: string;
  images: { id?: string; url: string; publicId?: string }[];
  isOutOfStock: boolean;
}

/*
 * Galeri foto modular dirancang dengan rasio simetris 348px x 348px 
 * yang dilengkapi optical zoom pada desktop dan baris thumbnail navigasi cepat di bawahnya
 */
export default function ProductGallery({ title, images, isOutOfStock }: ProductGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHoveringZoom, setIsHoveringZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const activeImage = images[activeImageIndex]?.url || images[0]?.url || 'https://placehold.co/600x600/ffffff/00aa5b?text=Al-Kautsar+Herbal';

  /*
   * Kalkulasi persentase koordinat kursor kursor relatif terhadap dimensi kontainer 
   * untuk menggerakkan background lens zoom secara akurat tanpa manipulasi DOM berlebih
   */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div className="flex flex-col items-center lg:items-start gap-3">
      {/*
       * Kontainer foto utama edge-to-edge dengan kursor crosshair 
       * memberi sinyal ergonomis bahwa foto dapat diperbesar untuk memeriksa detail sediaan
       */}
      <div 
        className="relative w-[348px] h-[348px] max-w-full rounded-xl overflow-hidden cursor-crosshair group flex items-center justify-center bg-white border border-gray-200/90 shadow-2xs"
        onMouseEnter={() => setIsHoveringZoom(true)}
        onMouseLeave={() => setIsHoveringZoom(false)}
        onMouseMove={handleMouseMove}
      >
        {/*
         * Counter foto memperjelas jumlah sudut pandang foto sediaan yang tersedia untuk ditinjau
         */}
        <div className="absolute bottom-2.5 right-2.5 z-10 bg-black/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs">
          <SquaresFour size={12} weight="bold" />
          <span>{activeImageIndex + 1} / {images.length}</span>
        </div>

        {/*
         * Lapisan overlay gelap semi-transparan memberi kejelasan instan bila stok telah kosong 
         * sebelum pembeli mencoba memasukkan barang ke keranjang
         */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/85 z-20 flex items-center justify-center backdrop-blur-xs">
            <span className="bg-gray-900 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg shadow-md">
              Stok Habis
            </span>
          </div>
        )}

        <Image
          src={activeImage}
          alt={`${title} - Foto ${activeImageIndex + 1}`}
          fill
          priority
          sizes="348px"
          className={`object-contain p-2 transition-opacity duration-200 ${isHoveringZoom ? 'opacity-0' : 'opacity-100'}`}
        />

        {/*
         * Lensa zoom menggunakan background-image dengan pointer-events-none 
         * agar event mouse move tidak terinterupsi saat kursor bergerak cepat
         */}
        {isHoveringZoom && (
          <div 
            className="absolute inset-0 pointer-events-none transition-all duration-75"
            style={{
              backgroundImage: `url(${activeImage})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundSize: '220%',
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}
      </div>

      {/*
       * Baris thumbnail (60px x 60px) di bawah foto utama mempermudah navigasi alternatif foto produk
       */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 w-[348px] max-w-full overflow-x-auto pb-1">
          {images.map((img, idx) => {
            const isSelected = activeImageIndex === idx;

            return (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-[60px] h-[60px] rounded-lg overflow-hidden border-2 transition-all bg-white shrink-0 cursor-pointer ${
                  isSelected 
                    ? 'border-primary-green ring-1 ring-primary-green/30' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                title={`Foto ${idx + 1}`}
                aria-label={`Pilih foto ${idx + 1}`}
              >
                <Image
                  src={img.url}
                  alt={`${title} - Thumbnail ${idx + 1}`}
                  fill
                  sizes="60px"
                  className="object-contain p-1"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
