"use client";

import { useState } from"react";
import { Product, Category, ProductType } from"@/lib/types";
import { saveProduct, deleteProduct } from"./actions";
import { ArrowLeft, Save, Trash2, Upload } from"lucide-react";

import { Link } from"@/i18n/routing";

interface ProductFormClientProps {
 initialProduct?: Product;
 categories: Category[];
 sizeCharts?: any[];
}

export default function ProductFormClient({ initialProduct, categories, sizeCharts = [] }: ProductFormClientProps) {
  const [type, setType] = useState<ProductType>(initialProduct?.type ||"apparel");
 const [isLoading, setIsLoading] = useState(false);
 const [isDeleting, setIsDeleting] = useState(false);
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id || "");
  const selectedCategory = categories.find(c => c.id === categoryId);

  // Property state
  const [properties, setProperties] = useState<Record<string, string[]>>(initialProduct?.properties || {});

  const toggleProperty = (propName: string, item: string) => {
    setProperties(prev => {
      const current = prev[propName] || [];
      return {
        ...prev,
        [propName]: current.includes(item) ? current.filter(i => i !== item) : [...current, item]
      };
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCatId = e.target.value;
    setCategoryId(newCatId);
    
    // Auto-update type if helpful
    const cat = categories.find(c => c.id === newCatId);
    if (cat?.slug === 'apparel') setType('apparel');
    else setType('artifact');
  };

 const handleDelete = async () => {
 if (!initialProduct) return;
 if (!confirm("Ви впевнені, що хочете видалити цей товар?")) return;
 
 setIsDeleting(true);
 try {
 await deleteProduct(initialProduct.id);
 } catch (error) {
 alert("Помилка видалення товару");
 setIsDeleting(false);
 }
 };

 return (
 <div className="max-w-4xl mx-auto py-8 px-4">
 <div className="mb-8 flex items-center justify-between">
 <Link href="/admin"className="flex items-center gap-2 text-gray-500 hover:text-foreground transition-colors font-medium">
 <ArrowLeft className="w-5 h-5"/>
 Назад до списку
 </Link>
 {initialProduct && (
 <button 
 type="button"
 onClick={handleDelete}
 disabled={isDeleting}
 className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
 >
 <Trash2 className="w-5 h-5"/>
 {isDeleting ?"Видалення...":"Видалити"}
 </button>
)}
 </div>

 <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-10 shadow-sm">
 <h1 className="text-2xl font-bold text-foreground mb-8">
 {initialProduct ?"Редагувати товар":"Додати новий товар"}
 </h1>

 <form action={async (formData) => {
 setIsLoading(true);
 try {
 await saveProduct(formData, initialProduct?.id);
 } catch (error) {
  if (typeof error === 'object' && error !== null && 'digest' in error && typeof (error as any).digest === 'string' && (error as any).digest.startsWith('NEXT_REDIRECT')) {
    throw error;
  }
  alert("Помилка збереження. Перевірте консоль.");
 console.error(error);
 setIsLoading(false);
 }
 }} className="space-y-8">
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-sm font-semibold text-foreground">Назва (Українська) *</label>
 <input name="name_ua"required defaultValue={initialProduct?.name_ua} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-brand outline-none"/>
 </div>
 <div className="space-y-2">
 <label className="text-sm font-semibold text-foreground">Name (English) *</label>
 <input name="name_en"required defaultValue={initialProduct?.name_en} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-brand outline-none"/>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-sm font-semibold text-foreground">Опис (Українська) *</label>
 <textarea name="description_ua"required defaultValue={initialProduct?.description_ua} rows={3} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-brand outline-none"/>
 </div>
 <div className="space-y-2">
 <label className="text-sm font-semibold text-foreground">Description (English) *</label>
 <textarea name="description_en"required defaultValue={initialProduct?.description_en} rows={3} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-brand outline-none"/>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
 <div className="space-y-2">
 <label className="text-sm font-semibold text-foreground">Ціна (₴) *</label>
 <input type="number"name="price"required defaultValue={initialProduct?.price} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-brand outline-none"/>
 </div>
 
 <div className="space-y-2">
 <label className="text-sm font-semibold text-foreground">Тип товару</label>
 <select 
 name="type"
 value={type} 
 onChange={(e) => setType(e.target.value as ProductType)}
 className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-brand outline-none"
 >
 <option value="apparel">Одяг (Apparel)</option>
 <option value="artifact">Артефакт (3D Artifact)</option>
 <option value="souvenir">Сувенір (Souvenir)</option>
 </select>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-semibold text-foreground">Статус наявності</label>
 <select name="stock_status"defaultValue={initialProduct?.stock_status ||"in_stock"} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-brand outline-none">
 <option value="in_stock">В наявності</option>
 <option value="out_of_stock">Немає в наявності</option>
 </select>
 </div>

  <div className="space-y-2">
  <label className="text-sm font-semibold text-foreground">Розмірна сітка</label>
  <select name="size_chart_id" defaultValue={initialProduct?.properties?.size_chart_id || ""} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-brand outline-none">
    <option value="">Не використовувати (Без сітки)</option>
    {sizeCharts.map(sc => (
      <option key={sc.id} value={sc.id}>{sc.name}</option>
    ))}
  </select>
  </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
 <div className="space-y-2">
 <label className="text-sm font-semibold text-foreground">Категорія</label>
              <select 
                name="category_id"
                value={categoryId}
                onChange={handleCategoryChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-brand outline-none"
              >
 <option value=""disabled>Оберіть категорію...</option>
 {categories.map((cat) => (
 <option key={cat.id} value={cat.id}>{cat.name_ua} / {cat.name_en}</option>
))}
 </select>
 </div>
 </div>
 
        {/* Dynamic Properties based on category schema */}
        {selectedCategory && (
          <div className="p-6 bg-gray-50 rounded-2xl space-y-6">
            <h3 className="font-semibold text-foreground">Властивості {selectedCategory ? `(${selectedCategory.name_ua})` : ''}</h3>
            
            {!selectedCategory.properties_schema || selectedCategory.properties_schema.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                Для цієї категорії ще не налаштовано жодної властивості (розміри, кольори тощо). 
                Ви можете додати їх у розділі <a href="/ua/admin/categories" className="text-brand hover:underline">Категорії</a>.
              </p>
            ) : (
              selectedCategory.properties_schema.map((propSchema) => (
                <div key={propSchema.name}>
                  <p className="text-sm text-gray-500 mb-3">{propSchema.label_ua}:</p>
                  <div className="flex flex-wrap gap-2">
                    {propSchema.options.map(option => (
                      <label key={option} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 cursor-pointer hover:border-brand">
                        <input 
                          type="checkbox" 
                          name={`prop_${propSchema.name}`} 
                          value={option} 
                          checked={(properties[propSchema.name] || []).includes(option)} 
                          onChange={() => toggleProperty(propSchema.name, option)} 
                          className="accent-brand" 
                        />
                        <span className="font-medium">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

 <label className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 cursor-pointer">
 <input type="checkbox"name="is_on_demand"defaultChecked={initialProduct?.is_on_demand} className="w-5 h-5 accent-brand"/>
 <div>
 <span className="font-medium text-foreground block">Виготовлення на замовлення</span>
 <span className="text-sm text-gray-500">Товар виготовляється після оплати (3-5 днів)</span>
 </div>
 </label>

 <div className="space-y-4">
 <h3 className="font-semibold text-foreground">Зображення товару</h3>
 
 {initialProduct?.image_url && (
 <div className="mb-4">
 <p className="text-sm text-gray-500 mb-2">Поточне головне зображення:</p>
 <img src={initialProduct.image_url} alt="Current"className="w-32 h-32 object-cover rounded-xl border border-gray-200"/>
 </div>
)}

 <div className="flex items-center justify-center w-full">
 <label htmlFor="dropzone-file"className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
 <div className="flex flex-col items-center justify-center pt-5 pb-6">
 <Upload className="w-10 h-10 mb-3 text-gray-400"/>
 <p className="mb-2 text-sm text-gray-500">
 <span className="font-semibold">Натисніть для завантаження</span> або перетягніть
 </p>
 <p className="text-xs text-gray-500">PNG, JPG, WEBP (Макс. 5MB)</p>
 </div>
 <input id="dropzone-file"name="image"type="file"className="hidden"accept="image/png, image/jpeg, image/webp"/>
 </label>
 </div>
 <p className="text-xs text-gray-400 italic">
 Примітка: Завантаження нового зображення встановить його як головне. (Переконайтеся, що ви створили бакет `product-images` в Supabase Storage).
 </p>
 </div>

 <div className="pt-6 border-t border-gray-100">
 <button 
 type="submit"
 disabled={isLoading}
 className="w-full flex justify-center items-center gap-2 py-4 bg-brand text-white rounded-xl font-bold tracking-wide hover:bg-brand-light hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-brand/20 disabled:opacity-50 disabled:hover:translate-y-0"
 >
 <Save className="w-5 h-5"/>
 {isLoading ?"Збереження...":"Зберегти товар"}
 </button>
 </div>

 </form>
 </div>
 </div>
);
}
