"use client";

import { useState } from "react";
import { Save, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { saveBanners } from "../../settings-actions";
import Image from "next/image";

type Banner = {
  id: string;
  image: string;
  title_ua: string;
  title_en: string;
  subtitle_ua: string;
  subtitle_en: string;
  btn_ua: string;
  btn_en: string;
  link: string;
};

const inputCls = "w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

export default function BannersClient({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleAddBanner = () => {
    const newBanner: Banner = {
      id: Date.now().toString(),
      image: "/hero-bg.png",
      title_ua: "Новий банер",
      title_en: "New Banner",
      subtitle_ua: "",
      subtitle_en: "",
      btn_ua: "Детальніше",
      btn_en: "Learn More",
      link: "/products"
    };
    setBanners([...banners, newBanner]);
  };

  const handleRemoveBanner = (id: string) => {
    setBanners(banners.filter(b => b.id !== id));
  };

  const handleChange = (id: string, field: keyof Banner, value: string) => {
    setBanners(banners.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newBanners = [...banners];
    [newBanners[index - 1], newBanners[index]] = [newBanners[index], newBanners[index - 1]];
    setBanners(newBanners);
  };

  const moveDown = (index: number) => {
    if (index === banners.length - 1) return;
    const newBanners = [...banners];
    [newBanners[index + 1], newBanners[index]] = [newBanners[index], newBanners[index + 1]];
    setBanners(newBanners);
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    const result = await saveBanners(banners);
    setMessage(result.error
      ? { type: "error", text: `Помилка: ${result.error}` }
      : { type: "success", text: "Банери збережено!" }
    );
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={handleAddBanner}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:border-brand hover:text-brand transition-all"
        >
          <Plus className="w-4 h-4" />
          Додати банер
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

      {/* Banners list */}
      <div className="space-y-4">
        {banners.map((banner, index) => (
          <div key={banner.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-sm font-semibold text-gray-700">Банер #{index + 1}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => moveUp(index)} disabled={index === 0} className="p-1.5 rounded-lg text-gray-400 hover:text-brand hover:bg-brand/5 disabled:opacity-30 transition-all" title="Вгору">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveDown(index)} disabled={index === banners.length - 1} className="p-1.5 rounded-lg text-gray-400 hover:text-brand hover:bg-brand/5 disabled:opacity-30 transition-all" title="Вниз">
                  <ArrowDown className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-gray-200 mx-1" />
                <button onClick={() => handleRemoveBanner(banner.id)} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Видалити">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card body */}
            <div className="p-5 flex flex-col xl:flex-row gap-5">
              {/* Preview */}
              <div className="w-full xl:w-72 aspect-video bg-gray-100 rounded-xl overflow-hidden relative flex-shrink-0 border border-gray-200">
                <Image src={banner.image || '/hero-bg.png'} alt={banner.title_ua} fill className="object-cover" />
              </div>

              {/* Fields */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelCls}>Шлях до зображення (в папці public/)</label>
                  <input type="text" value={banner.image} onChange={(e) => handleChange(banner.id, "image", e.target.value)} className={inputCls} placeholder="/images/my-banner.jpg" />
                </div>
                <div>
                  <label className={labelCls}>Заголовок UA</label>
                  <input type="text" value={banner.title_ua} onChange={(e) => handleChange(banner.id, "title_ua", e.target.value)} className={`${inputCls} font-semibold`} />
                </div>
                <div>
                  <label className={labelCls}>Заголовок EN</label>
                  <input type="text" value={banner.title_en} onChange={(e) => handleChange(banner.id, "title_en", e.target.value)} className={`${inputCls} font-semibold`} />
                </div>
                <div>
                  <label className={labelCls}>Підзаголовок UA</label>
                  <input type="text" value={banner.subtitle_ua} onChange={(e) => handleChange(banner.id, "subtitle_ua", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Підзаголовок EN</label>
                  <input type="text" value={banner.subtitle_en} onChange={(e) => handleChange(banner.id, "subtitle_en", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Текст кнопки UA</label>
                  <input type="text" value={banner.btn_ua} onChange={(e) => handleChange(banner.id, "btn_ua", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Текст кнопки EN</label>
                  <input type="text" value={banner.btn_en} onChange={(e) => handleChange(banner.id, "btn_en", e.target.value)} className={inputCls} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>Посилання кнопки (URL)</label>
                  <input type="text" value={banner.link} onChange={(e) => handleChange(banner.id, "link", e.target.value)} className={inputCls} placeholder="/products?category=apparel" />
                </div>
              </div>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="text-center py-16 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
            <Plus className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Немає банерів. Натисніть «Додати банер».</p>
          </div>
        )}
      </div>
    </div>
  );
}
