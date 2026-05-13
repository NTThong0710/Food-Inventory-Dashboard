-- ========================================================
-- NÂNG CẤP HỆ THỐNG TÀI KHOẢN KHÁCH HÀNG (CUSTOMER ACCOUNTS)
-- ========================================================

-- 1. Thêm Role "customer" vào hệ thống
INSERT INTO public.roles (role_code, name, description) 
VALUES ('customer', 'Khách hàng', 'Khách hàng đặt món trên Website') 
ON CONFLICT (role_code) DO NOTHING;

-- 2. Cập nhật Ràng buộc Check của trường "role" trên bảng profiles
-- (Để bảng profiles cho phép chứa role 'customer')
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role::text = ANY (ARRAY['admin'::text, 'hr_manager'::text, 'staff'::text, 'customer'::text]));

-- 3. Cho phép người dùng vừa tạo tải khoản tự chèn Profile của mình (Khách hàng đăng ký)
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
CREATE POLICY "Enable insert for authenticated users only" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Bổ sung liên kết Người Dùng vào Đặt bàn và Đơn hàng
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.customer_orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 5. Cập nhật Policy để Khách hàng chỉ xem được Đơn và Đặt bàn của mình, còn Admin thấy hết
-- (Xóa Policy cũ nếu có để tránh xung đột)
DROP POLICY IF EXISTS "Allow authenticated read bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings or admin all" 
ON public.bookings FOR SELECT TO authenticated 
USING (
  customer_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff', 'hr_manager'))
);

DROP POLICY IF EXISTS "Allow authenticated full access to customer_orders" ON public.customer_orders;
CREATE POLICY "Users can view own orders or admin all" 
ON public.customer_orders FOR SELECT TO authenticated 
USING (
  customer_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff', 'hr_manager'))
);

-- Khôi phục quyền Insert, Update, Delete nếu bị drop bởi statement All trên kia
CREATE POLICY "Users can insert customer_orders" ON public.customer_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can update customer_orders" ON public.customer_orders FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff', 'hr_manager')));
CREATE POLICY "Admin can delete customer_orders" ON public.customer_orders FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff', 'hr_manager')));

-- Cho order items
DROP POLICY IF EXISTS "Allow authenticated full access to customer_order_items" ON public.customer_order_items;
CREATE POLICY "Users can see own order items" 
ON public.customer_order_items FOR SELECT TO authenticated 
USING (
  order_id IN (SELECT id FROM public.customer_orders WHERE customer_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff', 'hr_manager'))
);
CREATE POLICY "Users can insert customer_order_items" ON public.customer_order_items FOR INSERT TO authenticated WITH CHECK (true);

