/*
# Add Admin RLS Policies

## Overview
Adds row-level security policies that allow users with role='admin' to read and manage all data across every table in the vegetable marketplace. Admins can see all users, products, orders, deliveries, and categories, and can update/delete any record.

## Changes
1. **profiles** — Admin can SELECT and UPDATE all profiles (e.g. change user roles).
2. **products** — Admin can UPDATE and DELETE any product (SELECT already public).
3. **orders** — Admin can SELECT and UPDATE all orders.
4. **order_items** — Admin can SELECT all order items.
5. **deliveries** — Admin can SELECT and UPDATE all deliveries.
6. **cart_items** — Admin can SELECT all cart items.

## Security
- Each admin policy uses `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')` to verify the requesting user is an admin.
- These are ADDITIVE policies — existing owner-scoped policies remain intact. A row is visible if EITHER the existing owner policy OR the new admin policy passes.
- No existing policies are dropped or modified.
*/