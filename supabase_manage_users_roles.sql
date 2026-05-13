-- ============================================================
-- HƯỚNG DẪN QUẢN LÝ USER & ROLE TRONG SUPABASE
-- Chạy từng phần riêng lẻ trong Supabase SQL Editor
-- ============================================================


-- ==============================================================
-- PHẦN 1: XEM THÔNG TIN HIỆN TẠI
-- ==============================================================

-- 1A. Xem tất cả Roles hiện có
SELECT * FROM public.roles ORDER BY role_code;

-- 1B. Xem tất cả Permissions hiện có
SELECT * FROM public.permissions ORDER BY module, action;

-- 1C. Xem phân quyền của từng Role
SELECT 
  r.name AS "Tên role",
  rp.role_code,
  rp.permission_code,
  p.module,
  p.action,
  p.description
FROM public.role_permissions rp
JOIN public.roles r ON r.role_code = rp.role_code
JOIN public.permissions p ON p.permission_code = rp.permission_code
ORDER BY rp.role_code, p.module;

-- 1D. Xem tất cả Users và Role của họ
SELECT 
  au.id,
  au.email,
  au.created_at,
  pr.role,
  r.name AS "Tên role"
FROM auth.users au
LEFT JOIN public.profiles pr ON pr.id = au.id
LEFT JOIN public.roles r ON r.role_code = pr.role
ORDER BY au.created_at;


-- ==============================================================
-- PHẦN 2: THÊM ROLE MỚI
-- ==============================================================

-- 2A. Thêm một role mới (ví dụ: "Kế toán")
INSERT INTO public.roles (role_code, name, description)
VALUES 
  ('accountant', 'Kế toán', 'Xem báo cáo tài chính và doanh thu');

-- 2B. Thêm quyền hạn cho role mới đó
-- (Xem danh sách permission_code ở phần 1B để biết có những quyền nào)
INSERT INTO public.role_permissions (role_code, permission_code) VALUES
  ('accountant', 'dashboard_read'),
  ('accountant', 'sale_read'),
  ('accountant', 'batch_read');


-- ==============================================================
-- PHẦN 3: THÊM USER MỚI
-- ==============================================================

-- 3A. Cách 1 (KHUYẾN NGHỊ): Tạo user qua Supabase Dashboard
--     Vào: Authentication → Users → "Invite user" hoặc "Add user"
--     Nhập email + password → Chọn "Auto Confirm" nếu muốn

-- 3B. Cách 2: Tạo user bằng SQL (dùng hàm admin của Supabase)
--     LƯU Ý: Cách này yêu cầu quyền service_role, chỉ dùng trong SQL Editor
SELECT supabase_admin.create_user(
  '{"email": "newuser@example.com", "password": "mat_khau_123", "email_confirm": true}'
);
-- (Nếu lệnh trên báo lỗi, hãy dùng Dashboard để tạo user)


-- ==============================================================
-- PHẦN 4: GÁN ROLE CHO USER (SAU KHI TẠO USER)
-- ==============================================================

-- 4A. Gán role cho user mới bằng EMAIL
--     Thay 'email-cua-ho@domain.com' và 'ten_role' phù hợp
INSERT INTO public.profiles (id, role)
SELECT id, 'admin'          -- Đổi 'admin' thành role muốn gán: 'hr_manager', 'staff', 'accountant',...
FROM auth.users
WHERE email = 'email-cua-ho@domain.com'   -- <-- Đổi email này
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- 4B. Gán role cho NHIỀU user cùng lúc
INSERT INTO public.profiles (id, role)
SELECT id, 
  CASE email
    WHEN 'admin@company.com'   THEN 'admin'
    WHEN 'manager@company.com' THEN 'hr_manager'
    WHEN 'staff1@company.com'  THEN 'staff'
    WHEN 'staff2@company.com'  THEN 'staff'
  END AS role
FROM auth.users
WHERE email IN (
  'admin@company.com',
  'manager@company.com',
  'staff1@company.com',
  'staff2@company.com'
)
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- 4C. Đổi role của user đang tồn tại
UPDATE public.profiles
SET role = 'hr_manager'   -- <-- Đổi role mới
WHERE id = (SELECT id FROM auth.users WHERE email = 'email-cua-ho@domain.com');


-- ==============================================================
-- PHẦN 5: CÁC THAO TÁC KHÁC
-- ==============================================================

-- 5A. Xóa một role (chỉ khi không còn user nào dùng role đó)
-- Xóa phân quyền trước
DELETE FROM public.role_permissions WHERE role_code = 'ten_role_can_xoa';
-- Rồi mới xóa role
DELETE FROM public.roles WHERE role_code = 'ten_role_can_xoa';

-- 5B. Thêm quyền mới vào một role đã có
INSERT INTO public.role_permissions (role_code, permission_code)
VALUES ('staff', 'ingredient_write');  -- Ví dụ: cấp thêm quyền sửa nguyên liệu cho staff

-- 5C. Thu hồi quyền khỏi một role
DELETE FROM public.role_permissions
WHERE role_code = 'staff' AND permission_code = 'ingredient_write';

-- 5D. Kiểm tra user cụ thể có quyền gì
SELECT 
  au.email,
  pr.role,
  rp.permission_code
FROM auth.users au
JOIN public.profiles pr ON pr.id = au.id
JOIN public.role_permissions rp ON rp.role_code = pr.role
WHERE au.email = 'email-cua-ho@domain.com'
ORDER BY rp.permission_code;
