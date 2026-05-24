"use client";

import { useState } from"react";
import { Category, PropertyOption } from "@/lib/types";
import { createCategory, updateCategory, deleteCategory } from"./actions";
import { Plus, Edit2, Trash2, X, Check } from"lucide-react";

interface CategoryListClientProps {
 initialCategories: Category[];
}

export default function CategoryListClient({ initialCategories }: CategoryListClientProps) {
 const [categories, setCategories] = useState<Category[]>(initialCategories);
 const [isAdding, setIsAdding] = useState(false);
 const [editingId, setEditingId] = useState<string | null>(null);

 // Form states
 const [slug, setSlug] = useState("");
 const [nameUa, setNameUa] = useState("");
 const [nameEn, setNameEn] = useState("");
 const [propertiesSchema, setPropertiesSchema] = useState<PropertyOption[]>([]);

 const resetForm = () => {
 setSlug("");
 setNameUa("");
 setNameEn("");
 setPropertiesSchema([]);
 setIsAdding(false);
 setEditingId(null);
 };

 const handleEdit = (cat: Category) => {
 setSlug(cat.slug);
 setNameUa(cat.name_ua);
 setNameEn(cat.name_en);
 setPropertiesSchema(cat.properties_schema || []);
 setEditingId(cat.id);
 setIsAdding(false);
 };

 const handleSave = async () => {
 if (!slug || !nameUa || !nameEn) return alert("Заповніть всі поля");
 try {
 if (editingId) {
 await updateCategory(editingId, { slug, name_ua: nameUa, name_en: nameEn, properties_schema: propertiesSchema });
 setCategories(prev => prev.map(c => c.id === editingId ? { ...c, slug, name_ua: nameUa, name_en: nameEn, properties_schema: propertiesSchema } : c));
 } else {
 await createCategory({ slug, name_ua: nameUa, name_en: nameEn, properties_schema: propertiesSchema });
 window.location.reload();
 return;
 }
 resetForm();
 } catch (error: any) {
 alert("Помилка: " + error.message);
 }
 };

 const addProperty = () => {
 setPropertiesSchema([...propertiesSchema, { name: "", label_ua: "", label_en: "", options: [] }]);
 };

 const updateProperty = (index: number, field: keyof PropertyOption, value: any) => {
 const newProps = [...propertiesSchema];
 newProps[index] = { ...newProps[index], [field]: value };
 setPropertiesSchema(newProps);
 };

 const removeProperty = (index: number) => {
 setPropertiesSchema(propertiesSchema.filter((_, i) => i !== index));
 };

 const handleDelete = async (id: string) => {
 if (!confirm("Ви впевнені, що хочете видалити цю категорію? Усі товари цієї категорії залишаться без категорії.")) return;
 try {
 await deleteCategory(id);
 setCategories(prev => prev.filter(c => c.id !== id));
 } catch (error: any) {
 alert("Помилка:"+ error.message);
 }
 };

 return (
 <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
 <div className="p-6 border-b border-gray-200 flex justify-between items-center">
 <h2 className="text-xl font-bold text-foreground">Категорії</h2>
 {!isAdding && (
 <button 
 onClick={() => { resetForm(); setIsAdding(true); }}
 className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-light transition-colors"
 >
 <Plus className="w-4 h-4"/>
 Додати категорію
 </button>
)}
 </div>

 <div className="p-6">
 {/* Add/Edit Form */}
 {(isAdding || editingId) && (
 <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-200">
 <h3 className="font-bold mb-4">{editingId ?"Редагувати категорію":"Нова категорія"}</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
 <div>
 <label className="text-xs text-gray-500 mb-1 block">Slug (URL)</label>
 <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="t-shirts"className="w-full px-3 py-2 rounded-lg border outline-none focus:border-brand"/>
 </div>
 <div>
 <label className="text-xs text-gray-500 mb-1 block">Назва (UA)</label>
 <input value={nameUa} onChange={e => setNameUa(e.target.value)} placeholder="Футболки"className="w-full px-3 py-2 rounded-lg border outline-none focus:border-brand"/>
 </div>
 <div>
 <label className="text-xs text-gray-500 mb-1 block">Name (EN)</label>
 <input value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="T-Shirts"className="w-full px-3 py-2 rounded-lg border outline-none focus:border-brand"/>
 </div>
 </div>

 <div className="mt-6 mb-4">
 <div className="flex items-center justify-between mb-4">
 <h4 className="font-semibold text-sm">Властивості товарів цієї категорії</h4>
 <button onClick={addProperty} className="text-xs flex items-center gap-1 bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded-lg font-medium transition-colors">
 <Plus className="w-3 h-3" /> Додати властивість
 </button>
 </div>
 
 {propertiesSchema.length === 0 ? (
 <p className="text-xs text-gray-500 italic">Немає додаткових властивостей.</p>
 ) : (
 <div className="space-y-4">
 {propertiesSchema.map((prop, index) => (
 <div key={index} className="bg-white border border-gray-200 p-4 rounded-xl flex flex-col gap-3 relative">
 <button onClick={() => removeProperty(index)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50">
 <Trash2 className="w-4 h-4" />
 </button>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-8">
 <div>
 <label className="text-xs text-gray-500 mb-1 block">Ключ (англійською, напр: sizes)</label>
 <input value={prop.name} onChange={e => updateProperty(index, 'name', e.target.value.toLowerCase().replace(/\s+/g, '_'))} className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-brand" />
 </div>
 <div>
 <label className="text-xs text-gray-500 mb-1 block">Назва (Укр)</label>
 <input value={prop.label_ua} onChange={e => updateProperty(index, 'label_ua', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-brand" />
 </div>
 <div>
 <label className="text-xs text-gray-500 mb-1 block">Name (Eng)</label>
 <input value={prop.label_en} onChange={e => updateProperty(index, 'label_en', e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-brand" />
 </div>
 </div>
 <div>
 <label className="text-xs text-gray-500 mb-1 block">Варіанти (через кому)</label>
 <input 
 value={(prop as any)._optionsString ?? prop.options.join(', ')} 
 onChange={e => {
   const val = e.target.value;
   const newProps = [...propertiesSchema];
   newProps[index] = { 
     ...newProps[index], 
     options: val.split(',').map(s => s.trim()).filter(Boolean),
     _optionsString: val
   } as any;
   setPropertiesSchema(newProps);
 }} 
 placeholder="S, M, L, XL"
 className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-brand" 
 />
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 <div className="flex justify-end gap-3">
 <button onClick={resetForm} className="px-4 py-2 text-gray-500 hover:text-foreground font-medium">Скасувати</button>
 <button onClick={handleSave} className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium">Зберегти</button>
 </div>
 </div>
)}

 {/* Categories Table */}
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-gray-100">
 <th className="pb-3 text-sm font-medium text-gray-500">Slug</th>
 <th className="pb-3 text-sm font-medium text-gray-500">Назва (UA)</th>
 <th className="pb-3 text-sm font-medium text-gray-500">Name (EN)</th>
 <th className="pb-3 text-sm font-medium text-gray-500 text-right">Дії</th>
 </tr>
 </thead>
 <tbody>
 {categories.map(cat => (
 <tr key={cat.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
 <td className="py-4 font-mono text-sm">{cat.slug}</td>
 <td className="py-4 font-medium">{cat.name_ua}</td>
 <td className="py-4 text-gray-600">{cat.name_en}</td>
 <td className="py-4 text-right">
 <div className="flex items-center justify-end gap-2">
 <button onClick={() => handleEdit(cat)} className="p-2 text-gray-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors">
 <Edit2 className="w-4 h-4"/>
 </button>
 <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
 <Trash2 className="w-4 h-4"/>
 </button>
 </div>
 </td>
 </tr>
))}
 {categories.length === 0 && (
 <tr>
 <td colSpan={4} className="py-8 text-center text-gray-500">Категорій ще немає</td>
 </tr>
)}
 </tbody>
 </table>
 </div>
 </div>
 </div>
);
}
