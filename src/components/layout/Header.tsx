import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import { ShoppingBag } from "lucide-react";

export default function Header() {
  const t = useTranslations("Navigation");

  return (
    <header className="sticky top-0 z-50 glass border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-brand-blue">
          <span>KUTOK<span className="text-foreground">MISTA</span></span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-brand transition-colors">{t("home")}</Link>
          <Link href="/products" className="hover:text-brand transition-colors">{t("catalog")}</Link>
          <Link href="/about" className="hover:text-brand transition-colors">{t("about")}</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-brand text-white text-[10px] font-bold flex items-center justify-center rounded-full">
              0
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
