import { notFound } from "next/navigation";
import { getProductById } from "@/lib/api";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import InteractiveProductForm from "@/components/ui/InteractiveProductForm";
import ProductGallery from "@/components/ui/ProductGallery";
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
          <ProductGallery 
            images={product.images || []} 
            alt={name} 
            imageFit={product.properties?.image_fit || "cover"}
            badges={
              <>
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
                {product.status_def && product.status_def.show_in_card !== false && (
                  <span 
                    className="text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg"
                    style={{ backgroundColor: product.status_def.color || (product.status_def.allow_purchase ? '#10B981' : '#EF4444') }}
                  >
                    {locale === "ua" ? product.status_def.name_ua : product.status_def.name_en}
                  </span>
                )}
              </>
            }
          />

          {/* Product Details */}
          <div className="flex flex-col pt-4 md:pt-10">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight tracking-tight mb-2">
              {name}
            </h1>
            
            {product.sku && (
              <p className="text-gray-400 text-sm mb-4">
                Арт: {product.sku}
              </p>
            )}

            <div className="flex items-center gap-4 mb-6">
              <p className="text-brand font-semibold text-2xl">
                {product.price} ₴
              </p>
              {product.status_def && (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: product.status_def.color || (product.status_def.allow_purchase ? '#10B981' : '#EF4444') }}></span>
                  <span className="text-sm font-medium text-gray-600">
                    {locale === "ua" ? product.status_def.name_ua : product.status_def.name_en}
                  </span>
                </div>
              )}
            </div>
            
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
