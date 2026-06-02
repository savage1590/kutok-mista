import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/api";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ProductInteractiveViewer from "@/components/ui/ProductInteractiveViewer";
import ProductGallery from "@/components/ui/ProductGallery";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import RelatedProducts from "@/components/ui/RelatedProducts";
import ProductReviews from "@/components/ui/ProductReviews";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Товар не знайдено | Kutok Mista',
    };
  }

  const name = locale === "ua" ? product.name_ua : product.name_en;
  const description = locale === "ua" ? product.description_ua : product.description_en;
  
  return {
    title: `${name} | Kutok Mista`,
    description: description || "Kutok Mista - Urban Aesthetics",
    openGraph: {
      title: `${name} | Kutok Mista`,
      description: description || "Kutok Mista - Urban Aesthetics",
      url: `https://www.kutok-mista.com.ua/${locale}/products/${slug}`,
      siteName: 'Kutok Mista',
      images: product.image_url ? [
        {
          url: product.image_url,
          width: 800,
          height: 600,
          alt: name,
        }
      ] : [],
      locale: locale === 'ua' ? 'uk_UA' : 'en_US',
      type: 'website',
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);

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
        
        <Breadcrumbs 
          items={[
            { label: locale === "ua" ? "Каталог" : "Catalog", href: "/products" },
            ...(product.categories ? [{ 
              label: locale === "ua" ? product.categories.name_ua : product.categories.name_en, 
              href: `/products?category=${product.categories.slug}` 
            }] : []),
            { label: name }
          ]} 
        />

        <ProductInteractiveViewer 
          product={product}
          sizeChart={sizeChart}
          productCollections={productCollections}
          locale={locale}
          name={name}
          description={description}
          badges={
            <>
              {product.is_on_demand && (
                <span className="bg-brand text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                  {t("productionTime")}
                </span>
              )}
              {productCollections.map((col: any) => (
                <Link 
                  href={`/products?collection=${col.id}`}
                  key={col.id}
                  className="text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: col.color || '#888' }}
                >
                  {locale === "ua" ? col.name_ua : col.name_en}
                </Link>
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

        <RelatedProducts 
          currentProductId={product.id} 
          categorySlug={product.categories?.slug} 
          locale={locale} 
        />

        <ProductReviews productId={product.id} locale={locale} />
      </div>
    </main>
  );
}
