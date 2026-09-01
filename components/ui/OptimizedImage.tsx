'use client';

import Image from 'next/image';
import { ComponentProps } from 'react';

interface OptimizedImageProps extends ComponentProps<typeof Image> {
  /** Cloudinary or external URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Responsive sizes for different breakpoints */
  responsive?: boolean;
}

/**
 * Optimized Image Component
 * - Uses Next.js Image for automatic optimization
 * - Supports Cloudinary URLs
 * - Lazy loading by default
 * - Responsive sizes preset for e-commerce
 */
export default function OptimizedImage({
  src,
  alt,
  responsive = false,
  sizes,
  className,
  fill,
  priority,
  ...props
}: OptimizedImageProps) {
  // Default sizes for responsive images in grid layouts
  const defaultSizes = responsive
    ? '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
    : sizes;

  // Priority loading for above-the-fold images
  const shouldPriority = priority ?? false;

  return (
    <Image
      src={src}
      alt={alt}
      sizes={defaultSizes}
      priority={shouldPriority}
      className={className}
      fill={fill}
      {...props}
    />
  );
}

/**
 * Product Image Component
 * Preset for product card images
 */
export function ProductImage({
  src,
  alt,
  fill = true,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      priority={priority}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      className={`object-contain p-3 ${className || ''}`}
    />
  );
}

/**
 * Banner Image Component
 * Preset for hero banners and sliders
 */
export function BannerImage({
  src,
  alt,
  fill = true,
  className,
  priority = true,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      priority={priority}
      sizes="100vw"
      className={`object-cover ${className || ''}`}
    />
  );
}

/**
 * Thumbnail Image Component
 * Preset for small images (gallery thumbs, avatars)
 */
export function ThumbnailImage({
  src,
  alt,
  fill = true,
  className,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      priority={false}
      sizes="80px"
      className={`object-cover ${className || ''}`}
    />
  );
}
