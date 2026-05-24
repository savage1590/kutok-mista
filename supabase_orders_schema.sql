-- Таблица заказов
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'paid', 'processing', 'shipped', 'completed', 'cancelled')),
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('monopay', 'liqpay', 'cash')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица товаров в заказе
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_time NUMERIC(10, 2) NOT NULL,
    selected_size TEXT,
    selected_material TEXT
);

-- RLS (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Клиенты могут создавать заказы анонимно
CREATE POLICY "Anyone can create orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can create order_items" 
ON public.order_items FOR INSERT 
WITH CHECK (true);

-- Только админы могут читать/обновлять заказы
CREATE POLICY "Auth access for orders" 
ON public.orders FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Auth update for orders" 
ON public.orders FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Auth access for order_items" 
ON public.order_items FOR SELECT 
USING (auth.role() = 'authenticated');
