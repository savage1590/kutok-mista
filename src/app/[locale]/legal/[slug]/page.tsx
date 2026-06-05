import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const revalidate = 0; // Disable caching for now to always fetch latest

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "legal_pages")
    .single();

  const legalPages = (data?.value || []) as any[];
  const pageData = legalPages.find((p: any) => p.slug === slug);

  if (!pageData) {
    notFound();
  }

  const title = locale === "ua" ? pageData.title_ua : pageData.title_en;
  const content = locale === "ua" ? pageData.content_ua : pageData.content_en;

  return (
    <main className="flex-1 container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>
        <div className="prose prose-lg prose-gray max-w-none whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
          {content}
        </div>
      </div>
    </main>
  );
}
