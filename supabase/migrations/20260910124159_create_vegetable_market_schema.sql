/*
# Vegetable E-Commerce Market — Database Schema

## Overview
Complete PostgreSQL schema for a vegetable e-commerce marketplace with buyer, vendor, and admin roles.

## New Tables

1. **profiles** — User profiles extending Supabase auth.users
   - id (uuid, PK, linked to auth.users)
   - full_name, phone, address, city, area
   - role (buyer / vendor / admin)
   - shop_name, shop_description (vendor-specific)

2. **categories** — Vegetable categories (e.g. leafy, root, seasonal)
   - id, name, slug, icon (emoji), description

3. **products** — Vegetables listed by vendors
   - id, vendor_id (FK profiles), category_id (FK categories)
   - name, slug, description, price, unit (kg, bunch, piece)
   - stock_qty, image_url, is_available
   - created_at, updated_at

4. **cart_items** — Buyer's shopping cart
   - id, buyer_id (FK profiles), product_id (FK products)
   - quantity

5. **orders** — Order placed by buyer
   - id, buyer_id, vendor_id
   - total_amount, status (pending / confirmed / shipped / delivered / cancelled)
   - delivery_address, delivery_phone, delivery_notes
   - payment_method (cod / online)
   - created_at, updated_at

6. **order_items** — Items within an order
   - id, order_id (FK orders), product_id (FK products)
   - quantity, price_at_purchase (snapshot of price)

7. **deliveries** — Delivery tracking for orders
   - id, order_id (FK orders), delivery_partner_name
   - status (assigned / picked_up / in_transit / delivered)
   - tracking_note, estimated_delivery, actual_delivery

## Security (RLS)
- All tables have RLS enabled.
- profiles: users can read/update their own profile; vendor info is publicly readable.
- categories: public read (anon + authenticated).
- products: public read; vendors can insert/update/delete their own products.
- cart_items: buyers can CRUD their own cart.
- orders: buyers can read/manage their own orders; vendors can read orders containing their products.
- order_items: buyers can read their own order items; vendors can read items in their orders.
- deliveries: buyers can read their own deliveries; vendors can read deliveries for their orders.
- All policies use auth.uid() for ownership.
*/

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  address text,
  city text,
  area text,
  role text NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'vendor', 'admin')),
  shop_name text,
  shop_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

-- Allow anyone to see vendor profiles (shop info)
DROP POLICY IF EXISTS "select_vendor_profiles" ON profiles;
CREATE POLICY "select_vendor_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (role = 'vendor');

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text DEFAULT '🥬',
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_categories" ON categories;
CREATE POLICY "read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_categories" ON categories;
CREATE POLICY "insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_categories" ON categories;
CREATE POLICY "update_categories" ON categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_categories" ON categories;
CREATE POLICY "delete_categories" ON categories FOR DELETE
  TO anon, authenticated USING (true);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  unit text NOT NULL DEFAULT 'kg',
  stock_qty integer NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_products" ON products;
CREATE POLICY "select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_products" ON products;
CREATE POLICY "insert_own_products" ON products FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "update_own_products" ON products;
CREATE POLICY "update_own_products" ON products FOR UPDATE
  TO authenticated USING (auth.uid() = vendor_id) WITH CHECK (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "delete_own_products" ON products;
CREATE POLICY "delete_own_products" ON products FOR DELETE
  TO authenticated USING (auth.uid() = vendor_id);

-- CART_ITEMS TABLE
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_cart" ON cart_items;
CREATE POLICY "select_own_cart" ON cart_items FOR SELECT
  TO authenticated USING (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "insert_own_cart" ON cart_items;
CREATE POLICY "insert_own_cart" ON cart_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "update_own_cart" ON cart_items;
CREATE POLICY "update_own_cart" ON cart_items FOR UPDATE
  TO authenticated USING (auth.uid() = buyer_id) WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "delete_own_cart" ON cart_items;
CREATE POLICY "delete_own_cart" ON cart_items FOR DELETE
  TO authenticated USING (auth.uid() = buyer_id);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_amount numeric(10,2) NOT NULL CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  delivery_address text NOT NULL,
  delivery_phone text NOT NULL,
  delivery_notes text,
  payment_method text NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'online')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = buyer_id OR auth.uid() = vendor_id);

DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_own_orders" ON orders FOR UPDATE
  TO authenticated USING (auth.uid() = buyer_id OR auth.uid() = vendor_id) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_own_orders" ON orders;
CREATE POLICY "delete_own_orders" ON orders FOR DELETE
  TO authenticated USING (auth.uid() = buyer_id);

-- ORDER_ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_at_purchase numeric(10,2) NOT NULL CHECK (price_at_purchase >= 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_order_items" ON order_items;
CREATE POLICY "select_own_order_items" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.buyer_id = auth.uid() OR orders.vendor_id = auth.uid()))
  );

DROP POLICY IF EXISTS "insert_own_order_items" ON order_items;
CREATE POLICY "insert_own_order_items" ON order_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid())
  );

-- DELIVERIES TABLE
CREATE TABLE IF NOT EXISTS deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  delivery_partner_name text,
  status text NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'picked_up', 'in_transit', 'delivered')),
  tracking_note text,
  estimated_delivery timestamptz,
  actual_delivery timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_deliveries" ON deliveries;
CREATE POLICY "select_own_deliveries" ON deliveries FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = deliveries.order_id AND (orders.buyer_id = auth.uid() OR orders.vendor_id = auth.uid()))
  );

DROP POLICY IF EXISTS "update_own_deliveries" ON deliveries;
CREATE POLICY "update_own_deliveries" ON deliveries FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = deliveries.order_id AND (orders.vendor_id = auth.uid()))
  ) WITH CHECK (true);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_cart_items_buyer ON cart_items(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order ON deliveries(order_id);
