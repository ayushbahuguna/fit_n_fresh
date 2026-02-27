'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeImages = images.length > 0 ? images : ['/placeholder-product.jpg'];

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface-muted">
        <Image
          src={safeImages[activeIndex]}
          alt={`${productName} — view ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {/* Thumbnails — only rendered when there are multiple images */}
      {safeImages.length > 1 && (
        <div
          role="list"
          aria-label="Product image thumbnails"
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
        >
          {safeImages.map((src, index) => (
            <button
              key={index}
              role="listitem"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              aria-pressed={activeIndex === index}
              className={cn(
                'relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                activeIndex === index
                  ? 'border-primary shadow-sm'
                  : 'border-surface-border hover:border-primary-light',
              )}
            >
              <Image
                src={src}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
