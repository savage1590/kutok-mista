import { redirect } from"next/navigation";
import ProductFormClient from"../ProductFormClient";
import { supabaseAdmin } from"@/lib/supabaseAdmin";

export default async function NewProductPage({
 params,
}: {
 params: Promise<{ locale: string }>;
}) {
 const { locale } = await params;

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

 const { data: collectionsData } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "collections")
    .single();

 const collections = collectionsData?.value || [];

 return (
 <div className="flex-1 bg-gray-50 min-h-[calc(100vh-4rem)]">
 <ProductFormClient categories={categories || []} sizeCharts={sizeCharts as any[]} collections={collections as any[]} />
 </div>
);
}
