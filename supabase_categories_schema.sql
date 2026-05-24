-- 1. Створення таблиці categories
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    name_ua TEXT NOT NULL,
    name_en TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Налаштування RLS (безпеки) для categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for categories" 
ON public.categories FOR SELECT 
USING (true);

CREATE POLICY "Auth write access for categories" 
ON public.categories FOR ALL 
USING (auth.role() = 'authenticated');

-- 3. Додавання базових категорій
INSERT INTO public.categories (slug, name_ua, name_en) VALUES
('apparel', 'Одяг', 'Apparel'),
('keychains', 'Брелоки', 'Keychains'),
('stickers', 'Стікери', 'Stickers'),
('figurines', 'Статуетки', 'Figurines'),
('decor', 'Декор', 'Decor'),
('accessories', 'Аксесуари', 'Accessories');

-- 4. Оновлення таблиці products
-- Додаємо колонку category_id, яка може бути порожньою (NULL) для старих товарів
ALTER TABLE public.products ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- 5. Автоматичне зв'язування існуючих товарів (опціонально, намагаємось прив'язати за полем type)
UPDATE public.products 
SET category_id = (SELECT id FROM public.categories WHERE slug = 'apparel' LIMIT 1)
WHERE type = 'apparel';

UPDATE public.products 
SET category_id = (SELECT id FROM public.categories WHERE slug = 'decor' LIMIT 1)
WHERE type = 'artifact';
