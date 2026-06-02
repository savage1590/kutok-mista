"use client";

import { useCartStore } from "@/lib/store";
import { ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
      <AnimatePresence>
        {mounted && total > 0 && (
          <motion.span 
            key={total}
            initial={{ scale: 0, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="absolute top-0 right-0 w-4 h-4 bg-brand text-white text-[10px] font-bold flex items-center justify-center rounded-full"
          >
            {total}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
