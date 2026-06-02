import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ReviewsClient from "./ReviewsClient";

export default async function ProductReviews({ productId, locale }: { productId: string, locale: string }) {
  // Fetch all reviews from settings
  const { data } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "product_reviews")
    .single();

  const allReviews = (data?.value || []) as any[];
  
  // Filter for this product and approved ones (or show all for demo)
  const productReviews = allReviews
    .filter(r => r.product_id === productId && r.status === 'approved')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="mt-16 pt-12 border-t border-gray-100">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
        {locale === "ua" ? "Відгуки клієнтів" : "Customer Reviews"}
        <span className="text-gray-400 text-lg ml-3 font-normal">({productReviews.length})</span>
      </h2>
      
      <ReviewsClient productId={productId} initialReviews={productReviews} locale={locale} />
    </div>
  );
}
