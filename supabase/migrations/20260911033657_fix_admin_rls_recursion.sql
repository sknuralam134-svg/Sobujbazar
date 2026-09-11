/*
# Fix Admin RLS Recursion

## Problem
Admin RLS policies on `profiles` query the `profiles` table itself to verify
the requesting user is an admin. Since RLS applies to that inner query too,
it causes infinite recursion — "Database error querying schema".

## Fix
1. Create a SECURITY DEFINER function `is_admin()` that checks if the
   current user has role='admin'. SECURITY DEFINER runs with the function
   owner's privileges, bypassing RLS on profiles — no recursion.
2. Replace ALL admin policies that used the inline subquery with calls to `is_admin()`.

## Tables affected
profiles, products, orders, order_items, deliveries, cart_items, categories
*/

-- Create the helper function
DROP FUNCTION IF EXISTS public.is_admin();
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Grant execute to authenticated
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- profiles: admin SELECT
DROP POLICY IF EXISTS "admin_select_profiles" ON profiles;
CREATE POLICY "admin_select_profiles" ON profiles FOR SELECT
  TO authenticated USING (public.is_admin());

-- profiles: admin UPDATE
DROP POLICY IF EXISTS "admin_update_profiles" ON profiles;
CREATE POLICY "admin_update_profiles" ON profiles FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- products: admin UPDATE
DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- products: admin DELETE
DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (public.is_admin());

-- orders: admin SELECT
DROP POLICY IF EXISTS "admin_select_orders" ON orders;
CREATE POLICY "admin_select_orders" ON orders FOR SELECT
  TO authenticated USING (public.is_admin());

-- orders: admin UPDATE
DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- order_items: admin SELECT
DROP POLICY IF EXISTS "admin_select_order_items" ON order_items;
CREATE POLICY "admin_select_order_items" ON order_items FOR SELECT
  TO authenticated USING (public.is_admin());

-- deliveries: admin SELECT
DROP POLICY IF EXISTS "admin_select_deliveries" ON deliveries;
CREATE POLICY "admin_select_deliveries" ON deliveries FOR SELECT
  TO authenticated USING (public.is_admin());

-- deliveries: admin UPDATE
DROP POLICY IF EXISTS "admin_update_deliveries" ON deliveries;
CREATE POLICY "admin_update_deliveries" ON deliveries FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- cart_items: admin SELECT
DROP POLICY IF EXISTS "admin_select_cart_items" ON cart_items;
CREATE POLICY "admin_select_cart_items" ON cart_items FOR SELECT
  TO authenticated USING (public.is_admin());

-- categories: admin INSERT
DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

-- categories: admin UPDATE
DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- categories: admin DELETE
DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING (public.is_admin());