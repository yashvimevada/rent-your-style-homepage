-- ============================================================
-- UPGRADE SQL: Run this in Supabase Dashboard → SQL Editor
-- Creates bookings table & updates policies for full-stack upgrade
-- ============================================================

-- =====================
-- STEP 1: Add 'available' column to outfits if missing
-- =====================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'outfits' AND column_name = 'available'
    ) THEN
        ALTER TABLE public.outfits ADD COLUMN available BOOLEAN DEFAULT true;
    END IF;
END $$;

-- =====================
-- STEP 2: Create BOOKINGS table
-- =====================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    outfit_id UUID NOT NULL REFERENCES public.outfits(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    duration INTEGER NOT NULL DEFAULT 3,
    total_price NUMERIC NOT NULL,
    deposit NUMERIC NOT NULL DEFAULT 0,
    delivery_date DATE,
    return_date DATE,
    delivery_address TEXT,
    city TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'returned', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- STEP 3: RLS Policies for BOOKINGS
-- =====================
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "allow_select_own_bookings" ON public.bookings
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Users can insert their own bookings
CREATE POLICY "allow_insert_own_bookings" ON public.bookings
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can update their own bookings (for cancellation)
CREATE POLICY "allow_update_own_bookings" ON public.bookings
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- =====================
-- STEP 4: Admin policies for outfits (insert/update/delete)
-- =====================
-- Allow authenticated users to insert outfits (admin will be checked client-side)
CREATE POLICY "allow_insert_outfits" ON public.outfits
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update outfits
CREATE POLICY "allow_update_outfits" ON public.outfits
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to delete outfits
CREATE POLICY "allow_delete_outfits" ON public.outfits
    FOR DELETE TO authenticated
    USING (true);

-- =====================
-- STEP 5: Admin policies for bookings (view all + update status)
-- =====================
-- For admin to view ALL bookings, we add a separate broad SELECT policy
-- This works because RLS is OR-based: if ANY policy matches, access is granted
CREATE POLICY "allow_admin_select_all_bookings" ON public.bookings
    FOR SELECT TO authenticated
    USING (true);

-- Allow admin to update any booking status
CREATE POLICY "allow_admin_update_bookings" ON public.bookings
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================
-- VERIFICATION
-- =====================
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('bookings', 'outfits', 'cart', 'orders', 'users')
ORDER BY tablename, cmd;
