-- ============================================================
-- COMPLETE FIX: Run this in Supabase Dashboard → SQL Editor
-- This drops ALL existing policies first, then creates correct ones
-- ============================================================

-- =====================
-- STEP 1: USERS TABLE
-- =====================
-- Drop ALL existing policies on users table
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', pol.policyname);
    END LOOP;
END $$;

-- Disable and re-enable RLS to reset
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create fresh policies for users table
CREATE POLICY "allow_insert_own_profile" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "allow_select_own_profile" ON public.users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "allow_update_own_profile" ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =====================
-- STEP 2: CART TABLE
-- =====================
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'cart' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.cart', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.cart DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_insert_own_cart" ON public.cart
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "allow_select_own_cart" ON public.cart
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "allow_delete_own_cart" ON public.cart
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- =====================
-- STEP 3: ORDERS TABLE
-- =====================
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'orders' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.orders', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_insert_own_orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "allow_select_own_orders" ON public.orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- =====================
-- STEP 4: OUTFITS TABLE
-- =====================
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'outfits' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.outfits', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.outfits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_read_outfits" ON public.outfits
  FOR SELECT TO anon, authenticated
  USING (true);

-- =====================
-- VERIFICATION: Check all policies
-- =====================
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
