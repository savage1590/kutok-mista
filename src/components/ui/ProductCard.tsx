"use client";

import { Product } from "@/lib/types";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import WishlistButton from "./WishlistButton";
import { useState } from "react";
import QuickAddModal from "./QuickAddModal";
import { useCartStore } from "@/lib/store";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
          <img 
            src={displayImage} 
            alt={name} 
            className={`${product.properties?.image_fit === 'contain' ? 'object-contain p-4' : 'object-cover'} w-full h-full group-hover:scale-105 transition-transform duration-500`}
          />
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
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_on_demand && (
            <span className="bg-brand text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {t("productionTime")}
            </span>
          )}
          {product.stock_status === "out_of_stock" && (
            <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {t("outOfStock")}
            </span>
          )}
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
        <p className="text-gray-500 text-sm mb-4 capitalize">
          {categoryName}
        </p>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="font-bold text-lg">
            {product.price} ₴
          </span>
          <button 
            disabled={product.stock_status === "out_of_stock"}
            onClick={handleAddToCartClick}
            className="bg-gray-100 hover:bg-brand hover:text-white text-foreground px-4 py-2 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 disabled:hover:bg-gray-100 disabled:hover:text-foreground"
          >
            {t("addToCart")}
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
