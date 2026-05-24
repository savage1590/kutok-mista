"use client";

import { useLocale } from "next-intl";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/routing";
type Banner = {
  id: string;
  image: string;
  title_ua: string;
  title_en: string;
  subtitle_ua: string;
  subtitle_en: string;
  btn_ua: string;
  btn_en: string;
  link: string;
};

export default function HeroCarousel({ banners }: { banners: Banner[] }) {
  const locale = useLocale();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.max(banners.length, 1));
    }, 10000); // 10 seconds interval

    return () => clearInterval(timer);
  }, []);

  if (!banners || banners.length === 0) return null;

  const slide = banners[currentSlide] || banners[0];

  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] min-h-[500px] bg-[#050505] overflow-hidden flex items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('${slide.image}')`,
            backgroundColor: '#1a1a1a' 
          }}
        />
      </AnimatePresence>
      
      {/* Overlay: Darkening gradient for contrast */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />

      {/* Content */}
      <div className="container mx-auto px-4 z-10 relative py-20">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-4xl flex flex-col items-start gap-8"
          >
            <h1 className="text-5xl md:text-[5rem] lg:text-[7rem] font-black text-white leading-[1.05] tracking-tighter drop-shadow-lg max-w-5xl">
              {locale === 'en' ? slide.title_en : slide.title_ua}
            </h1>
            <p className="text-xl md:text-3xl text-gray-300 font-medium max-w-2xl leading-relaxed drop-shadow-md">
              {locale === 'en' ? slide.subtitle_en : slide.subtitle_ua}
            </p>
            <Link 
              href={slide.link} 
              className="mt-8 px-10 py-5 bg-brand text-white rounded-full font-bold tracking-[0.1em] hover:bg-brand-light hover:shadow-brand/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 uppercase text-sm border border-brand-light/30 flex items-center gap-3"
            >
              {locale === 'en' ? slide.btn_en : slide.btn_ua}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-4">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === currentSlide ? "w-12 bg-brand" : "w-6 bg-white/30 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
