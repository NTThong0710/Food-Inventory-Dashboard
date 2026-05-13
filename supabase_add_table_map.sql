-- ============================================================
-- MIGRATION: Thêm table_id vào bookings + permission table_read
-- Chạy file này trong Supabase SQL Editor
-- ============================================================

-- 1. Thêm cột table_id vào bảng bookings (nullable, 1-9)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS table_id integer CHECK (table_id BETWEEN 1 AND 9);

-- 2. Thêm permission mới cho sơ đồ bàn
INSERT INTO public.permissions (permission_code, module, action, description)
VALUES
  ('table_read', 'table', 'read', 'Xem sơ đồ bàn và trạng thái đặt bàn')
ON CONFLICT (permission_code) DO NOTHING;

-- 3. Gán permission table_read cho admin và hr_manager
INSERT INTO public.role_permissions (role_code, permission_code)
VALUES
  ('admin', 'table_read'),
  ('hr_manager', 'table_read')
ON CONFLICT (role_code, permission_code) DO NOTHING;

-- 4. (Tùy chọn) Cho phép staff xem sơ đồ bàn
-- INSERT INTO public.role_permissions (role_code, permission_code)
-- VALUES ('staff', 'table_read')
-- ON CONFLICT DO NOTHING;

-- ============================================================
-- Xác minh
-- ============================================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings' AND column_name = 'table_id';
