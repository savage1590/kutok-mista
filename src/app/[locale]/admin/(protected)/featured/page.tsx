import { supabaseAdmin } from "@/lib/supabaseAdmin";
import FeaturedClient from "./FeaturedClient";

export default async function AdminFeaturedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Fetch all products to pick from
  const { data: allProducts } = await supabaseAdmin
    .from("products")
    .select("id, name_ua, name_en, type, price, stock_status, product_images(image_url, is_primary)")
    .order("created_at", { ascending: false });

  // Fetch current featured settings
  const { data: featuredData } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "home_featured")
    .single();

  const selectedProductIds: string[] = featuredData?.value || [];

  return (
      <main className="flex-1 p-6 lg:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Хіти продажу</h1>
          <p className="text-gray-500 mt-1">Оберіть товари, які будуть відображатися на головній сторінці</p>
        </div>
        <FeaturedClient allProducts={allProducts || []} initialSelectedIds={selectedProductIds} />
      </main>
  );
}
