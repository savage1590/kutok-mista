import { supabaseAdmin } from "@/lib/supabaseAdmin";
import SizeChartsClient from "./SizeChartsClient";

export default async function AdminSizeChartsPage() {
  const { data } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "size_charts")
    .single();

  const sizeCharts = data?.value || [];

  return (
      <main className="flex-1 p-6 lg:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Розмірні сітки</h1>
          <p className="text-gray-500 mt-1">Керування глобальними розмірними сітками для товарів</p>
        </div>

        <SizeChartsClient initialSizeCharts={sizeCharts as any[]} />
      </main>
  );
}
