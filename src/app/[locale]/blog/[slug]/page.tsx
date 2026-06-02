import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  
  const { data } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "blog_posts")
    .single();

  const posts = (data?.value || []) as any[];
  const post = posts.find(p => p.slug === slug);

  if (!post) {
    return {
      title: locale === "ua" ? "Статтю не знайдено | Kutok Mista" : "Article Not Found | Kutok Mista",
    };
  }

  const title = locale === "ua" ? post.title_ua : post.title_en;
  const description = locale === "ua" ? post.subtitle_ua : post.subtitle_en;

  return {
    title: `${title} | Kutok Mista`,
    description: description,
    openGraph: {
      title: `${title} | Kutok Mista`,
      description: description,
      url: `https://www.kutok-mista.com.ua/${locale}/blog/${slug}`,
      siteName: 'Kutok Mista',
      images: post.image ? [
        {
          url: post.image.startsWith('http') ? post.image : `https://www.kutok-mista.com.ua${post.image}`,
          width: 1200,
          height: 630,
          alt: title,
        }
      ] : [],
      locale: locale === 'ua' ? 'uk_UA' : 'en_US',
      type: 'article',
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const isUa = locale === "ua";

  const { data } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "blog_posts")
    .single();

  const posts = (data?.value || []) as any[];
  const post = posts.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  const title = isUa ? post.title_ua : post.title_en;
  const subtitle = isUa ? post.subtitle_ua : post.subtitle_en;
  const text = isUa ? post.text_ua : post.text_en;

  return (
    <main className="flex-1 bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Breadcrumbs 
          items={[
            { label: isUa ? "Блог" : "Blog", href: "/blog" },
            { label: title }
          ]} 
        />

        <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand transition-colors mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" />
          {isUa ? "Назад до блогу" : "Back to blog"}
        </Link>

        <article>
          <header className="mb-10 text-center">
            <time className="text-sm font-semibold text-brand tracking-wider uppercase mb-4 block">
              {new Date(post.date).toLocaleDateString(isUa ? 'uk-UA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
          </header>

          <div className="relative w-full aspect-[21/9] bg-gray-100 rounded-3xl overflow-hidden mb-12 shadow-sm border border-gray-100">
            <Image 
              src={post.image || '/hero-bg.png'} 
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="prose prose-lg md:prose-xl prose-gray mx-auto text-gray-700 leading-relaxed font-sans">
            {text.split('\n').map((paragraph: string, index: number) => {
              if (!paragraph.trim()) return <br key={index} />;
              return <p key={index} className="mb-6">{paragraph}</p>;
            })}
          </div>
        </article>
      </div>
    </main>
  );
}
