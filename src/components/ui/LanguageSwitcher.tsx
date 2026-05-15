"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <button
        onClick={() => switchLocale("ua")}
        className={`px-2 py-1 rounded transition-colors ${
          locale === "ua" ? "bg-brand text-white" : "text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        UA
      </button>
      <button
        onClick={() => switchLocale("en")}
        className={`px-2 py-1 rounded transition-colors ${
          locale === "en" ? "bg-brand text-white" : "text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        EN
      </button>
    </div>
  );
}
