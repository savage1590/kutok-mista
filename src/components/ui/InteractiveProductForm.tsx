"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { useTranslations, useLocale } from "next-intl";
import { useCartStore } from "@/lib/store";
import WishlistButton from "./WishlistButton";
import { Truck, CreditCard, Info } from "lucide-react";
import toast from "react-hot-toast";

export default function InteractiveProductForm({ product, sizeChart }: { product: Product; sizeChart?: any }) {
  const t = useTranslations("Product");
  const locale = useLocale();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedProperties, setSelectedProperties] = useState<Record<string, string>>({});
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  const propertiesSchema = product.categories?.properties_schema || [];
  const propertyKeys = Object.keys(product.properties || {}).filter(k => Array.isArray(product.properties[k]) && product.properties[k].length > 0);

  const isAddToCartDisabled = 
    product.stock_status === "out_of_stock" ||
    propertyKeys.some(k => !selectedProperties[k]);

  const toggleProperty = (key: string, val: string) => {
    setSelectedProperties(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="flex flex-col gap-6 mt-6">
      
      {propertyKeys.map(key => {
        const schema = propertiesSchema.find(s => s.name === key);
        const label = schema ? (locale === 'ua' ? schema.label_ua : schema.label_en) : key;
        const options = product.properties[key];
        
        return (
          <div key={key} className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground uppercase tracking-wide text-sm">
                {label}
              </span>
              {key === 'sizes' && sizeChart && (
                <button 
                  onClick={() => setIsSizeChartOpen(true)}
                  className="text-brand text-sm font-medium hover:underline"
                >
                  {t("sizeChart")}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {options.map((opt: string) => (
                <button
                  key={opt}
                  onClick={() => toggleProperty(key, opt)}
                  className={`px-4 py-2 min-w-[3rem] rounded border transition-all font-medium ${
                    selectedProperties[key] === opt 
                      ? "border-brand bg-brand text-white shadow-md" 
                      : "border-gray-200 text-foreground hover:border-gray-400 bg-white"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mt-4">
        <button 
          onClick={() => {
            addItem(product, 1, selectedProperties);
            toast.success(locale === "ua" ? "Товар додано в кошик" : "Item added to cart");
          }}
          disabled={isAddToCartDisabled}
          className="flex-1 py-4 px-8 bg-foreground hover:bg-brand text-white rounded-full font-bold text-lg transition-colors disabled:opacity-50 disabled:hover:bg-foreground"
        >
          {t("addToCart")}
        </button>
        <WishlistButton product={product} showText={false} className="w-14 h-14 bg-gray-100 hover:bg-red-50 text-gray-500" />
      </div>

      {/* General Information Block */}
      <div className="mt-8 pt-8 border-t border-gray-100">
        <h3 className="font-bold text-lg text-foreground flex items-center gap-2 mb-6">
          <Info className="w-5 h-5 text-brand" />
          {t("generalInfo")}
        </h3>
        
        <div className="flex flex-col gap-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-brand" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">{t("deliveryTitle")}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t("deliveryText")}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6 text-brand" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">{t("paymentTitle")}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t("paymentMethods")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      {isSizeChartOpen && sizeChart && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl">
            <button 
              onClick={() => setIsSizeChartOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4">{sizeChart.name || t("sizeChart")}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    {sizeChart.columns?.map((col: string, idx: number) => (
                      <th key={idx} className="py-2 pr-4 whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  {sizeChart.rows?.map((row: Record<string, string>, rIdx: number) => (
                    <tr key={rIdx} className="border-b border-gray-50 last:border-0">
                      {sizeChart.columns?.map((col: string, cIdx: number) => (
                        <td key={cIdx} className="py-2 pr-4">{row[col] || "-"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
