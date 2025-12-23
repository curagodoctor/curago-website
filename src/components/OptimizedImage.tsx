import React, { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;      // Required for LCP optimization
  height: number;     // Required for LCP optimization
  className?: string;
  priority?: boolean; // Set true for above-the-fold/LCP images
}

/**
 * Optimized Image Component
 *
 * Features:
 * - WebP format with PNG/JPG fallback
 * - Lazy loading by default (eager for priority images)
 * - Explicit dimensions to prevent layout shift
 * - Smooth fade-in on load
 *
 * Usage:
 * <OptimizedImage
 *   src="/image.png"
 *   alt="Description"
 *   width={800}
 *   height={600}
 *   priority={true}  // Only for LCP/hero images!
 * />
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Convert .png/.jpg to .webp
  const webpSrc = src.replace(/\.(png|jpg|jpeg)$/, '.webp');

  useEffect(() => {
    // Preload priority images
    if (priority) {
      const img = new Image();
      img.src = src;
    }
  }, [src, priority]);

  return (
    <picture>
      {/* WebP version for modern browsers (60-80% smaller) */}
      <source srcSet={webpSrc} type="image/webp" />

      {/* Fallback for older browsers */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setIsLoaded(true)}
        style={{
          // Prevent layout shift by reserving space
          aspectRatio: `${width} / ${height}`,
        }}
      />
    </picture>
  );
}
