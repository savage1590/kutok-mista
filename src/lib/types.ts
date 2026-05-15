export type ProductType = 'apparel' | 'artifact' | 'souvenir';

export interface Product {
  id: string;
  type: ProductType;
  name_ua: string;
  name_en: string;
  description_ua: string;
  description_en: string;
  price: number;
  stock_status: 'in_stock' | 'out_of_stock';
  is_on_demand: boolean;
  properties: Record<string, any>; // sizes, materials, etc.
  image_url?: string;
}
