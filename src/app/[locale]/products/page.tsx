import { useTranslations } from "next-intl";
import ProductCard from "@/components/ui/ProductCard";
import { MOCK_PRODUCTS } from "@/lib/mockData";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Since we can't use hooks in a Server Component for translations easily without next-intl/server,
  // Actually we CAN use useTranslations if it's not async, but in App router server components
  // it's better to use getTranslations.
  // Wait, I will just pass the locale down to the ProductCard, it handles its own translations if it's a client component,
  // or we can just pass the locale.
  // Let's use standard page layout.
  
  return (
    <main className="flex-1 container mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
          {locale === "ua" ? "Наш Каталог" : "Our Catalog"}
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          {locale === "ua" 
            ? "Урбаністичні артефакти та мінімалістичний одяг. Досліджуйте колекцію."
            : "Urban artifacts and minimalist apparel. Explore the collection."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {MOCK_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} locale={locale} />
        ))}
      </div>
    </main>
  );
}
