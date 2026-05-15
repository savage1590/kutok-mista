import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function Home() {
  const t = useTranslations("Home");

  return (
    <main className="flex-1 relative flex flex-col justify-center min-h-[calc(100vh-4rem)] bg-[#050505]">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      />
      
      {/* Overlay: Darkening gradient for contrast */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />

      {/* Content */}
      <div className="container mx-auto px-4 z-10 relative py-20">
        <div className="max-w-4xl flex flex-col items-start gap-8">
          <h1 className="text-6xl md:text-[6rem] lg:text-[8rem] font-black text-white leading-[1.05] tracking-tighter drop-shadow-lg">
            {t("heroTitle")}
          </h1>
          <p className="text-xl md:text-3xl text-gray-300 font-medium max-w-2xl leading-relaxed drop-shadow-md">
            {t("heroSubtitle")}
          </p>
          <Link 
            href="/products" 
            className="mt-8 px-12 py-5 bg-brand text-white rounded-full font-bold tracking-[0.2em] hover:bg-brand-light hover:shadow-brand/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 uppercase text-sm border border-brand-light/30"
          >
            {t("shopNow")}
          </Link>
        </div>
      </div>
    </main>
  );
}
