"use client";

import { useState } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import { Product } from "@/lib/types";
import { useTranslations } from "next-intl";

export default function FastOrderModal({ 
  product, 
  selectedProperties,
  isOpen, 
  onClose 
}: { 
  product: Product; 
  selectedProperties: Record<string, string>;
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [phone, setPhone] = useState("+380");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const t = useTranslations("Product");

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Basic mask to ensure it starts with +380 and contains only numbers
    if (!val.startsWith("+380")) {
      val = "+380";
    }
    const numbers = val.replace(/[^\d+]/g, '');
    if (numbers.length <= 13) {
      setPhone(numbers);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 13) return; // Basic validation
    
    setStatus("loading");
    
    try {
      // Create fast order via API
      const res = await fetch('/api/fast-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          phone,
          properties: selectedProperties
        })
      });

      if (!res.ok) throw new Error("Failed to create order");
      
      setStatus("success");
      setTimeout(() => {
        onClose();
        setStatus("idle");
        setPhone("+380");
      }, 3000);
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {status === "success" ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Замовлення прийнято!</h2>
            <p className="text-gray-500">Ми зателефонуємо вам найближчим часом для уточнення деталей доставки.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2">Купити в 1 клік</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Введіть ваш номер телефону, і ми зателефонуємо вам для оформлення замовлення на <span className="font-semibold text-gray-900">"{product.name_ua}"</span>.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Номер телефону
                </label>
                <input 
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+380 __ ___ __ __"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors text-lg font-medium tracking-wide"
                  required
                />
              </div>

              {status === "error" && (
                <p className="text-red-500 text-sm font-medium">Сталася помилка. Будь ласка, спробуйте ще раз.</p>
              )}

              <button 
                type="submit"
                disabled={status === "loading" || phone.length < 13}
                className="w-full py-4 bg-brand text-white rounded-xl font-bold text-lg hover:bg-brand-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Відправка...
                  </>
                ) : (
                  "Підтвердити замовлення"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
