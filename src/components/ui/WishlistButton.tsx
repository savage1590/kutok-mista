"use client";

import { useWishlistStore } from "@/lib/wishlistStore";
import { Product } from "@/lib/types";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface WishlistButtonProps {
  product: Product;
  className?: string;
  showText?: boolean;
  locale?: string;
}

export default function WishlistButton({ product, className = "", showText = false, locale = "ua" }: WishlistButtonProps) {
  const [mounted, setMounted] = useState(false);
  const { toggleItem, isInWishlist } = useWishlistStore();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <button className={`p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-400 opacity-50 ${className}`}>
      <Heart className="w-5 h-5" />
    </button>
  );

  const active = isInWishlist(product.id);

  return (
    <button 
      onClick={(e) => {
        e.preventDefault(); // Prevent navigating if inside a Link
        toggleItem(product);
        if (active) {
          toast.success(locale === "ua" ? "Видалено з обраного" : "Removed from wishlist");
        } else {
          toast.success(locale === "ua" ? "Додано в обране" : "Added to wishlist");
        }
      }}
      className={`group flex items-center justify-center transition-all ${
        showText 
          ? "gap-2 px-6 py-3 border border-gray-200 rounded-full hover:bg-red-50 hover:border-red-100 hover:text-red-500 font-semibold" 
          : "p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110"
      } ${active ? "text-red-500" : "text-gray-400 hover:text-red-500"} ${className}`}
      title={locale === "ua" ? (active ? "Видалити з обраного" : "Додати в обране") : (active ? "Remove from wishlist" : "Add to wishlist")}
    >
      <Heart className={`w-5 h-5 transition-transform ${active ? "fill-current scale-110" : "group-hover:scale-110"}`} />
      {showText && (
        <span>
          {locale === "ua" 
            ? (active ? "В обраному" : "В обране") 
            : (active ? "In Wishlist" : "To Wishlist")}
        </span>
      )}
    </button>
  );
}
