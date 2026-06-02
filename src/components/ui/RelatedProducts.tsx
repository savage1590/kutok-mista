import { getProducts } from "@/lib/api";
import ProductCard from "./ProductCard";
import { getTranslations } from "next-intl/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface RelatedProductsProps {
  currentProductId: string;
  categorySlug?: string;
  locale: string;
}

export default async function RelatedProducts({ currentProductId, categorySlug, locale }: RelatedProductsProps) {
  if (!categorySlug) return null;

  // Fetch up to 5 products from the same category to ensure we have 4 after excluding current
  const products = await getProducts({ category: categorySlug });
  
  const related = products
    .filter(p => p.id !== currentProductId)
    .slice(0, 4);

  if (related.length === 0) return null;

  const t = await getTranslations("Product");

  // Fetch collections for badges
  const { data: collectionsData } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "collections")
    .single();
  const allCollections = (collectionsData?.value || []) as any[];

  return (
    <section className="py-12 mt-12 border-t border-gray-100">
      <h2 className="text-2xl font-black text-foreground mb-8 text-center uppercase">
        {t("relatedProducts")}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {related.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            locale={locale} 
            collections={allCollections}
          />
        ))}
      </div>
    </section>
  );
}
