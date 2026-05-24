import { notFound } from "next/navigation";
import { getProductById } from "@/lib/api";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import InteractiveProductForm from "@/components/ui/InteractiveProductForm";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const t = await getTranslations("Product");
  const name = locale === "ua" ? product.name_ua : product.name_en;
  const description = locale === "ua" ? product.description_ua : product.description_en;

  let sizeChart = null;
  const sizeChartId = product.properties?.size_chart_id;
  if (sizeChartId) {
    const { data: sizeChartsData } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", "size_charts")
      .single();
    const allCharts = (sizeChartsData?.value || []) as any[];
    sizeChart = allCharts.find(c => c.id === sizeChartId) || null;
  }

  // Fetch collections
  let productCollections: any[] = [];
  const collectionIds: string[] = product.properties?.collection_ids || [];
  if (collectionIds.length > 0) {
    const { data: collectionsData } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", "collections")
      .single();
    const allCollections = (collectionsData?.value || []) as any[];
    productCollections = allCollections.filter(c => collectionIds.includes(c.id));
  }

  return (
    <main className="flex-1 bg-white">
      <div className="container mx-auto px-4 py-8">
        
        {/* Back link */}
        <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand transition-colors mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" />
          {locale === "ua" ? "Назад до каталогу" : "Back to catalog"}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <div className="rounded-3xl overflow-hidden bg-gray-50 aspect-[4/5] md:aspect-square relative flex items-center justify-center">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={name} 
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-gray-300">No Image</span>
            )}
            
            {/* Badges Overlay */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              {product.is_on_demand && (
                <span className="bg-brand text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                  {t("productionTime")}
                </span>
              )}
              {productCollections.map(col => (
                <span 
                  key={col.id}
                  className="text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg"
                  style={{ backgroundColor: col.color || '#888' }}
                >
                  {locale === "ua" ? col.name_ua : col.name_en}
                </span>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col pt-4 md:pt-10">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight tracking-tight mb-2">
              {name}
            </h1>
            <p className="text-brand font-semibold text-2xl mb-6">
              {product.price} ₴
            </p>
            
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              {description}
            </p>

            <div className="h-px bg-gray-100 w-full mb-2" />

            {/* Interactive Client Component for selections and adding to cart */}
            <InteractiveProductForm product={product} sizeChart={sizeChart} />

          </div>
        </div>
      </div>
    </main>
  );
}
