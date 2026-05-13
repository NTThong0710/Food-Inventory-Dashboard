-- 1. Thêm các quyền hạn mới cho tính năng Phục Vụ (POS / Order)
INSERT INTO public.permissions (permission_code, module, action, description) VALUES
('pos_read', 'pos', 'read', 'Truy cập màn hình phục vụ và xem đơn hàng'),
('pos_write', 'pos', 'write', 'Thêm món, cập nhật bill và thanh toán')
ON CONFLICT (permission_code) DO NOTHING;

-- 2. Phân quyền cho ADMIN
INSERT INTO public.role_permissions (role_code, permission_code) VALUES 
('admin', 'pos_read'),
('admin', 'pos_write')
ON CONFLICT DO NOTHING;

-- 3. Phân quyền cho NHÂN VIÊN (staff)
INSERT INTO public.role_permissions (role_code, permission_code) VALUES 
('staff', 'pos_read'),
('staff', 'pos_write')
ON CONFLICT DO NOTHING;

-- 4. Bổ sung trạng thái cho đơn hàng nếu cần thiết (Status của customer_orders thường là pending, completed, cancelled)
-- Hiện tại bảng customer_orders đã có status, nhưng để phục vụ, chúng ta có thể sử dụng các trạng thái: pending (Chờ món), serving (Đang phục vụ), completed (Đã thanh toán)
