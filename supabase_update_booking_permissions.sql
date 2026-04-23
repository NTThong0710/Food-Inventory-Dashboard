-- 1. Thêm các quyền hạn mới cho Đặt bàn và Báo giá
INSERT INTO public.permissions (permission_code, module, action, description) VALUES
('booking_read', 'booking', 'read', 'Xem danh sách khách hàng đặt bàn'),
('booking_write', 'booking', 'write', 'Xác nhận, hủy hoặc cập nhật thông tin đặt bàn')
ON CONFLICT (permission_code) DO NOTHING;

-- 2. Phân quyền cho ADMIN
INSERT INTO public.role_permissions (role_code, permission_code) VALUES 
('admin', 'booking_read'),
('admin', 'booking_write')
ON CONFLICT DO NOTHING;

-- 3. Phân quyền cho QUẢN LÝ (hr_manager) - chỉ được xem
INSERT INTO public.role_permissions (role_code, permission_code) VALUES 
('hr_manager', 'booking_read')
ON CONFLICT DO NOTHING;

-- 4. Bổ sung cột status cho bảng bookings nếu chưa có
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
