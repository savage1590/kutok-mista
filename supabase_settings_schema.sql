-- Таблица для хранения глобальных настроек сайта
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включаем RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Политика: Публичный доступ на чтение
CREATE POLICY "Public read access for settings" 
ON public.settings FOR SELECT 
USING (true);

-- Политика: Запись только для авторизованных
CREATE POLICY "Auth write access for settings" 
ON public.settings FOR ALL 
USING (auth.role() = 'authenticated');

-- Вставляем дефолтные значения (если их нет)
INSERT INTO public.settings (key, value)
VALUES 
(
    'home_banners',
    '[
        {
            "id": "1",
            "image": "/hero-bg.png",
            "title_ua": "Урбаністична естетика в кожній деталі",
            "title_en": "Urban Aesthetics in Every Detail",
            "subtitle_ua": "Мінімалістичний одяг та 3D-друковані артефакти.",
            "subtitle_en": "Minimalist apparel and 3D-printed artifacts.",
            "btn_ua": "В каталог",
            "btn_en": "Shop Now",
            "link": "/products"
        },
        {
            "id": "2",
            "image": "/images/about_hero.png",
            "title_ua": "Нова літня колекція",
            "title_en": "New Summer Collection",
            "subtitle_ua": "Легкість та стиль для теплих днів у місті.",
            "subtitle_en": "Lightness and style for warm city days.",
            "btn_ua": "Дивитись колекцію",
            "btn_en": "View Collection",
            "link": "/products?category=apparel"
        },
        {
            "id": "3",
            "image": "/images/hero_3.jpg",
            "title_ua": "Спеціальна пропозиція",
            "title_en": "Special Offer",
            "subtitle_ua": "Знижки на найпопулярніші артефакти до кінця місяця.",
            "subtitle_en": "Discounts on most popular artifacts until the end of the month.",
            "btn_ua": "Всі акції",
            "btn_en": "All Promos",
            "link": "/products?category=decor"
        }
    ]'::jsonb
) ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings (key, value)
VALUES 
(
    'home_featured',
    '[]'::jsonb -- Изначально пустой массив, мы выберем товары через админку
) ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings (key, value)
VALUES 
(
    'contacts',
    '{
        "phone1": "+38 (000) 000-00-00",
        "phone2": "",
        "email": "info@kutokmista.com",
        "telegram": "https://t.me/kutokmista",
        "viber": "viber://chat?number=%2B380000000000",
        "instagram": "https://instagram.com/kutokmista",
        "hours_ua": "з 9:00 до 22:00, без вихідних",
        "hours_en": "9:00 to 22:00, no weekends"
    }'::jsonb
) ON CONFLICT (key) DO NOTHING;
