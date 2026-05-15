import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    type: "apparel",
    name_ua: "Футболка 'Бруталізм'",
    name_en: "T-Shirt 'Brutalism'",
    description_ua: "Мінімалістична футболка з преміальної бавовни. Ідеальна для міста.",
    description_en: "Minimalist t-shirt made of premium cotton. Perfect for the city.",
    price: 950,
    stock_status: "in_stock",
    is_on_demand: false,
    properties: { sizes: ["S", "M", "L", "XL"] },
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "2",
    type: "artifact",
    name_ua: "Ваза 'Архітектура'",
    name_en: "Vase 'Architecture'",
    description_ua: "3D-друкована ваза, натхненна бруталізмом Держпрому.",
    description_en: "3D printed vase inspired by brutalism of Derzhprom.",
    price: 1200,
    stock_status: "in_stock",
    is_on_demand: true,
    properties: { materials: ["Chrome", "Graphite", "Pearl"] },
    image_url: "https://images.unsplash.com/photo-1613139366601-523e1e695ca0?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "3",
    type: "souvenir",
    name_ua: "Брелок 'Дзеркальний струмінь'",
    name_en: "Keychain 'Mirror Stream'",
    description_ua: "Символ міста завжди з тобою. Нержавіюча сталь.",
    description_en: "The symbol of the city is always with you. Stainless steel.",
    price: 350,
    stock_status: "out_of_stock",
    is_on_demand: false,
    properties: {},
    image_url: "https://images.unsplash.com/photo-1620002093556-9e47262c5e53?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "4",
    type: "apparel",
    name_ua: "Худі 'Вулиці'",
    name_en: "Hoodie 'Streets'",
    description_ua: "Тепле худі оверсайз крою. 100% бавовна.",
    description_en: "Warm oversize hoodie. 100% cotton.",
    price: 2100,
    stock_status: "in_stock",
    is_on_demand: false,
    properties: { sizes: ["M", "L", "XL"] },
    image_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop"
  }
];
