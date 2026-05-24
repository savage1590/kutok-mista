"use client";

import { useWishlistStore } from "@/lib/wishlistStore";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import ProductCard from "@/components/ui/ProductCard";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

export default function WishlistClient({ locale }: { locale: string }) {
  const t = useTranslations("Wishlist");
  const { items, clearWishlist } = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <img src="/logo-icon.svg" alt="Kutok Mista Logo Watermark" className="w-64 md:w-96 h-auto" />
        </div>
        <div className="w-24 h-24 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-6 relative z-10">
          <Heart className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-8 relative z-10">{t("empty")}</h2>
        <Link 
          href="/products" 
          className="px-10 py-4 bg-brand hover:bg-brand-light text-white rounded-full font-bold transition-colors relative z-10 shadow-lg text-lg"
        >
          {t("goCatalog")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500 fill-current" />
          {t("title")}
        </h1>
        <button 
          onClick={clearWishlist}
          className="text-red-500 hover:text-red-600 font-medium text-sm self-start md:self-auto px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          Очистити список
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} locale={locale} />
        ))}
      </div>
    </div>
  );
}
