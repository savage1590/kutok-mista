"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Palette } from "lucide-react";
import { saveStockStatuses } from "@/app/[locale]/admin/settings-actions";
import { StockStatusDef } from "@/lib/types";

const PRESET_COLORS = [
  "#E53E3E", "#DD6B20", "#D69E2E", "#38A169", "#319795",
  "#3182CE", "#5A67D8", "#805AD5", "#D53F8C", "#1A202C",
];

export default function StockStatusesClient({ initialStatuses }: { initialStatuses: StockStatusDef[] }) {
  const [statuses, setStatuses] = useState<StockStatusDef[]>(initialStatuses || []);
  const [isSaving, setIsSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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
      show_in_card: true,
    };
    setStatuses([...statuses, newStatus]);
    setEditingIndex(statuses.length);
  };

  const deleteStatus = (index: number) => {
    if (confirm("Видалити цей статус? Товари з цим статусом можуть відображатись некоректно, якщо їх не оновити.")) {
      const newStatuses = [...statuses];
      newStatuses.splice(index, 1);
      setStatuses(newStatuses);
      if (editingIndex === index) setEditingIndex(null);
      else if (editingIndex !== null && editingIndex > index) setEditingIndex(editingIndex - 1);
    }
  };

  const updateField = (index: number, field: keyof StockStatusDef, value: any) => {
    const newStatuses = [...statuses];
    newStatuses[index] = { ...newStatuses[index], [field]: value };
    setStatuses(newStatuses);
  };

  const editing = editingIndex !== null ? statuses[editingIndex] : undefined;

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
          {statuses.map((status, index) => (
            <div
              key={status.id}
              onClick={() => setEditingIndex(index)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2 group ${
                editingIndex === index ? "border-brand bg-brand/5 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="px-2 py-1 text-xs font-semibold rounded-full text-white" style={{ backgroundColor: status.color }}>
                  {status.name_ua}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteStatus(index); }}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-gray-500">
                Кошик: {status.allow_purchase ? "Дозволено" : "Заборонено"} | В картці: {status.show_in_card !== false ? "Так" : "Ні"}
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
                <span className="px-3 py-1 text-sm font-semibold rounded-full text-white" style={{ backgroundColor: editing.color }}>
                  {editing.name_ua}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Назва (Українська)</label>
                  <input
                    type="text"
                    value={editing.name_ua}
                    onChange={(e) => updateField(editingIndex!, "name_ua", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Name (English)</label>
                  <input
                    type="text"
                    value={editing.name_en}
                    onChange={(e) => updateField(editingIndex!, "name_en", e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">ID статусу (для бази даних)</label>
                <input
                  type="text"
                  value={editing.id}
                  onChange={(e) => updateField(editingIndex!, "id", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
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

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={editing.show_in_card !== false} // default to true
                    onChange={(e) => updateField(editingIndex!, "show_in_card", e.target.checked)}
                    className="w-5 h-5 text-brand rounded border-gray-300 focus:ring-brand"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">Відображати бейдж в картці товару</div>
                    <div className="text-sm text-gray-500">Якщо вимкнено, цей статус не буде показувати кольорову плашку на фото товару в каталозі.</div>
                  </div>
                </label>
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
                      onClick={() => updateField(editingIndex!, "color", color)}
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
                    value={editing.color || "#000000"}
                    onChange={(e) => updateField(editingIndex!, "color", e.target.value)}
                    className="w-8 h-8 border-0 rounded cursor-pointer"
                  />
                  <span className="text-xs text-gray-500 font-mono">{editing.color}</span>
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
