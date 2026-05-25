"use client";

import { useState } from "react";

interface ProductGalleryProps {
  images: { id: string; image_url: string; is_primary: boolean }[];
  alt: string;
  badges?: React.ReactNode;
}

export default function ProductGallery({ images, alt, badges }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // If no images at all
  if (!images || images.length === 0) {
    return (
      <div className="rounded-3xl overflow-hidden bg-gray-50 aspect-[4/5] md:aspect-square relative flex items-center justify-center">
        <span className="text-gray-300">No Image</span>
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          {badges}
        </div>
      </div>
    );
  }

  // Sort images: primary first
  const sortedImages = [...images].sort((a, b) => (a.is_primary ? -1 : b.is_primary ? 1 : 0));
  const activeImage = sortedImages[activeIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="rounded-3xl overflow-hidden bg-gray-50 aspect-[4/5] md:aspect-square relative flex items-center justify-center">
        <img 
          src={activeImage?.image_url} 
          alt={alt} 
          className="object-cover w-full h-full transition-opacity duration-300"
        />
        
        {/* Badges Overlay */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          {badges}
        </div>
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {sortedImages.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(idx)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                activeIndex === idx ? "border-brand" : "border-transparent hover:border-gray-300"
              }`}
            >
              <img 
                src={img.image_url} 
                alt={`${alt} thumbnail ${idx + 1}`} 
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
