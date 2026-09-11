/*
# Move admin authorization check out of the public API

## Overview
Moves the admin role-checking function into a private database schema. This keeps it available to row-level security policies while preventing direct calls through the public Data API.

## Security
- Create private schema for internal authorization helpers.
- Recreate `is_admin()` inside the private schema with SECURITY DEFINER and a fixed search path.
- Grant execution only to authenticated requests so RLS policies can call it.
- Repoint all admin policies to the private helper.
- Remove the old public helper and its public API exposure.
*/

CREATE SCHEMA IF NOT EXISTS private;

DROP FUNCTION IF EXISTS private.is_admin();
CREATE OR REPLACE FUNCTION private.is_admin()
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

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

DROP POLICY IF EXISTS "admin_select_profiles" ON profiles;
CREATE POLICY "admin_select_profiles" ON profiles FOR SELECT
  TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "admin_update_profiles" ON profiles;
CREATE POLICY "admin_update_profiles" ON profiles FOR UPDATE
  TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "admin_select_orders" ON orders;
CREATE POLICY "admin_select_orders" ON orders FOR SELECT
  TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE
  TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "admin_select_order_items" ON order_items;
CREATE POLICY "admin_select_order_items" ON order_items FOR SELECT
  TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "admin_select_deliveries" ON deliveries;
CREATE POLICY "admin_select_deliveries" ON deliveries FOR SELECT
  TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "admin_update_deliveries" ON deliveries;
CREATE POLICY "admin_update_deliveries" ON deliveries FOR UPDATE
  TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "admin_select_cart_items" ON cart_items;
CREATE POLICY "admin_select_cart_items" ON cart_items FOR SELECT
  TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING (private.is_admin());

DROP FUNCTION IF EXISTS public.is_admin();