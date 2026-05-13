-- ============================================================
-- MIGRATION: Hợp nhất luồng Đặt Bàn và Menu
-- ============================================================

-- Thêm cột lưu trữ món ăn đã đặt trước vào bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS preordered_items jsonb DEFAULT '[]'::jsonb;
