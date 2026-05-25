"use client";

import { Product } from "@/lib/types";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import WishlistButton from "./WishlistButton";
import { useState } from "react";
import QuickAddModal from "./QuickAddModal";
import { useCartStore } from "@/lib/store";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductCardProps {
  product: Product;
  locale: string;
  collections?: any[];
}

export default function ProductCard({ product, locale, collections = [] }: ProductCardProps) {
  const t = useTranslations("Product");
  const name = locale === "ua" ? product.name_ua : product.name_en;
  const categoryName = product.categories ? (locale === "ua" ? product.categories.name_ua : product.categories.name_en) : product.type;
  
  // Resolve product collections
  const productCollectionIds: string[] = product.properties?.collection_ids || [];
  const productCollections = collections.filter(c => productCollectionIds.includes(c.id));
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const addItem = useCartStore((state) => state.addItem);
  
  const hasProperties = Object.keys(product.properties || {}).some(k => 
    k !== 'collection_ids' && 
    k !== 'size_chart_id' && 
    Array.isArray(product.properties[k]) && 
    product.properties[k].length > 0
  );

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product page
    
    if (hasProperties) {
      setIsModalOpen(true);
    } else {
      addItem(product, 1);
      toast.success(locale === "ua" ? "Товар додано в кошик" : "Item added to cart");
    }
  };
  
  const sortedImages = product.images ? [...product.images].sort((a: any, b: any) => (a.is_primary ? -1 : b.is_primary ? 1 : 0)) : [];
  const displayImage = sortedImages.length > 0 ? sortedImages[currentImageIndex].image_url : product.image_url;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : sortedImages.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev < sortedImages.length - 1 ? prev + 1 : 0));
  };
  
  return (
    <div className="group relative flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Image Area */}
      <Link href={`/products/${product.id}`} className="relative aspect-[4/5] bg-gray-50 overflow-hidden block">
        {displayImage ? (
          <AnimatePresence mode="wait">
            <motion.img 
              key={displayImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={displayImage} 
              alt={name} 
              className={`${product.properties?.image_fit === 'contain' ? 'object-contain p-4' : 'object-cover'} w-full h-full group-hover:scale-105 transition-transform duration-500`}
            />
          </AnimatePresence>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            No Image
          </div>
        )}

        {sortedImages.length > 1 && (
          <>
            <button 
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm z-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm z-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-30">

          {productCollections.map(col => (
            <span 
              key={col.id}
              className="text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm"
              style={{ backgroundColor: col.color || '#888' }}
            >
              {locale === "ua" ? col.name_ua : col.name_en}
            </span>
          ))}
        </div>

        <div className="absolute top-3 right-3 z-10">
          <WishlistButton product={product} locale={locale} />
        </div>
      </Link>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1">
        <Link href={`/products/${product.id}`} className="hover:text-brand transition-colors">
          <h3 className="font-bold text-lg text-foreground tracking-tight leading-tight mb-1">
            {name}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm mb-3 capitalize">
          {categoryName}
        </p>

        {product.status_def && product.status_def.show_in_card !== false && (
          <div className="mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: product.status_def.color || (product.status_def.allow_purchase ? '#10B981' : '#EF4444') }}></span>
            <span className="text-xs font-medium text-gray-600">
              {locale === "ua" ? product.status_def.name_ua : product.status_def.name_en}
            </span>
          </div>
        )}
        
        <div className="mt-auto flex items-center justify-between">
          <span className="font-bold text-lg">
            {product.price} ₴
          </span>
          <button 
            onClick={handleAddToCartClick}
            disabled={product.status_def?.allow_purchase === false}
            className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand/90 transition-all hover:scale-110 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-label={locale === "ua" ? "Додати в кошик" : "Add to cart"}
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <QuickAddModal 
        product={product} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        locale={locale} 
      />
    </div>
  );
}
