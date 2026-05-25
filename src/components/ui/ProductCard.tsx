"use client";

import { Product } from "@/lib/types";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import WishlistButton from "./WishlistButton";
import { useState } from "react";
import QuickAddModal from "./QuickAddModal";
import { useCartStore } from "@/lib/store";
import toast from "react-hot-toast";

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
  
  return (
    <div className="group relative flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Image Area */}
      <Link href={`/products/${product.id}`} className="relative aspect-[4/5] bg-gray-50 overflow-hidden block">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={name} 
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            No Image
          </div>
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
