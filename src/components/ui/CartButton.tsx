"use client";

import { useCartStore } from "@/lib/store";
import { ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useState, useEffect } from "react";

export default function CartButton() {
  const [mounted, setMounted] = useState(false);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const total = getTotalItems();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative block">
      <ShoppingBag className="w-5 h-5" />
      {mounted && total > 0 && (
        <span className="absolute top-0 right-0 w-4 h-4 bg-brand text-white text-[10px] font-bold flex items-center justify-center rounded-full">
          {total}
        </span>
      )}
    </Link>
  );
}
