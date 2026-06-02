"use client";

import { useState } from "react";
import { Save, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { saveBlogPosts } from "../../settings-actions";
import Image from "next/image";

type BlogPost = {
  id: string;
  slug: string;
  image: string;
  title_ua: string;
  title_en: string;
  subtitle_ua: string;
  subtitle_en: string;
  text_ua: string;
  text_en: string;
  date: string;
};

const inputCls = "w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

export default function BlogClient({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleAddPost = () => {
    const newPost: BlogPost = {
      id: Date.now().toString(),
      slug: `new-post-${Date.now()}`,
      image: "/hero-bg.png",
      title_ua: "Нова стаття",
      title_en: "New Article",
      subtitle_ua: "",
      subtitle_en: "",
      text_ua: "",
      text_en: "",
      date: new Date().toISOString().split('T')[0]
    };
    setPosts([newPost, ...posts]);
  };

  const handleRemovePost = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  const handleChange = (id: string, field: keyof BlogPost, value: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newPosts = [...posts];
    [newPosts[index - 1], newPosts[index]] = [newPosts[index], newPosts[index - 1]];
    setPosts(newPosts);
  };

  const moveDown = (index: number) => {
    if (index === posts.length - 1) return;
    const newPosts = [...posts];
    [newPosts[index + 1], newPosts[index]] = [newPosts[index], newPosts[index + 1]];
    setPosts(newPosts);
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    const result = await saveBlogPosts(posts);
    setMessage(result.error
      ? { type: "error", text: `Помилка: ${result.error}` }
      : { type: "success", text: "Статті збережено!" }
    );
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={handleAddPost}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:border-brand hover:text-brand transition-all"
        >
          <Plus className="w-4 h-4" />
          Додати статтю
        </button>

        <div className="flex items-center gap-4">
          {message && (
            <span className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand-light transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Збереження..." : "Зберегти зміни"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((post, index) => (
          <div key={post.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-sm font-semibold text-gray-700">Стаття #{index + 1}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => moveUp(index)} disabled={index === 0} className="p-1.5 rounded-lg text-gray-400 hover:text-brand hover:bg-brand/5 disabled:opacity-30 transition-all" title="Вгору">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveDown(index)} disabled={index === posts.length - 1} className="p-1.5 rounded-lg text-gray-400 hover:text-brand hover:bg-brand/5 disabled:opacity-30 transition-all" title="Вниз">
                  <ArrowDown className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-gray-200 mx-1" />
                <button onClick={() => handleRemovePost(post.id)} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Видалити">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 flex flex-col xl:flex-row gap-5">
              <div className="w-full xl:w-72 aspect-video bg-gray-100 rounded-xl overflow-hidden relative flex-shrink-0 border border-gray-200">
                <Image src={post.image || '/hero-bg.png'} alt={post.title_ua} fill className="object-cover" />
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Шлях до фото (public/)</label>
                  <input type="text" value={post.image} onChange={(e) => handleChange(post.id, "image", e.target.value)} className={inputCls} placeholder="/images/blog.jpg" />
                </div>
                <div>
                  <label className={labelCls}>Посилання (URL Slug)</label>
                  <input type="text" value={post.slug} onChange={(e) => handleChange(post.id, "slug", e.target.value)} className={inputCls} placeholder="my-article-name" />
                </div>
                
                <div>
                  <label className={labelCls}>Заголовок UA</label>
                  <input type="text" value={post.title_ua} onChange={(e) => handleChange(post.id, "title_ua", e.target.value)} className={`${inputCls} font-semibold`} />
                </div>
                <div>
                  <label className={labelCls}>Заголовок EN</label>
                  <input type="text" value={post.title_en} onChange={(e) => handleChange(post.id, "title_en", e.target.value)} className={`${inputCls} font-semibold`} />
                </div>
                
                <div>
                  <label className={labelCls}>Підзаголовок UA (Короткий опис)</label>
                  <input type="text" value={post.subtitle_ua} onChange={(e) => handleChange(post.id, "subtitle_ua", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Підзаголовок EN (Короткий опис)</label>
                  <input type="text" value={post.subtitle_en} onChange={(e) => handleChange(post.id, "subtitle_en", e.target.value)} className={inputCls} />
                </div>

                <div className="md:col-span-2">
                  <label className={labelCls}>Дата публікації</label>
                  <input type="date" value={post.date} onChange={(e) => handleChange(post.id, "date", e.target.value)} className={inputCls} />
                </div>

                <div className="md:col-span-2">
                  <label className={labelCls}>Текст статті UA</label>
                  <textarea value={post.text_ua} onChange={(e) => handleChange(post.id, "text_ua", e.target.value)} className={`${inputCls} min-h-[150px] resize-y`} placeholder="Пишіть текст тут. Підтримується звичайний текст." />
                </div>
                
                <div className="md:col-span-2">
                  <label className={labelCls}>Текст статті EN</label>
                  <textarea value={post.text_en} onChange={(e) => handleChange(post.id, "text_en", e.target.value)} className={`${inputCls} min-h-[150px] resize-y`} placeholder="Write text here." />
                </div>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-16 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
            <Plus className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Немає статей. Натисніть «Додати статтю».</p>
          </div>
        )}
      </div>
    </div>
  );
}
