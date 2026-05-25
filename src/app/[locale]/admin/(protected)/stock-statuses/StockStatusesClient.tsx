"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Palette } from "lucide-react";
import { saveStockStatuses } from "@/app/[locale]/admin/settings-actions";
import { StockStatusDef } from "@/lib/types";

const PRESET_COLORS = [
  "bg-green-100 text-green-800",
  "bg-red-100 text-red-800",
  "bg-yellow-100 text-yellow-800",
  "bg-blue-100 text-blue-800",
  "bg-purple-100 text-purple-800",
  "bg-gray-100 text-gray-800",
  "bg-orange-100 text-orange-800",
  "bg-teal-100 text-teal-800",
];

export default function StockStatusesClient({ initialStatuses }: { initialStatuses: StockStatusDef[] }) {
  const [statuses, setStatuses] = useState<StockStatusDef[]>(initialStatuses || []);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await saveStockStatuses(statuses);
    if (error) {
      alert("Помилка при збереженні: " + error);
    } else {
      alert("Збережено успішно!");
    }
    setIsSaving(false);
  };

  const addNew = () => {
    const newStatus: StockStatusDef = {
      id: "status_" + Date.now().toString(),
      name_ua: "Новий статус",
      name_en: "New Status",
      color: PRESET_COLORS[statuses.length % PRESET_COLORS.length],
      allow_purchase: true,
    };
    setStatuses([...statuses, newStatus]);
    setEditingId(newStatus.id);
  };

  const deleteStatus = (id: string) => {
    if (confirm("Видалити цей статус? Товари з цим статусом можуть відображатись некоректно, якщо їх не оновити.")) {
      setStatuses(statuses.filter(s => s.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  const updateField = (id: string, field: keyof StockStatusDef, value: any) => {
    setStatuses(statuses.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const editing = statuses.find(s => s.id === editingId);

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <button
          onClick={addNew}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Створити статус
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
        {/* List of statuses */}
        <div className="md:col-span-1 flex flex-col gap-2">
          {statuses.map(status => (
            <div
              key={status.id}
              onClick={() => setEditingId(status.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 group ${
                editingId === status.id ? "border-brand bg-brand/5 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                  {status.name_ua}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteStatus(status.id); }}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-gray-500">
                Кошик: {status.allow_purchase ? "Дозволено" : "Заборонено"}
              </div>
            </div>
          ))}
          {statuses.length === 0 && (
            <div className="p-4 text-center text-gray-400 text-sm border border-dashed rounded-xl">
              Немає статусів
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="md:col-span-2">
          {editing ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${editing.color}`}>
                  {editing.name_ua}
                </span>
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
                <label className="text-sm font-semibold text-gray-700">ID статусу (для бази даних)</label>
                <input
                  type="text"
                  value={editing.id}
                  onChange={(e) => updateField(editing.id, "id", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  disabled={editing.id === "in_stock" || editing.id === "out_of_stock"}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand font-mono text-sm disabled:bg-gray-100 disabled:text-gray-500"
                />
                <p className="text-xs text-gray-400">Тільки латинські літери, цифри та нижнє підкреслення. (Системні ID змінити не можна)</p>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={editing.allow_purchase}
                    onChange={(e) => updateField(editing.id, "allow_purchase", e.target.checked)}
                    className="w-5 h-5 text-brand rounded border-gray-300 focus:ring-brand"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">Дозволити покупку</div>
                    <div className="text-sm text-gray-500">Якщо вимкнено, кнопка "Додати в кошик" буде недоступна.</div>
                  </div>
                </label>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Колір (Tailwind класи)
                </label>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => updateField(editing.id, "color", color)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105 ${color} ${
                        editing.color === color ? "ring-2 ring-offset-2 ring-brand scale-105" : ""
                      }`}
                    >
                      Приклад
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-xs text-gray-400">Або введіть власні класи Tailwind:</span>
                  <input
                    type="text"
                    value={editing.color}
                    onChange={(e) => updateField(editing.id, "color", e.target.value)}
                    placeholder="bg-indigo-100 text-indigo-800"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-gray-100 border-dashed h-64 flex items-center justify-center text-gray-400">
              Виберіть статус зліва або створіть новий
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
