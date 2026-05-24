import { supabaseAdmin } from "@/lib/supabaseAdmin";
import HomeCategoriesClient from "./HomeCategoriesClient";

export default async function AdminHomeCategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Fetch current home categories settings
  const { data } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "home_categories")
    .single();

  const categories = data?.value || [];

  return (
      <main className="flex-1 p-6 lg:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Категорії (Головна)</h1>
          <p className="text-gray-500 mt-1">Налаштуйте блоки категорій на головній сторінці</p>
        </div>

        <HomeCategoriesClient initialCategories={categories as any[]} />
      </main>
  );
}
