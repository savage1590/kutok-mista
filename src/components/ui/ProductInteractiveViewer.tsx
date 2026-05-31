"use client";

import { useState } from "react";
import ProductGallery from "./ProductGallery";
import InteractiveProductForm from "./InteractiveProductForm";

export default function ProductInteractiveViewer({
  product,
  sizeChart,
  productCollections,
  badges,
  locale,
  name,
  description
}: any) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  const filteredImages = product.images?.filter((img: any) => 
    !img.color || img.color === "none" || img.color === selectedColor
  ) || [];

  const imagesToShow = (selectedColor && filteredImages.length > 0) ? filteredImages : (product.images || []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
      <ProductGallery 
        images={imagesToShow}
        alt={name}
        imageFit={product.properties?.image_fit || "cover"}
        badges={badges}
      />

      <div className="flex flex-col pt-4 md:pt-10">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight tracking-tight mb-2">
          {name}
        </h1>
        
        {product.sku && (
          <p className="text-gray-400 text-sm mb-4">
            Арт: {product.sku}
          </p>
        )}

        <div className="flex items-center gap-4 mb-6">
          <p className="text-brand font-semibold text-2xl">
            {product.price} ₴
          </p>
          {product.status_def && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: product.status_def.color || (product.status_def.allow_purchase ? '#10B981' : '#EF4444') }}></span>
              <span className="text-sm font-medium text-gray-600">
                {locale === "ua" ? product.status_def.name_ua : product.status_def.name_en}
              </span>
            </div>
          )}
        </div>
        
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          {description}
        </p>

        <div className="h-px bg-gray-100 w-full mb-2" />

        <InteractiveProductForm 
          product={product} 
          sizeChart={sizeChart} 
          onColorChange={handleColorChange} 
        />
      </div>
    </div>
  );
}
