import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function HomeCategories() {
  const t = useTranslations("Home");

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
          {t("categoriesTitle")}
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Clothing Category */}
          <Link href="/products?category=apparel" className="group relative h-[400px] rounded-3xl overflow-hidden block">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: "url('/images/about_hero.png')" }}
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 drop-shadow-md">
                {t("catClothing")}
              </h3>
              <span className="px-6 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-sm font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                {t("slide1Btn")}
              </span>
            </div>
          </Link>

          {/* Accessories Category */}
          <Link href="/products?category=accessories" className="group relative h-[400px] rounded-3xl overflow-hidden block">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: "url('/hero-bg.png')" }}
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 drop-shadow-md">
                {t("catAccessories")}
              </h3>
              <span className="px-6 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-sm font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                {t("slide1Btn")}
              </span>
            </div>
          </Link>

          {/* Decor Category */}
          <Link href="/products?category=decor" className="group relative h-[400px] rounded-3xl overflow-hidden block">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: "url('/images/hero_3.jpg')" }}
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 drop-shadow-md">
                {t("catDecor")}
              </h3>
              <span className="px-6 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-sm font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                {t("slide1Btn")}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
