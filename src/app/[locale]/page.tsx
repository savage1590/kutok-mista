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

  const { data: bannersData } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "home_banners")
    .single();

  const banners = bannersData?.value || [];

  const { data: categoriesData } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "home_categories")
    .single();

  const homeCategories = categoriesData?.value || [];

  return (
    <main className="flex min-h-screen flex-col items-center">
      <HeroCarousel banners={banners as any[]} />
      <HomeCategories categories={homeCategories as any[]} locale={locale} />
      <HomeFeatured locale={locale} />
      <HomeAdvantages />
    </main>
  );
}
