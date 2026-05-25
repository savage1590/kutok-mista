"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

interface ProductGalleryProps {
  images: { id: string; image_url: string; is_primary: boolean }[];
  alt: string;
  badges?: React.ReactNode;
  imageFit?: "cover" | "contain";
}

export default function ProductGallery({ images, alt, badges, imageFit = "cover" }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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

  const sortedImages = [...images].sort((a, b) => (a.is_primary ? -1 : b.is_primary ? 1 : 0));
  const activeImage = sortedImages[activeIndex];
  const fitClass = imageFit === "contain" ? "object-contain" : "object-cover";

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : sortedImages.length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveIndex((prev) => (prev < sortedImages.length - 1 ? prev + 1 : 0));
  };

  // Close lightbox on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (isLightboxOpen) {
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, sortedImages.length]);

  return (
    <>
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div 
        className={`group rounded-3xl overflow-hidden bg-gray-50 aspect-[4/5] md:aspect-square relative flex items-center justify-center cursor-zoom-in ${imageFit === 'contain' ? 'p-4' : ''}`}
        onClick={() => setIsLightboxOpen(true)}
      >
        <img 
          src={activeImage?.image_url} 
          alt={alt} 
          className={`${fitClass} w-full h-full transition-opacity duration-300`}
        />
        
        {/* Badges Overlay */}
        <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
          {badges}
        </div>

        {/* Hover zoom icon indicator */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-white/90 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 shadow-sm">
            <ZoomIn className="w-6 h-6 text-gray-800" />
          </div>
        </div>

        {/* Arrows */}
        {sortedImages.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md z-20"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md z-20"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {sortedImages.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(idx)}
              className={`relative flex-shrink-0 w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border-2 transition-all ${
                activeIndex === idx ? "border-brand" : "border-transparent hover:border-gray-300"
              }`}
            >
              <img 
                src={img.image_url} 
                alt={`${alt} thumbnail ${idx + 1}`} 
                className={`${fitClass} w-full h-full`}
              />
            </button>
          ))}
        </div>
      )}
    </div>

    {/* Lightbox Modal */}
    {isLightboxOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm">
        <button 
          onClick={() => setIsLightboxOpen(false)}
          className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-50"
        >
          <X className="w-8 h-8" />
        </button>

        {sortedImages.length > 1 && (
          <button 
            onClick={handlePrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors z-50"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {sortedImages.length > 1 && (
          <button 
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors z-50"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}

        <div className="w-full h-full p-4 md:p-12 flex items-center justify-center max-w-7xl mx-auto">
          <img 
            src={activeImage?.image_url} 
            alt={alt} 
            className="max-w-full max-h-full object-contain select-none"
            onClick={(e) => e.stopPropagation()} // Prevent clicking image from closing
          />
        </div>
        
        {/* Thumbnails in lightbox */}
        {sortedImages.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center px-4">
            <div className="flex gap-2 p-2 bg-black/50 backdrop-blur-md rounded-2xl max-w-full overflow-x-auto scrollbar-hide">
              {sortedImages.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    activeIndex === idx ? "border-white" : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <img 
                    src={img.image_url} 
                    alt="thumbnail" 
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
    </>
  );
}
