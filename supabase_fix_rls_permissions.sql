-- ============================================================
-- CHẨN ĐOÁN & FIX: Nav links không hiện do permissions rỗng
-- Chạy từng bước trong Supabase SQL Editor
-- ============================================================


-- =============================================
-- BƯỚC 1: CHẨN ĐOÁN - Kiểm tra vấn đề
-- =============================================

-- 1A. Xem tất cả users và role của họ
SELECT 
  au.email,
  au.id,
  pr.role AS "role trong profiles"
FROM auth.users au
LEFT JOIN public.profiles pr ON pr.id = au.id
ORDER BY au.email;
-- Nếu cột "role trong profiles" = NULL => user chưa có profile => cần INSERT
-- Nếu role = 'user' => không khớp với role_code nào => cần đổi thành 'staff', 'hr_manager', hoặc 'admin'

-- 1B. Xem RLS policies trên bảng role_permissions
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'role_permissions';
-- Nếu kết quả rỗng hoặc không có policy SELECT => đây là nguyên nhân!

-- 1C. Xem RLS policies trên bảng profiles  
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';

-- 1D. Kiểm tra RLS có bật không
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'role_permissions', 'roles', 'permissions')
  AND schemaname = 'public';
-- rowsecurity = true => RLS đang bật, cần có policy mới đọc được


-- =============================================
-- BƯỚC 2: FIX RLS POLICIES
-- =============================================

-- 2A. Cho phép user đã đăng nhập đọc bảng role_permissions
--     (Thông tin này không nhạy cảm, ai cũng cần đọc để biết mình có quyền gì)
DROP POLICY IF EXISTS "Allow authenticated users to read role_permissions" ON public.role_permissions;
CREATE POLICY "Allow authenticated users to read role_permissions"
  ON public.role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- 2B. Cho phép user đã đăng nhập đọc bảng roles
DROP POLICY IF EXISTS "Allow authenticated users to read roles" ON public.roles;
CREATE POLICY "Allow authenticated users to read roles"
  ON public.roles
  FOR SELECT
  TO authenticated
  USING (true);

-- 2C. Cho phép user đã đăng nhập đọc bảng permissions
DROP POLICY IF EXISTS "Allow authenticated users to read permissions" ON public.permissions;
CREATE POLICY "Allow authenticated users to read permissions"
  ON public.permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- 2D. Cho phép user đọc profile của CHÍNH HỌ
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 2E. Cho phép admin đọc TẤT CẢ profiles
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
CREATE POLICY "Admin can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2F. Cho phép admin cập nhật profiles (để assign role)
DROP POLICY IF EXISTS "Admin can update profiles" ON public.profiles;
CREATE POLICY "Admin can update profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- =============================================
-- BƯỚC 3: FIX PROFILES - Thêm/sửa role cho user
-- =============================================

-- 3A. Thêm profile với đúng role cho TẤT CẢ user chưa có profile
--     Mặc định gán role = 'staff'
INSERT INTO public.profiles (id, role)
SELECT id, 'staff'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 3B. Kiểm tra xem có user nào đang có role không hợp lệ không
SELECT 
  au.email, 
  pr.role AS "role hiện tại",
  CASE 
    WHEN r.role_code IS NULL THEN '⚠️ ROLE KHÔNG HỢP LỆ - Cần sửa!'
    ELSE '✅ OK'
  END AS "trạng thái"
FROM public.profiles pr
JOIN auth.users au ON au.id = pr.id
LEFT JOIN public.roles r ON r.role_code = pr.role;

-- 3C. Fix các user có role không hợp lệ → đổi về 'staff'
UPDATE public.profiles
SET role = 'staff'
WHERE role NOT IN (SELECT role_code FROM public.roles);

-- 3D. GÁN ROLE CỤ THỂ - Sửa email bên dưới cho đúng
--     Ví dụ: gán admin cho email của bạn
INSERT INTO public.profiles (id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'thongnguyen07102004@gmail.com'   -- ← ĐỔI EMAIL NÀY
ON CONFLICT (id) DO UPDATE SET role = 'admin';

--     Ví dụ: gán hr_manager
-- INSERT INTO public.profiles (id, role)
-- SELECT id, 'hr_manager'
-- FROM auth.users
-- WHERE email = 'manager@example.com'           -- ← ĐỔI EMAIL NÀY
-- ON CONFLICT (id) DO UPDATE SET role = 'hr_manager';


-- =============================================
-- BƯỚC 4: XÁC NHẬN SAU KHI FIX
-- =============================================

-- Kiểm tra lại toàn bộ: users, roles, permissions
SELECT 
  au.email,
  pr.role,
  r.name AS "tên role",
  COUNT(rp.permission_code) AS "số quyền có"
FROM auth.users au
JOIN public.profiles pr ON pr.id = au.id
JOIN public.roles r ON r.role_code = pr.role
LEFT JOIN public.role_permissions rp ON rp.role_code = pr.role
GROUP BY au.email, pr.role, r.name
ORDER BY au.email;
-- Nếu "số quyền có" = 0 => bảng role_permissions chưa có data => chạy lại supabase_seed_rbac.sql
