import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("About");

  return (
    <main className="flex-1 bg-white">
      {/* Hero Section */}
      <section className="relative w-full h-[40vh] md:h-[60vh] bg-gray-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/about_hero.png" 
            alt="Kutok Mista Urban Aesthetics" 
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto mt-16 md:mt-0">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4 drop-shadow-lg">
            {t("title")}
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          
          <Link href="/" className="inline-flex items-center gap-2 text-brand hover:underline font-medium mb-12">
            <ArrowLeft className="w-4 h-4" />
            {locale === "ua" ? "На головну" : "Back to Home"}
          </Link>

          <div className="text-gray-700 text-lg md:text-xl">
            <p className="leading-relaxed mb-8">
              {t("introP1")}
            </p>
            
            <p className="mb-16">
              {t("introP2")}
            </p>

            <h2 className="text-3xl font-bold text-foreground mb-6">
              {t("philosophyTitle")}
            </h2>
            <p className="mb-12">
              {t("philosophyP1")}
            </p>

            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {t("aestheticsTitle")}
                </h3>
                <p>
                  {t("aestheticsText")}
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {t("detailsTitle")}
                </h3>
                <p>
                  {t("detailsText")}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-8 md:p-12 rounded-3xl text-center flex flex-col items-center mt-8">
              <img src="/logo-vertical.svg" alt="Kutok Mista Logo" className="w-40 md:w-48 h-auto mb-10 opacity-80" />
              <p className="text-xl font-medium text-foreground italic mb-6 max-w-2xl">
                "{t("conclusion")}"
              </p>
              <p className="text-brand font-bold tracking-widest uppercase">
                {t("slogan")}
              </p>
            </div>
            
          </div>
        </div>
      </section>
    </main>
  );
}
