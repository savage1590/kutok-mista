import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ua" ? "Блог | Kutok Mista" : "Blog | Kutok Mista",
    description: locale === "ua" ? "Новини, статті та історії від Kutok Mista" : "News, articles and stories from Kutok Mista",
  };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isUa = locale === "ua";

  const { data } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "blog_posts")
    .single();

  const posts = (data?.value || []) as any[];

  // Sort by date descending
  const sortedPosts = [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <main className="flex-1 container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
          {isUa ? "Блог" : "Blog"}
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          {isUa 
            ? "Урбаністична естетика, новини бренду та цікаві історії." 
            : "Urban aesthetics, brand news, and interesting stories."}
        </p>
      </div>

      {sortedPosts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          {isUa ? "Ще немає статей." : "No articles yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedPosts.map((post) => (
            <Link 
              href={`/blog/${post.slug}`} 
              key={post.id}
              className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                <Image 
                  src={post.image || '/hero-bg.png'} 
                  alt={isUa ? post.title_ua : post.title_en}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <time className="text-xs font-semibold text-brand tracking-wider uppercase mb-3">
                  {new Date(post.date).toLocaleDateString(isUa ? 'uk-UA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand transition-colors">
                  {isUa ? post.title_ua : post.title_en}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1">
                  {isUa ? post.subtitle_ua : post.subtitle_en}
                </p>
                <div className="text-sm font-medium text-brand flex items-center gap-1">
                  {isUa ? "Читати далі" : "Read more"} &rarr;
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
