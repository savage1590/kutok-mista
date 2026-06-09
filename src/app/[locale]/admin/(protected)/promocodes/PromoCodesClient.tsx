"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, X, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { savePromoCode, deletePromoCode, togglePromoCodeStatus } from "./actions";

export default function PromoCodesClient({ initialPromos }: { initialPromos: any[] }) {
  const [promos, setPromos] = useState(initialPromos);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleOpenModal = (promo?: any) => {
    if (promo) {
      setEditingPromo(promo);
      setCode(promo.code);
      setDiscountType(promo.discount_type);
      setDiscountValue(promo.discount_value.toString());
      setMaxUses(promo.max_uses ? promo.max_uses.toString() : "");
      setValidUntil(promo.valid_until ? new Date(promo.valid_until).toISOString().slice(0, 16) : "");
      setIsActive(promo.is_active);
    } else {
      setEditingPromo(null);
      setCode("");
      setDiscountType("percentage");
      setDiscountValue("");
      setMaxUses("");
      setValidUntil("");
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      toast.error("Будь ласка, заповніть код і значення знижки");
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSave = {
        id: editingPromo?.id,
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        max_uses: maxUses ? parseInt(maxUses) : null,
        valid_until: validUntil ? new Date(validUntil).toISOString() : null,
        is_active: isActive
      };

      await savePromoCode(dataToSave);
      toast.success("Промокод збережено");
      setIsModalOpen(false);
      
      // Update local state without refreshing for better UX
      if (editingPromo) {
        setPromos(promos.map(p => p.id === editingPromo.id ? { ...p, ...dataToSave } : p));
      } else {
        // Ideally we should refetch or at least add to list, but server revalidation might kick in on next nav
        window.location.reload(); 
      }
    } catch (err: any) {
      toast.error(err.message || "Помилка при збереженні");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цей промокод?")) return;
    try {
      await deletePromoCode(id);
      setPromos(promos.filter(p => p.id !== id));
      toast.success("Промокод видалено");
    } catch (err: any) {
      toast.error(err.message || "Помилка");
    }
  };

  const handleToggleActive = async (promo: any) => {
    try {
      await togglePromoCodeStatus(promo.id, !promo.is_active);
      setPromos(promos.map(p => p.id === promo.id ? { ...p, is_active: !promo.is_active } : p));
      toast.success(promo.is_active ? "Промокод вимкнено" : "Промокод увімкнено");
    } catch (err: any) {
      toast.error("Помилка при зміні статусу");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Промокоди</h1>
          <p className="text-gray-500 mt-1">Керування знижками для клієнтів</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-light transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Новий промокод
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Код</th>
                <th className="px-6 py-4">Знижка</th>
                <th className="px-6 py-4">Використано</th>
                <th className="px-6 py-4">Діє до</th>
                <th className="px-6 py-4">Статус</th>
                <th className="px-6 py-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {promos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Жодного промокоду не знайдено
                  </td>
                </tr>
              ) : (
                promos.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md tracking-wider">
                        {promo.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {promo.discount_type === 'percentage' 
                        ? <span className="text-blue-600 font-bold">-{promo.discount_value}%</span>
                        : <span className="text-green-600 font-bold">-{promo.discount_value} ₴</span>
                      }
                    </td>
                    <td className="px-6 py-4">
                      {promo.used_count} {promo.max_uses ? `/ ${promo.max_uses}` : '(безліміт)'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {promo.valid_until ? new Date(promo.valid_until).toLocaleDateString('uk-UA') : 'Назавжди'}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleActive(promo)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          promo.is_active 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {promo.is_active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {promo.is_active ? 'Активний' : 'Вимкнений'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(promo)}
                          className="p-2 text-gray-400 hover:text-brand bg-white border border-gray-200 rounded-lg hover:border-brand/30 hover:bg-brand/5 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(promo.id)}
                          className="p-2 text-gray-400 hover:text-red-500 bg-white border border-gray-200 rounded-lg hover:border-red-200 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-xl font-bold">
                {editingPromo ? "Редагувати промокод" : "Створити промокод"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Код *</label>
                <input 
                  required
                  placeholder="Наприклад: SUMMER20"
                  value={code} 
                  onChange={e => setCode(e.target.value.toUpperCase())} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Тип знижки</label>
                  <select 
                    value={discountType} 
                    onChange={e => setDiscountType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand outline-none bg-white"
                  >
                    <option value="percentage">Відсоток (%)</option>
                    <option value="fixed_amount">Фіксована сума (₴)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Розмір знижки *</label>
                  <input 
                    required
                    type="number"
                    min="0"
                    step={discountType === 'percentage' ? "1" : "0.01"}
                    placeholder={discountType === 'percentage' ? "10" : "150"}
                    value={discountValue} 
                    onChange={e => setDiscountValue(e.target.value)} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ліміт використань</label>
                  <input 
                    type="number"
                    min="1"
                    placeholder="Безліміт"
                    value={maxUses} 
                    onChange={e => setMaxUses(e.target.value)} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">Залиште пустим для безліміту</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Діє до (включно)</label>
                  <input 
                    type="datetime-local"
                    value={validUntil} 
                    onChange={e => setValidUntil(e.target.value)} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">Залиште пустим для безліміту</p>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={isActive} 
                  onChange={e => setIsActive(e.target.checked)} 
                  className="w-5 h-5 accent-brand" 
                />
                <span className="font-semibold text-gray-700">Промокод активний</span>
              </label>

              <div className="flex gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Скасувати
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-light transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Збереження..." : "Зберегти"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
