import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import CartButton from "../ui/CartButton";
import WishlistHeaderButton from "../ui/WishlistHeaderButton";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const t = useTranslations("Navigation");

  return (
    <header className="sticky top-0 z-50 glass border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image 
            src="/logo-horizontal.svg" 
            alt="Kutok Mista Logo" 
            width={180} 
            height={48} 
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-brand transition-colors">{t("home")}</Link>
          <Link href="/products" className="hover:text-brand transition-colors">{t("catalog")}</Link>
          <Link href="/about" className="hover:text-brand transition-colors">{t("about")}</Link>
          <Link href="/contact" className="hover:text-brand transition-colors">{t("contact")}</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <WishlistHeaderButton />
          <CartButton />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
