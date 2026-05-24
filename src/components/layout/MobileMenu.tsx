"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function MobileMenu() {
  const t = useTranslations("Navigation");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const navItems = [
    { href: "/", label: t("home") },
    { href: "/products", label: t("catalog") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(true)} 
        className="p-2 -mr-2 text-foreground hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-white/75 backdrop-blur-md flex flex-col pt-6 px-6 pb-10"
            >
              <div className="relative flex justify-center items-center mb-12">
                <Image 
                  src="/logo-horizontal.svg" 
                  alt="Kutok Mista Logo" 
                  width={200} 
                  height={56} 
                  className="h-14 w-auto object-contain drop-shadow-sm"
                  priority
                />
                <button 
                  onClick={() => setIsOpen(false)}
                  className="absolute right-0 p-2 text-foreground hover:bg-gray-100/50 rounded-full transition-colors bg-gray-50/50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex flex-col gap-6 flex-1 justify-center items-center">
                {navItems.map((item) => {
                  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-3xl font-bold transition-colors ${
                        isActive ? "text-brand" : "text-foreground hover:text-brand"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              
              {/* Optional footer area in menu */}
              <div className="mt-auto text-center text-sm text-gray-400">
                © {new Date().getFullYear()} Kutok Mista
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
