import { getTranslations } from "next-intl/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import StockStatusesClient from "./StockStatusesClient";
import { DEFAULT_STOCK_STATUSES } from "@/lib/api";

export default async function AdminStockStatusesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin" });

  const { data } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "stock_statuses")
    .single();

  const statuses = data?.value || DEFAULT_STOCK_STATUSES;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Статуси наявності</h1>
        <p className="text-gray-500 mt-2">Керуйте статусами наявності товарів (напр. "В наявності", "Очікується", "Немає").</p>
      </div>

      <StockStatusesClient initialStatuses={statuses} />
    </div>
  );
}
