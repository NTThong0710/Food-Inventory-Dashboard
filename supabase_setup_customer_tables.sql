-- ==========================================
-- 1. BOOKINGS (Đặt bàn)
-- ==========================================
CREATE TABLE public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    num_guests INTEGER NOT NULL DEFAULT 1,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    special_requests TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bật Row Level Security cho Bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Chính sách: Ai cũng có quyền TẠO (Insert) đặt bàn (Public)
CREATE POLICY "Allow public insert to bookings"
ON public.bookings
FOR INSERT
TO public
WITH CHECK (true);

-- Chính sách: Chỉ có người đăng nhập mới được XEM, SỬA, XÓA (Admin, Staff)
CREATE POLICY "Allow authenticated read bookings"
ON public.bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update bookings"
ON public.bookings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete bookings"
ON public.bookings FOR DELETE TO authenticated USING (true);


-- ==========================================
-- 2. CUSTOMER ORDERS (Đơn đặt món)
-- ==========================================
CREATE TABLE public.customer_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    table_number TEXT,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, preparing, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to customer_orders"
ON public.customer_orders
FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to customer_orders"
ON public.customer_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ==========================================
-- 3. CUSTOMER ORDER ITEMS (Chi tiết đơn)
-- ==========================================
CREATE TABLE public.customer_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.customer_orders(id) ON DELETE CASCADE,
    dish_code character varying NOT NULL REFERENCES public.dishes(dish_code) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_time NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.customer_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to customer_order_items"
ON public.customer_order_items
FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to customer_order_items"
ON public.customer_order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
