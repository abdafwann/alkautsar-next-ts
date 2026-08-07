'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: { id: string; url: string; publicId: string }[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });

  // Jika tidak ada gambar, tampilkan placeholder
  const activeImage = images.length > 0 ? images[activeIndex].url : 'https://placehold.co/600x600/e2e8f0/64748b?text=No+Image';

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

  return (
    <div className="flex flex-col gap-4">
      {/* Gambar Utama dengan Magnifier */}
      <div 
        className="relative w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden cursor-crosshair group border border-gray-100"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={activeImage}
          alt={title}
          fill
          className="object-cover transition-opacity duration-300 group-hover:opacity-0"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        {/* Layer Zoom */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            ...zoomStyle,
            backgroundImage: `url(${activeImage})`,
            backgroundSize: '200%', // tingkat zoom
            backgroundRepeat: 'no-repeat',
          }}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-20 aspect-square rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                activeIndex === idx ? 'border-primary-green scale-105' : 'border-transparent hover:border-gray-200'
              }`}
            >
              <Image
                src={img.url}
                alt={`${title} - Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
