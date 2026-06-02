import BlogClient from "./BlogClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function AdminBlogPage() {
  const { data } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "blog_posts")
    .single();

  const posts = data?.value || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Блог</h1>
        <p className="text-gray-500 mt-1">Керування статтями блогу</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <BlogClient initialPosts={posts as any[]} />
      </div>
    </div>
  );
}
