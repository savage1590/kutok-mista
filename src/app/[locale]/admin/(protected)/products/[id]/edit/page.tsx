import { redirect, notFound } from"next/navigation";
import ProductFormClient from"../../ProductFormClient";
import { supabaseAdmin } from"@/lib/supabaseAdmin";
import { Product } from"@/lib/types";

export default async function EditProductPage({
 params,
}: {
 params: Promise<{ locale: string; id: string }>;
}) {
 const { locale, id } = await params;

 const { data: product, error } = await supabaseAdmin
 .from("products")
 .select("*, product_images(image_url, is_primary)")
 .eq("id", id)
 .single();

 if (error || !product) {
 notFound();
 }

 const images = product.product_images as any[];
 const primaryImage = images?.find(img => img.is_primary)?.image_url 
 || images?.[0]?.image_url 
 || undefined;

 const formattedProduct: Product = {
 ...product,
 type: product.type as"apparel"|"artifact",
 image_url: primaryImage
 };

 const { data: categories } = await supabaseAdmin
 .from("categories")
 .select("*")
 .order("name_ua");

 const { data: sizeChartsData } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "size_charts")
    .single();

 const sizeCharts = sizeChartsData?.value || [];

 return (
 <div className="flex-1 bg-gray-50 min-h-[calc(100vh-4rem)]">
 <ProductFormClient initialProduct={formattedProduct} categories={categories || []} sizeCharts={sizeCharts as any[]} />
 </div>
);
}
