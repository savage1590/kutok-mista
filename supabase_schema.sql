-- Включить расширение UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблица товаров (Products)
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('apparel', 'artifact', 'souvenir')),
    name_ua TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ua TEXT,
    description_en TEXT,
    price NUMERIC(10, 2) NOT NULL,
    sku TEXT,
    stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock')),
    is_on_demand BOOLEAN NOT NULL DEFAULT false,
    properties JSONB, -- Для хранения размеров (одежда) или материалов (артефакты)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица изображений товаров (Product Images)
CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Настройка безопасности на уровне строк (Row Level Security - RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Политика: Публичный доступ на чтение товаров
CREATE POLICY "Public read access for products" 
ON public.products FOR SELECT 
USING (true);

-- Политика: Публичный доступ на чтение изображений
CREATE POLICY "Public read access for product images" 
ON public.product_images FOR SELECT 
USING (true);

-- Политика: Запись только для авторизованных пользователей (Admin) для товаров
CREATE POLICY "Auth write access for products" 
ON public.products FOR ALL 
USING (auth.role() = 'authenticated');

-- Политика: Запись только для авторизованных пользователей (Admin) для изображений
CREATE POLICY "Auth write access for product images" 
ON public.product_images FOR ALL 
USING (auth.role() = 'authenticated');

-- Тестовые данные (Placeholder Products)
INSERT INTO public.products (type, name_ua, name_en, description_ua, description_en, price, is_on_demand, properties)
VALUES 
(
    'apparel', 
    'Мінімалістична Футболка', 
    'Minimalist T-Shirt', 
    'Базова футболка з преміальної бавовни. Ідеальна для міста.', 
    'Basic t-shirt made of premium cotton. Perfect for the city.', 
    950.00, 
    false, 
    '{"sizes": ["S", "M", "L", "XL"]}'::jsonb
),
(
    'artifact', 
    'Ваза "Архітектура"', 
    'Vase "Architecture"', 
    '3D-друкована ваза, натхненна бруталізмом.', 
    '3D printed vase inspired by brutalism.', 
    1200.00, 
    true, 
    '{"materials": ["Chrome", "Graphite", "Pearl"]}'::jsonb
);
