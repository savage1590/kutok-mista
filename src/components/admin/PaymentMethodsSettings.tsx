"use client";

import { useState } from "react";
import { Plus, Trash2, Save, GripVertical } from "lucide-react";
import toast from "react-hot-toast";

export type PaymentMethod = {
  id: string;
  type: "system" | "custom";
  isActive: boolean;
  name_ua: string;
  name_en: string;
  description_ua?: string;
  description_en?: string;
};

interface Props {
  initialMethods: PaymentMethod[];
  onSave: (methods: PaymentMethod[]) => Promise<void>;
}

export default function PaymentMethodsSettings({ initialMethods, onSave }: Props) {
  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods || []);
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = () => {
    const newMethod: PaymentMethod = {
      id: `custom_${Date.now()}`,
      type: "custom",
      isActive: true,
      name_ua: "Новий спосіб оплати",
      name_en: "New payment method",
      description_ua: "",
      description_en: "",
    };
    setMethods([...methods, newMethod]);
  };

  const handleRemove = (id: string) => {
    setMethods(methods.filter((m) => m.id !== id));
  };

  const handleChange = (id: string, field: keyof PaymentMethod, value: any) => {
    setMethods(
      methods.map((m) => {
        if (m.id === id) {
          return { ...m, [field]: value };
        }
        return m;
      })
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(methods);
      toast.success("Способи оплати збережено");
    } catch (error) {
      toast.error("Помилка збереження");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Способи оплати</h2>
          <p className="text-gray-500 text-sm mt-1">
            Керуйте варіантами оплати в кошику
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Додати спосіб
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        {methods.map((method, index) => (
          <div
            key={method.id}
            className="flex flex-col gap-4 p-5 border rounded-2xl bg-gray-50/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`px-2 py-1 text-xs font-bold rounded ${
                    method.type === "system"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {method.type === "system" ? "Системний" : "Кастомний"}
                </div>
                {method.type === "system" && (
                  <span className="text-sm text-gray-500 font-mono">
                    {method.id}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm font-medium">Активний</span>
                  <div
                    className={`w-11 h-6 rounded-full p-1 transition-colors ${
                      method.isActive ? "bg-brand" : "bg-gray-300"
                    }`}
                    onClick={() =>
                      handleChange(method.id, "isActive", !method.isActive)
                    }
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        method.isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </label>
                {method.type === "custom" && (
                  <button
                    onClick={() => handleRemove(method.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Видалити"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Назва (UA)
                </label>
                <input
                  value={method.name_ua}
                  onChange={(e) =>
                    handleChange(method.id, "name_ua", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:border-brand outline-none"
                  placeholder="Наприклад: Оплата на карту"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Назва (EN)
                </label>
                <input
                  value={method.name_en}
                  onChange={(e) =>
                    handleChange(method.id, "name_en", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:border-brand outline-none"
                  placeholder="For example: Direct bank transfer"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Опис/Реквізити (UA)
                </label>
                <textarea
                  value={method.description_ua || ""}
                  onChange={(e) =>
                    handleChange(method.id, "description_ua", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:border-brand outline-none resize-none"
                  placeholder="Додаткова інформація для клієнта"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Опис/Реквізити (EN)
                </label>
                <textarea
                  value={method.description_en || ""}
                  onChange={(e) =>
                    handleChange(method.id, "description_en", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:border-brand outline-none resize-none"
                  placeholder="Additional info for client"
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
        {methods.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            Немає жодного способу оплати
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-3 bg-brand text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-light transition-colors disabled:opacity-50"
      >
        <Save className="w-5 h-5" />
        {isSaving ? "Збереження..." : "Зберегти способи оплати"}
      </button>
    </div>
  );
}
