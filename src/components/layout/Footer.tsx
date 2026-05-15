import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function Footer() {
  const t = useTranslations("Navigation");

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-background mt-auto">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-foreground/60">
          © {new Date().getFullYear()} Kutok Mista. All rights reserved.
        </div>
        <nav className="flex gap-6 text-sm text-foreground/80">
          <Link href="/" className="hover:text-brand transition-colors">{t("home")}</Link>
          <Link href="/products" className="hover:text-brand transition-colors">{t("catalog")}</Link>
          <Link href="/contact" className="hover:text-brand transition-colors">{t("contact")}</Link>
        </nav>
      </div>
    </footer>
  );
}
