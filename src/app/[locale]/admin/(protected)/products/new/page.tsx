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

 return (
 <div className="flex-1 bg-gray-50 min-h-[calc(100vh-4rem)]">
 <ProductFormClient categories={categories || []} />
 </div>
);
}
