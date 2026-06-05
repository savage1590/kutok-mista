"use client";

import { useState } from "react";
import { Save, AlertCircle } from "lucide-react";
import { updateSetting } from "@/app/[locale]/admin/actions";

export default function LegalPagesSettings({ initialData }: { initialData: any[] }) {
  const [pages, setPages] = useState<any[]>(initialData || []);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(pages[0]?.slug || null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const selectedPage = pages.find(p => p.slug === selectedSlug);
  const selectedIndex = pages.findIndex(p => p.slug === selectedSlug);

  const handleUpdateField = (field: string, value: string) => {
    if (selectedIndex === -1) return;
    const newPages = [...pages];
    newPages[selectedIndex] = { ...newPages[selectedIndex], [field]: value };
    setPages(newPages);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      await updateSetting("legal_pages", pages);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-900">Правова інформація</h2>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm shadow-brand/20"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Збереження..." : "Зберегти всі зміни"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 border-r border-gray-100 p-4 bg-gray-50/30 flex flex-col gap-2">
          {pages.map((page) => (
            <button
              key={page.slug}
              onClick={() => setSelectedSlug(page.slug)}
              className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                selectedSlug === page.slug
                  ? "bg-brand/10 text-brand border border-brand/20"
                  : "text-gray-600 hover:bg-gray-100 border border-transparent"
              }`}
            >
              {page.title_ua}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="flex-1 p-6">
          {saveStatus === "success" && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-2 border border-green-100">
              <AlertCircle className="w-5 h-5" />
              Зміни успішно збережено
            </div>
          )}
          {saveStatus === "error" && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-5 h-5" />
              Помилка при збереженні
            </div>
          )}

          {selectedPage && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Назва (Українська)
                  </label>
                  <input
                    type="text"
                    value={selectedPage.title_ua}
                    onChange={(e) => handleUpdateField("title_ua", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Назва (English)
                  </label>
                  <input
                    type="text"
                    value={selectedPage.title_en}
                    onChange={(e) => handleUpdateField("title_en", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Текст (Українська)
                </label>
                <textarea
                  value={selectedPage.content_ua}
                  onChange={(e) => handleUpdateField("content_ua", e.target.value)}
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand transition-all outline-none resize-y font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Текст (English)
                </label>
                <textarea
                  value={selectedPage.content_en}
                  onChange={(e) => handleUpdateField("content_en", e.target.value)}
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand transition-all outline-none resize-y font-mono text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
