"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Category } from "@/lib/types";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X } from "lucide-react";

interface CatalogFiltersProps {
  categories: Category[];
  locale: string;
}

export default function CatalogFilters({ categories, locale }: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category");
  const inStock = searchParams.get("in_stock") === "true";
  
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const applyPrice = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("min_price", minPrice);
    else params.delete("min_price");
    
    if (maxPrice) params.set("max_price", maxPrice);
    else params.delete("max_price");
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyPrice();
    }
  };

  const clearAll = () => {
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname, { scroll: false });
  };

  // The actual filter content
  const FilterContent = (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">
          {locale === "ua" ? "Категорії" : "Categories"}
        </h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => updateFilters("category", null)}
            className={`text-left px-3 py-2 rounded-lg transition-colors ${!currentCategory ? 'bg-brand/10 text-brand font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {locale === "ua" ? "Усі товари" : "All Products"}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => updateFilters("category", cat.slug)}
              className={`text-left px-3 py-2 rounded-lg transition-colors ${currentCategory === cat.slug ? 'bg-brand/10 text-brand font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {locale === "ua" ? cat.name_ua : cat.name_en}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">
          {locale === "ua" ? "Ціна (₴)" : "Price (₴)"}
        </h3>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder={locale === "ua" ? "Від" : "From"} 
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            onKeyDown={handlePriceKeyDown}
            className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-xl outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
          <span className="text-gray-400">-</span>
          <input 
            type="number" 
            placeholder={locale === "ua" ? "До" : "To"} 
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            onKeyDown={handlePriceKeyDown}
            className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-xl outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>
        <button 
          onClick={applyPrice}
          className="mt-3 w-full py-2 bg-brand hover:bg-brand-light text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          {locale === "ua" ? "Застосувати" : "Apply"}
        </button>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">
          {locale === "ua" ? "Наявність" : "Availability"}
        </h3>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input 
              type="checkbox" 
              checked={inStock}
              onChange={(e) => updateFilters("in_stock", e.target.checked ? "true" : null)}
              className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-brand checked:border-brand transition-colors cursor-pointer"
            />
            <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
            {locale === "ua" ? "Тільки в наявності" : "In stock only"}
          </span>
        </label>
      </div>

      {Array.from(searchParams.keys()).length > 0 && (
        <button 
          onClick={clearAll}
          className="text-red-500 hover:text-red-600 text-sm font-medium w-full text-center mt-4"
        >
          {locale === "ua" ? "Очистити всі фільтри" : "Clear all filters"}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-6">
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-gray-200 rounded-xl font-semibold shadow-sm"
        >
          <SlidersHorizontal className="w-5 h-5" />
          {locale === "ua" ? "Фільтри та Категорії" : "Filters & Categories"}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24 h-fit">
        {FilterContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mounted && createPortal(
        isMobileOpen && (
          <div className="fixed inset-0 z-[100] flex lg:hidden">
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
              onClick={() => setIsMobileOpen(false)}
            />
            <div className="relative ml-auto w-full max-w-sm h-full bg-white shadow-2xl overflow-y-auto p-6 animate-in slide-in-from-right">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Фільтри</h2>
                <button onClick={() => setIsMobileOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {FilterContent}
            </div>
          </div>
        ),
        document.body
      )}
    </>
  );
}
