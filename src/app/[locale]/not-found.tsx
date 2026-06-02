import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl md:text-8xl font-black text-brand mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
        {t("title").replace("404 - ", "")}
      </h2>
      <p className="text-gray-500 max-w-md mb-10 text-lg">
        {t("description")}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link 
          href="/" 
          className="px-8 py-4 bg-gray-100 text-foreground rounded-full font-bold hover:bg-gray-200 transition-colors text-center"
        >
          {t("homeBtn")}
        </Link>
        <Link 
          href="/products" 
          className="px-8 py-4 bg-brand text-white rounded-full font-bold shadow-lg hover:bg-brand-light transition-colors text-center"
        >
          {t("catalogBtn")}
        </Link>
      </div>
    </div>
  );
}
