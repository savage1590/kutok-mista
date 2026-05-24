"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Palette } from "lucide-react";
import { saveCollections } from "@/app/[locale]/admin/settings-actions";

export interface Collection {
  id: string;
  name_ua: string;
  name_en: string;
  slug: string;
  color: string;
}

const PRESET_COLORS = [
  "#E53E3E", "#DD6B20", "#D69E2E", "#38A169", "#319795",
  "#3182CE", "#5A67D8", "#805AD5", "#D53F8C", "#1A202C",
];

export default function CollectionsClient({ initialCollections }: { initialCollections: Collection[] }) {
  const [collections, setCollections] = useState<Collection[]>(initialCollections || []);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await saveCollections(collections);
    if (error) {
      alert("Помилка при збереженні: " + error);
    } else {
      alert("Збережено успішно!");
    }
    setIsSaving(false);
  };

  const addNew = () => {
    const newCollection: Collection = {
      id: "col_" + Date.now().toString(),
      name_ua: "Нова колекція",
      name_en: "New Collection",
      slug: "new-collection-" + Date.now(),
      color: PRESET_COLORS[collections.length % PRESET_COLORS.length],
    };
    setCollections([...collections, newCollection]);
    setEditingId(newCollection.id);
  };

  const deleteCollection = (id: string) => {
    if (confirm("Видалити цю колекцію?")) {
      setCollections(collections.filter(c => c.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  const updateField = (id: string, field: keyof Collection, value: string) => {
    setCollections(collections.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const editing = collections.find(c => c.id === editingId);

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <button
          onClick={addNew}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Створити колекцію
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2 bg-foreground text-white rounded-lg hover:bg-gray-800 font-medium transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isSaving ? "Збереження..." : "Зберегти всі зміни"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* List of collections */}
        <div className="md:col-span-1 flex flex-col gap-2">
          {collections.map(col => (
            <div
              key={col.id}
              onClick={() => setEditingId(col.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3 group ${
                editingId === col.id ? "border-brand bg-brand/5 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
              <span className="font-medium text-sm truncate flex-1">{col.name_ua}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteCollection(col.id); }}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {collections.length === 0 && (
            <div className="p-4 text-center text-gray-400 text-sm border border-dashed rounded-xl">
              Немає колекцій
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="md:col-span-2">
          {editing ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <span className="w-8 h-8 rounded-lg shrink-0" style={{ backgroundColor: editing.color }} />
                <h3 className="text-xl font-bold text-foreground">{editing.name_ua}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Назва (Українська)</label>
                  <input
                    type="text"
                    value={editing.name_ua}
                    onChange={(e) => updateField(editing.id, "name_ua", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Name (English)</label>
                  <input
                    type="text"
                    value={editing.name_en}
                    onChange={(e) => updateField(editing.id, "name_en", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Slug (URL-ідентифікатор)</label>
                <input
                  type="text"
                  value={editing.slug}
                  onChange={(e) => updateField(editing.id, "slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="summer-2026"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand font-mono text-sm"
                />
                <p className="text-xs text-gray-400">Тільки латинські літери, цифри та дефіс</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Колір плашки
                </label>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => updateField(editing.id, "color", color)}
                      className={`w-9 h-9 rounded-lg transition-all hover:scale-110 ${
                        editing.color === color ? "ring-2 ring-offset-2 ring-brand scale-110" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-400">Або введіть свій:</span>
                  <input
                    type="color"
                    value={editing.color}
                    onChange={(e) => updateField(editing.id, "color", e.target.value)}
                    className="w-8 h-8 border-0 rounded cursor-pointer"
                  />
                  <span className="text-xs text-gray-500 font-mono">{editing.color}</span>
                </div>
              </div>

              {/* Preview */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-3">Попередній перегляд плашки:</p>
                <div className="flex gap-3 items-center">
                  <span
                    className="text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm"
                    style={{ backgroundColor: editing.color }}
                  >
                    {editing.name_ua}
                  </span>
                  <span
                    className="text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm"
                    style={{ backgroundColor: editing.color }}
                  >
                    {editing.name_en}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-gray-100 border-dashed h-64 flex items-center justify-center text-gray-400">
              Виберіть колекцію зліва або створіть нову
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
