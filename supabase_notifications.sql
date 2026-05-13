-- ============================================================
-- MIGRATION: Hệ thống Thông báo Khách Hàng (Customer Notifications)
-- ============================================================

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Setup RLS (Row Level Security)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. Policies for Notifications
-- Admin (staff/admin) can insert notifications
CREATE POLICY "Enable insert for staff on notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Customers can view their own notifications
CREATE POLICY "Enable read for account owners on notifications" ON public.notifications
  FOR SELECT USING (
    auth.uid() = customer_id
  );

-- Customers can update (mark as read) their own notifications
CREATE POLICY "Enable update for account owners on notifications" ON public.notifications
  FOR UPDATE USING (
    auth.uid() = customer_id
  );
