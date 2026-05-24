import { supabaseAdmin } from "@/lib/supabaseAdmin";
import BannersClient from "./BannersClient";

export default async function AdminBannersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Fetch current banners settings
  const { data } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "home_banners")
    .single();

  const banners = data?.value || [];

  return (
      <main className="flex-1 p-6 lg:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Банери (Головна)</h1>
          <p className="text-gray-500 mt-1">Налаштуйте слайдер на головній сторінці</p>
        </div>
        <BannersClient initialBanners={banners} />
      </main>
  );
}
