"use client";

import { useWishlistStore } from "@/lib/wishlistStore";
import { Heart } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useState, useEffect } from "react";

export default function WishlistHeaderButton() {
  const [mounted, setMounted] = useState(false);
  const getTotalItems = useWishlistStore((state) => state.getTotalItems);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link 
      href="/wishlist" 
      className="relative p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center text-foreground group"
    >
      <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
      {mounted && getTotalItems() > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
          {getTotalItems()}
        </span>
      )}
    </Link>
  );
}
