import HeroCarousel from "@/components/home/HeroCarousel";
import HomeCategories from "@/components/home/HomeCategories";
import HomeFeatured from "@/components/home/HomeFeatured";
import HomeAdvantages from "@/components/home/HomeAdvantages";
import { supabase } from "@/lib/supabase";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "home_banners")
    .single();

  const banners = data?.value || [];
  
  return (
    <main className="flex-1 flex flex-col min-h-screen">
      <HeroCarousel banners={banners} />
      <HomeCategories />
      <HomeFeatured locale={locale} />
      <HomeAdvantages />
    </main>
  );
}
