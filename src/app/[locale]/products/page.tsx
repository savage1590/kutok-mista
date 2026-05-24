import ProductCard from "@/components/ui/ProductCard";
import { getProducts, getCategories } from "@/lib/api";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import CatalogFilters from "@/components/catalog/CatalogFilters";
import CatalogSort from "@/components/catalog/CatalogSort";

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  const filters = {
    category: resolvedSearchParams.category,
    collection: resolvedSearchParams.collection,
    min_price: resolvedSearchParams.min_price ? parseInt(resolvedSearchParams.min_price, 10) : undefined,
    max_price: resolvedSearchParams.max_price ? parseInt(resolvedSearchParams.max_price, 10) : undefined,
    in_stock: resolvedSearchParams.in_stock === "true",
    sort: resolvedSearchParams.sort,
  };

  const [products, categories, collectionsData] = await Promise.all([
    getProducts(filters),
    getCategories(),
    supabaseAdmin.from("settings").select("value").eq("key", "collections").single()
  ]);

  const collections = (collectionsData?.data?.value || []) as any[];
  
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

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <CatalogFilters categories={categories || []} collections={collections} locale={locale} />

        {/* Product Grid & Sort */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-500 font-medium">
              {locale === "ua" ? `Знайдено товарів: ${products.length}` : `${products.length} products found`}
            </span>
            <CatalogSort locale={locale} />
          </div>

          {products.length === 0 ? (
            <div className="py-20 text-center">
              <h2 className="text-2xl font-bold mb-2">
                {locale === "ua" ? "Нічого не знайдено" : "Nothing found"}
              </h2>
              <p className="text-gray-500">
                {locale === "ua" 
                  ? "Спробуйте змінити критерії пошуку або очистити фільтри." 
                  : "Try changing your search criteria or clear filters."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} collections={collections} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
