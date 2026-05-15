"use client";

import { useState } from "next";
import { Product } from "@/lib/types";
import { useTranslations } from "next-intl";

export default function InteractiveProductForm({ product }: { product: Product }) {
  const t = useTranslations("Product");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  const hasSizes = product.properties?.sizes && product.properties.sizes.length > 0;
  const hasMaterials = product.properties?.materials && product.properties.materials.length > 0;

  const isAddToCartDisabled = 
    product.stock_status === "out_of_stock" ||
    (hasSizes && !selectedSize) || 
    (hasMaterials && !selectedMaterial);

  return (
    <div className="flex flex-col gap-6 mt-6">
      
      {/* Material Selector */}
      {hasMaterials && (
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-foreground uppercase tracking-wide text-sm">
            {t("materials")}
          </span>
          <div className="flex flex-wrap gap-2">
            {product.properties.materials.map((mat: string) => (
              <button
                key={mat}
                onClick={() => setSelectedMaterial(mat)}
                className={`px-4 py-2 rounded border transition-all font-medium ${
                  selectedMaterial === mat 
                    ? "border-brand bg-brand text-white shadow-md" 
                    : "border-gray-200 text-foreground hover:border-gray-400 bg-white"
                }`}
              >
                {mat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size Selector */}
      {hasSizes && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-foreground uppercase tracking-wide text-sm">
              Розмір
            </span>
            <button 
              onClick={() => setIsSizeChartOpen(true)}
              className="text-brand text-sm font-medium hover:underline"
            >
              {t("sizeChart")}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.properties.sizes.map((size: string) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-12 h-12 flex items-center justify-center rounded border transition-all font-medium ${
                  selectedSize === size 
                    ? "border-brand bg-brand text-white shadow-md" 
                    : "border-gray-200 text-foreground hover:border-gray-400 bg-white"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add To Cart Button */}
      <button 
        disabled={isAddToCartDisabled}
        className="mt-4 w-full md:w-auto py-4 px-8 bg-foreground hover:bg-brand text-white rounded-full font-bold text-lg transition-colors disabled:opacity-50 disabled:hover:bg-foreground"
      >
        {t("addToCart")}
      </button>

      {/* Size Chart Modal */}
      {isSizeChartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl">
            <button 
              onClick={() => setIsSizeChartOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4">{t("sizeChart")}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="py-2">Size</th>
                    <th className="py-2">Chest (cm)</th>
                    <th className="py-2">Length (cm)</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-50"><td className="py-2">S</td><td className="py-2">50</td><td className="py-2">70</td></tr>
                  <tr className="border-b border-gray-50"><td className="py-2">M</td><td className="py-2">53</td><td className="py-2">72</td></tr>
                  <tr className="border-b border-gray-50"><td className="py-2">L</td><td className="py-2">56</td><td className="py-2">74</td></tr>
                  <tr><td className="py-2">XL</td><td className="py-2">59</td><td className="py-2">76</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
