'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Layers } from 'lucide-react';

interface ProductGalleryProps {
  title: string;
  images: { id?: string; url: string; publicId?: string }[];
  isOutOfStock: boolean;
}

/**
 * Isolated photo gallery component.
 * Adheres to standard e-commerce dimensions:
 * - 348px x 348px edge-to-edge unboxed main viewport with smooth optical zoom
 * - 60px x 60px thumbnail navigation row positioned directly below
 */
export default function ProductGallery({ title, images, isOutOfStock }: ProductGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHoveringZoom, setIsHoveringZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const activeImage = images[activeImageIndex]?.url || images[0]?.url || 'https://placehold.co/600x600/ffffff/00aa5b?text=Al-Kautsar+Herbal';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div className="flex flex-col items-center lg:items-start gap-3">
      {/* Main Photo (348px x 348px, Edge-to-Edge) */}
      <div 
        className="relative w-[348px] h-[348px] max-w-full rounded-lg overflow-hidden cursor-crosshair group flex items-center justify-center bg-transparent"
        onMouseEnter={() => setIsHoveringZoom(true)}
        onMouseLeave={() => setIsHoveringZoom(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Photo Counter Badge */}
        <div className="absolute bottom-2.5 right-2.5 z-10 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
          <Layers size={11} />
          <span>{activeImageIndex + 1} / {images.length}</span>
        </div>

        {/* Stock Out Notice */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-20 flex items-center justify-center">
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
          className={`object-contain rounded-lg transition-opacity duration-200 ${isHoveringZoom ? 'opacity-0' : 'opacity-100'}`}
        />

        {/* Smooth Zoom Magnifier Layer */}
        {isHoveringZoom && (
          <div 
            className="absolute inset-0 pointer-events-none transition-all duration-75 rounded-lg"
            style={{
              backgroundImage: `url(${activeImage})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundSize: '220%',
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}
      </div>

      {/* Thumbnails Row: Standard 60px x 60px directly below */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 w-[348px] max-w-full">
          {images.map((img, idx) => {
            const isSelected = activeImageIndex === idx;

            return (
              <button
                key={img.id || idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-[60px] h-[60px] rounded-lg overflow-hidden border-2 transition-all bg-white shrink-0 cursor-pointer ${
                  isSelected 
                    ? 'border-[var(--color-primary-green)] ring-1 ring-[var(--color-primary-green)]/30' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                title={`Foto ${idx + 1}`}
              >
                <Image
                  src={img.url}
                  alt={`${title} - Thumbnail ${idx + 1}`}
                  fill
                  className="object-contain p-1"
                  sizes="60px"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
