"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Cookie } from "lucide-react";

export default function CookieBanner() {
  const t = useTranslations("Cookie");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem("cookies_accepted");
    if (!hasAccepted) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookies_accepted", "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0, transition: { duration: 0.3 } }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-6 md:right-auto md:max-w-[400px] z-[100]"
        >
          <div className="bg-white/80 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-t-3xl md:rounded-3xl p-5 md:p-6 mx-2 mb-2 md:m-0 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 bg-brand/10 text-brand rounded-full flex items-center justify-center">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm font-medium text-gray-800 leading-relaxed">
                  {t("message")}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-1">
              {/* Optional Policy Link
              <button className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                {t("policy")}
              </button>
              */}
              <button
                onClick={handleAccept}
                className="px-6 py-2.5 bg-foreground hover:bg-brand text-white text-sm font-bold rounded-full transition-all active:scale-95"
              >
                {t("accept")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
