import { supabaseAdmin } from "@/lib/supabaseAdmin";
import CategoryListClient from "./CategoryListClient";

export default async function AdminCategoriesPage({
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
      <main className="flex-1 p-6 lg:p-10">
        <CategoryListClient initialCategories={categories || []} />
      </main>
  );
}
