"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Product, Category, ProductType } from "@/lib/types";
import { saveProduct, deleteProduct, deleteProductImage, setPrimaryImage } from "./actions";
import { ArrowLeft, Save, Trash2, Upload, Star } from "lucide-react";
import toast from "react-hot-toast";
import ImageCropper from "@/components/ui/ImageCropper";

import { Link } from"@/i18n/routing";

interface ProductFormClientProps {
 initialProduct?: Product;
 categories: Category[];
  sizeCharts?: any[];
  collections?: any[];
  stockStatuses?: any[];
}

export default function ProductFormClient({ initialProduct, categories, sizeCharts = [], collections = [], stockStatuses = [] }: ProductFormClientProps) {
  const params = useParams();
  const locale = params.locale as string || "ua";
  const [type, setType] = useState<ProductType>(initialProduct?.type || "apparel");
 const [isLoading, setIsLoading] = useState(false);
 const [isDeleting, setIsDeleting] = useState(false);
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id || "");
  const selectedCategory = categories.find(c => c.id === categoryId);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDeletingImage, setIsDeletingImage] = useState<string | null>(null);
  const [isSettingPrimary, setIsSettingPrimary] = useState<string | null>(null);
  
  // Cropper state
  const [croppedFiles, setCroppedFiles] = useState<File[]>([]);
  const [fileToCrop, setFileToCrop] = useState<File | null>(null);
  const [pendingFilesToCrop, setPendingFilesToCrop] = useState<File[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      // Start cropping the first file, keep the rest in queue
      setFileToCrop(filesArray[0]);
      setPendingFilesToCrop(filesArray.slice(1));
    }
    // Clear the input so the same file can be selected again
    e.target.value = '';
  };

  const handleCropComplete = (croppedFile: File) => {
    const previewUrl = URL.createObjectURL(croppedFile);
    setImagePreviews(prev => [...prev, previewUrl]);
    setCroppedFiles(prev => [...prev, croppedFile]);

    // Process next file in queue if any
    if (pendingFilesToCrop.length > 0) {
      setFileToCrop(pendingFilesToCrop[0]);
      setPendingFilesToCrop(prev => prev.slice(1));
    } else {
      setFileToCrop(null);
    }
  };

  const handleCropCancel = () => {
    // Skip current, process next if any
    if (pendingFilesToCrop.length > 0) {
      setFileToCrop(pendingFilesToCrop[0]);
      setPendingFilesToCrop(prev => prev.slice(1));
    } else {
      setFileToCrop(null);
    }
  };

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    if (!initialProduct?.id || !confirm("Видалити це зображення?")) return;
    setIsDeletingImage(imageId);
    try {
      await deleteProductImage(imageId, imageUrl);
      toast.success("Зображення видалено");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeletingImage(null);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!initialProduct?.id) return;
    setIsSettingPrimary(imageId);
    try {
      await setPrimaryImage(initialProduct.id, imageId);
      toast.success("Головне зображення змінено");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSettingPrimary(null);
    }
  };

  // Property state
  const [properties, setProperties] = useState<Record<string, string[]>>(initialProduct?.properties || {});
  
  // Collections state
  const [selectedCollections, setSelectedCollections] = useState<string[]>(initialProduct?.properties?.collection_ids || []);

  const toggleCollectionId = (colId: string) => {
    setSelectedCollections(prev => 
      prev.includes(colId) ? prev.filter(c => c !== colId) : [...prev, colId]
    );
  };

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
      window.location.href = `/${locale}/admin/products`;
    } catch (error: any) {
      alert(`Помилка видалення: ${error?.message || "Можливо товар вже є у замовленнях. Ви можете змінити його статус на 'Немає в наявності'"}`);
      console.error(error);
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
  // Append cropped files to formData instead of the raw input files
  formData.delete("images"); // Remove raw files if any
  croppedFiles.forEach(file => {
    formData.append("images", file);
  });

  const newProductId = await saveProduct(formData, initialProduct?.id);
  if (!initialProduct) {
    window.location.href = `/${locale}/admin/products/${newProductId}/edit`;
  } else {
    window.location.reload();
  }
 } catch (error: any) {
  if (typeof error === 'object' && error !== null && 'digest' in error && typeof (error as any).digest === 'string' && (error as any).digest.startsWith('NEXT_REDIRECT')) {
    throw error;
  }
  alert(`Помилка збереження: ${error?.message || "Перевірте консоль"}`);
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Наявність *</label>
                <select 
                  name="stock_status" 
                  defaultValue={initialProduct?.stock_status || (stockStatuses.length > 0 ? stockStatuses[0].id : "in_stock")} 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-brand outline-none"
                >
                  {stockStatuses.map((status: any) => (
                    <option key={status.id} value={status.id}>{status.name_ua}</option>
                  ))}
                  {stockStatuses.length === 0 && (
                    <>
                      <option value="in_stock">В наявності</option>
                      <option value="out_of_stock">Немає в наявності</option>
                    </>
                  )}
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
  <div className="space-y-2">
  <label className="text-sm font-semibold text-foreground">Відображення фотографій</label>
  <select name="image_fit"defaultValue={initialProduct?.properties?.image_fit ||"cover"} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-brand outline-none">
  <option value="cover">Заповнювати (Обріже краї)</option>
  <option value="contain">Вміщувати (Без обрізання, можливі поля)</option>
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

        {/* Collections checkboxes */}
        {collections.length > 0 && (
          <div className="p-6 bg-gray-50 rounded-2xl space-y-4">
            <h3 className="font-semibold text-foreground">Колекції</h3>
            <p className="text-sm text-gray-500">Оберіть колекції, до яких належить цей товар</p>
            <div className="flex flex-wrap gap-2">
              {collections.map((col: any) => (
                <label 
                  key={col.id} 
                  className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 cursor-pointer hover:border-brand transition-colors"
                >
                  <input 
                    type="checkbox" 
                    name="collection_id"
                    value={col.id}
                    checked={selectedCollections.includes(col.id)}
                    onChange={() => toggleCollectionId(col.id)}
                    className="accent-brand"
                  />
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: col.color || '#888' }} />
                  <span className="font-medium text-sm">{col.name_ua}</span>
                </label>
              ))}
            </div>
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
    
    {initialProduct?.images && initialProduct.images.length > 0 && (
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-3">Збережені зображення:</p>
        <div className="flex flex-wrap gap-4">
          {initialProduct.images.map((img) => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden border border-gray-200">
              <img src={img.image_url} alt="Product" className="w-32 h-32 object-cover" />
              
              {/* Primary badge */}
              {img.is_primary && (
                <div className="absolute top-2 left-2 bg-brand text-white text-xs px-2 py-1 rounded-md font-bold flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-white" /> Головне
                </div>
              )}

              {/* Actions Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                {!img.is_primary && (
                  <button
                    type="button"
                    disabled={isSettingPrimary === img.id}
                    onClick={() => handleSetPrimary(img.id)}
                    className="bg-white text-gray-900 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    {isSettingPrimary === img.id ? "..." : "Зробити головним"}
                  </button>
                )}
                <button
                  type="button"
                  disabled={isDeletingImage === img.id}
                  onClick={() => handleDeleteImage(img.id, img.image_url)}
                  className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" /> {isDeletingImage === img.id ? "..." : "Видалити"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {imagePreviews.length > 0 && (
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-3">Нові зображення до завантаження (збережуться після натискання "Зберегти товар"):</p>
        <div className="flex flex-wrap gap-4">
          {imagePreviews.map((preview, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-brand/50">
              <img src={preview} alt={`Preview ${i}`} className="w-32 h-32 object-cover" />
            </div>
          ))}
        </div>
      </div>
    )}

    <div className="flex items-center justify-center w-full">
      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="w-10 h-10 mb-3 text-gray-400" />
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Натисніть для завантаження</span> або перетягніть
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, WEBP (Можна обирати кілька файлів)</p>
        </div>
        <input 
          id="dropzone-file" 
          type="file" 
          multiple
          className="hidden" 
          accept="image/png, image/jpeg, image/webp"
          onChange={handleImageChange}
        />
      </label>
    </div>
  </div>

  {fileToCrop && (
    <ImageCropper 
      imageFile={fileToCrop}
      onCropComplete={handleCropComplete}
      onCancel={handleCropCancel}
    />
  )}

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
