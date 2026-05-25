import { getTranslations } from "next-intl/server";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ui/ProductCard";
import { DEFAULT_STOCK_STATUSES } from "@/lib/api";

export default async function HomeFeatured({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Home" });

  const [{ data: featuredData }, statuses] = await Promise.all([
    supabase
      .from("settings")
      .select("value")
      .eq("key", "home_featured")
      .single(),
    import("@/lib/api").then(m => m.getStockStatuses())
  ]);

  const featuredIds: string[] = featuredData?.value || [];

  let products = [];
  
  if (featuredIds.length > 0) {
    const { data } = await supabase
      .from("products")
      .select("*, product_images(image_url, is_primary)")
      .in("id", featuredIds);
      
    // Sort them exactly as ordered in the settings array
    if (data) {
      products = [...data]
        .map(p => ({
          ...p,
          images: p.product_images || [],
          image_url: p.product_images?.find((img: any) => img.is_primary)?.image_url || p.product_images?.[0]?.image_url || p.image_url,
          status_def: statuses.find(s => s.id === p.stock_status) || DEFAULT_STOCK_STATUSES.find(s => s.id === p.stock_status) || DEFAULT_STOCK_STATUSES[0]
        }))
        .sort((a, b) => featuredIds.indexOf(a.id) - featuredIds.indexOf(b.id));
    }
  } else {
    // Fallback: Fetch 4 latest products if none selected
    const { data } = await supabase
      .from("products")
      .select("*, product_images(image_url, is_primary)")
      .order("created_at", { ascending: false })
      .limit(4);
      
    if (data) {
      products = data.map(p => ({
        ...p,
        images: p.product_images || [],
        image_url: p.product_images?.find((img: any) => img.is_primary)?.image_url || p.product_images?.[0]?.image_url || p.image_url,
        status_def: statuses.find(s => s.id === p.stock_status) || DEFAULT_STOCK_STATUSES.find(s => s.id === p.stock_status) || DEFAULT_STOCK_STATUSES[0]
      }));
    }
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
          {t("featuredTitle")}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
