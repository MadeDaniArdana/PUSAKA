-- ═══════════════════════════════════════════════════
-- PUSAKA Migration: Profiles + Notifications
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- 1. User Profiles (for verification system)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'warga',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users insert own profile" ON public.profiles;
CREATE POLICY "Allow users insert own profile" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin update any profile" ON public.profiles;
CREATE POLICY "Allow admin update any profile" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin delete any profile" ON public.profiles;
CREATE POLICY "Allow admin delete any profile" ON public.profiles FOR DELETE USING (true);

-- 2. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT false,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users read own notifications" ON public.notifications;
CREATE POLICY "Allow users read own notifications" ON public.notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert notifications" ON public.notifications;
CREATE POLICY "Allow authenticated insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users update own notifications" ON public.notifications;
CREATE POLICY "Allow users update own notifications" ON public.notifications FOR UPDATE USING (true) WITH CHECK (true);

-- 3. Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 4. Insert admin profile (so admin can receive notifications)
-- Replace the UUID below with your admin user's ID from auth.users
-- You can find it in Supabase Dashboard > Authentication > Users
-- INSERT INTO public.profiles (id, full_name, email, role, is_verified) VALUES
-- ('<admin-user-uuid>', 'Admin PUSAKA', 'madedani31@gmail.com', 'admin', true);
