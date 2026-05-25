export type ProductType = 'apparel' | 'artifact' | 'souvenir';

export interface PropertyOption {
  name: string;
  label_ua: string;
  label_en: string;
  options: string[];
}

export interface Category {
  id: string;
  slug: string;
  name_ua: string;
  name_en: string;
  created_at: string;
  properties_schema?: PropertyOption[];
}

export interface Product {
  id: string;
  type: ProductType;
  category_id?: string;
  categories?: Category;
  name_ua: string;
  name_en: string;
  description_ua: string;
  description_en: string;
  price: number;
  stock_status: 'in_stock' | 'out_of_stock';
  is_on_demand: boolean;
  properties: Record<string, any>; // sizes, materials, etc.
  image_url?: string;
  images?: { id: string; image_url: string; is_primary: boolean }[];
}
