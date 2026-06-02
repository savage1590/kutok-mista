import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminReviewsClient from "./AdminReviewsClient";

export default async function AdminReviewsPage() {
  const { data } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "product_reviews")
    .single();

  const reviews = data?.value || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Відгуки клієнтів</h1>
        <p className="text-gray-500 mt-1">Модерація та управління відгуками</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <AdminReviewsClient initialReviews={reviews as any[]} />
      </div>
    </div>
  );
}
