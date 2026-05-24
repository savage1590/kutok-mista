"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/types";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/lib/store";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface QuickAddModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export default function QuickAddModal({ product, isOpen, onClose, locale }: QuickAddModalProps) {
  const t = useTranslations("Product");
  const addItem = useCartStore((state) => state.addItem);
  const [selectedProperties, setSelectedProperties] = useState<Record<string, string>>({});

  // Reset state when product changes
  useEffect(() => {
    setSelectedProperties({});
  }, [product]);

  if (!product) return null;

  const name = locale === "ua" ? product.name_ua : product.name_en;
  const propertiesSchema = product.categories?.properties_schema || [];
  const propertyKeys = Object.keys(product.properties || {}).filter(k => Array.isArray(product.properties[k]) && product.properties[k].length > 0);

  const isAddToCartDisabled = 
    product.stock_status === "out_of_stock" ||
    propertyKeys.some(k => !selectedProperties[k]);

  const toggleProperty = (key: string, val: string) => {
    setSelectedProperties(prev => ({ ...prev, [key]: val }));
  };

  const handleAddToCart = () => {
    addItem(product, 1, selectedProperties);
    toast.success(locale === "ua" ? "Товар додано в кошик" : "Item added to cart");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
          >
            {/* Header / Image Area */}
            <div className="relative h-48 sm:h-64 bg-gray-50 shrink-0">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  No Image
                </div>
              )}
              
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full backdrop-blur-md shadow-sm transition-all hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-1 leading-tight">{name}</h3>
                <p className="text-xl font-bold text-brand">{product.price} ₴</p>
              </div>

              {/* Properties Selection */}
              <div className="flex flex-col gap-5 mb-8">
                {propertyKeys.map(key => {
                  const schema = propertiesSchema.find(s => s.name === key);
                  const label = schema ? (locale === 'ua' ? schema.label_ua : schema.label_en) : key;
                  const options = product.properties[key];
                  
                  return (
                    <div key={key} className="flex flex-col gap-2">
                      <span className="font-semibold text-foreground uppercase tracking-wide text-xs">
                        {label}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {options.map((opt: string) => (
                          <button
                            key={opt}
                            onClick={() => toggleProperty(key, opt)}
                            className={`px-4 py-2 min-w-[3rem] text-sm rounded border transition-all font-medium ${
                              selectedProperties[key] === opt 
                                ? "border-brand bg-brand text-white shadow-md scale-105" 
                                : "border-gray-200 text-foreground hover:border-gray-400 bg-white"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Sticky Footer */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              <button 
                onClick={handleAddToCart}
                disabled={isAddToCartDisabled}
                className="w-full py-4 px-8 bg-foreground hover:bg-brand text-white rounded-full font-bold text-lg transition-colors disabled:opacity-50 disabled:hover:bg-foreground flex items-center justify-center gap-2"
              >
                {t("addToCart")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
