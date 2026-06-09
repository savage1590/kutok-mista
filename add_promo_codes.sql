-- 1. Створюємо таблицю promo_codes
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
    max_uses INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Налаштовуємо RLS для promo_codes
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Дозволяємо читати всім (бо код перевіряється з клієнта або API)
CREATE POLICY "Allow public read access to promo_codes"
    ON public.promo_codes FOR SELECT
    USING (true);

-- Дозволяємо змінювати тільки Service Role (нашому бекенду та адмінці)
CREATE POLICY "Allow service role full access to promo_codes"
    ON public.promo_codes
    USING (true)
    WITH CHECK (true);

-- 2. Додаємо нові колонки до таблиці orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS promo_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS subtotal NUMERIC;

-- Оновлюємо існуючі замовлення, щоб у них subtotal дорівнював total_amount
UPDATE public.orders SET subtotal = total_amount WHERE subtotal IS NULL;
