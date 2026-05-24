"use client";

import { useState } from "react";
import { saveFeatured } from "../../settings-actions";
import { Save, Check, Plus } from "lucide-react";
import Image from "next/image";

type Product = {
  id: string;
  name_ua: string;
  type: string;
  price: number;
  product_images: { image_url: string; is_primary: boolean }[];
};

export default function FeaturedClient({
  allProducts,
  initialSelectedIds
}: {
  allProducts: Product[];
  initialSelectedIds: string[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const toggleProduct = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    const result = await saveFeatured(selectedIds);
    setMessage(result.error
      ? { type: "error", text: `Помилка: ${result.error}` }
      : { type: "success", text: "Хіти продажу збережено!" }
    );
    setLoading(false);
  };

  const sortedProducts = [...allProducts].sort((a, b) => {
    const aSelected = selectedIds.includes(a.id);
    const bSelected = selectedIds.includes(b.id);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">
          Обрано: <span className="font-bold text-brand">{selectedIds.length}</span> товарів
        </p>
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
            {loading ? "Збереження..." : "Зберегти"}
          </button>
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sortedProducts.map(product => {
          const isSelected = selectedIds.includes(product.id);
          const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url
            || product.product_images?.[0]?.image_url;

          return (
            <div
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              className={`relative rounded-2xl border-2 cursor-pointer transition-all overflow-hidden bg-white ${
                isSelected
                  ? 'border-brand shadow-md shadow-brand/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Image */}
              <div className="aspect-square bg-gray-100 relative">
                {primaryImage ? (
                  <Image src={primaryImage} alt={product.name_ua} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Немає фото</div>
                )}
                {/* Checkmark badge */}
                <div className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow transition-all ${
                  isSelected ? 'bg-brand scale-100' : 'bg-gray-300 scale-90 opacity-60'
                }`}>
                  {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{product.type}</div>
                <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug">{product.name_ua}</h3>
                <div className="text-sm font-bold text-brand mt-1">{product.price} ₴</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
