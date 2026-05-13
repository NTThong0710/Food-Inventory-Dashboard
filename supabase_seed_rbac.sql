-- 1. Xóa dữ liệu cũ (nếu có rác) để tránh lỗi duplicate
-- Lưu ý: Lệnh xóa này chỉ chạy thành công nếu chưa có foreign key nào khóa chặt các role này.
DELETE FROM public.role_permissions;
DELETE FROM public.permissions;
DELETE FROM public.roles;

-- 2. Thêm các vai trò (Roles)
INSERT INTO public.roles (role_code, name, description) VALUES 
('admin', 'Quản trị viên', 'Người điều hành hệ thống với toàn quyền thao tác.'),
('hr_manager', 'Quản lý', 'Quản lý nhà hàng, xem báo cáo, doanh thu và danh sách.'),
('staff', 'Nhân viên', 'Nhân viên bán hàng, phục vụ tại quầy.');

-- 3. Thêm các quyền hạn (Permissions)
-- Tuân theo schema: permission_code, module, action, description
INSERT INTO public.permissions (permission_code, module, action, description) VALUES
-- Dashboard
('dashboard_read', 'dashboard', 'read', 'Xem trang Dashboard và biểu đồ thống kê'),

-- Dishes (Món ăn)
('dish_read', 'dish', 'read', 'Xem danh sách các món ăn có trong thực đơn'),
('dish_write', 'dish', 'write', 'Thêm mới, cập nhật, xóa các món ăn'),

-- Ingredients (Nguyên liệu)
('ingredient_read', 'ingredient', 'read', 'Xem danh sách nguyên liệu trong kho'),
('ingredient_write', 'ingredient', 'write', 'Thêm mới, cập nhật, xóa nguyên liệu'),

-- Sales (Bán hàng)
('sale_read', 'sale', 'read', 'Xem lịch sử danh sách giao dịch bán hàng'),
('sale_write', 'sale', 'write', 'Quyền thực hiện hành động bán, chế biến món ăn'),

-- Batches (Kho / Nhập hàng)
('batch_read', 'batch', 'read', 'Xem danh sách các lô hàng đã nhập vào kho'),
('batch_write', 'batch', 'write', 'Nhập kho, sửa, xóa thông tin lô hàng'),

-- Suppliers (Nhà cung cấp)
('supplier_read', 'supplier', 'read', 'Xem danh sách các nhà cung cấp'),
('supplier_write', 'supplier', 'write', 'Thêm, Sửa, Xóa thông tin nhà cung cấp');

-- 4. Phân Quyền cho từng Role (Gắn Permission cho Role)
-- 4.1. ADMIN: Cho toàn quyền
INSERT INTO public.role_permissions (role_code, permission_code)
SELECT 'admin', permission_code FROM public.permissions;

-- 4.2. HR_MANAGER / QUẢN LÝ: Chỉ có quyền xem (Read-Only) tất cả dữ liệu để báo cáo, không có quyền sửa đổi.
INSERT INTO public.role_permissions (role_code, permission_code) VALUES 
('hr_manager', 'dashboard_read'),
('hr_manager', 'dish_read'),
('hr_manager', 'ingredient_read'),
('hr_manager', 'sale_read'),
('hr_manager', 'batch_read'),
('hr_manager', 'supplier_read');

-- 4.3. STAFF / NHÂN VIÊN: Chỉ xem được Món ăn, Nguyên liệu, Danh sách Bán Hàng -- VÀ có quyền thực hiện việc Bán Hàng (sale_write)
INSERT INTO public.role_permissions (role_code, permission_code) VALUES 
('staff', 'dish_read'),
('staff', 'ingredient_read'),
('staff', 'sale_read'),
('staff', 'sale_write');

-- 5. Cập nhật Role cho người dùng (CHỈ ĐỂ THAM KHẢO)
-- Bảng public.profiles không lưu email, email được lưu ở bảng auth.users của Supabase.
-- Dưới đây là câu lệnh để gán quyền (ví dụ: 'admin') thông qua email đăng nhập:
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'email-cua-ban@domain.com');
