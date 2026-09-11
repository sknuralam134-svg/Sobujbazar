/*
# Add INSERT policy for deliveries table

## Issue
The deliveries table was missing an INSERT policy. Buyers need to create a delivery record when placing an order.

## Changes
- Added "insert_own_deliveries" INSERT policy on deliveries table
- Allows authenticated users to insert delivery records for orders where they are the buyer
*/

DROP POLICY IF EXISTS "insert_own_deliveries" ON deliveries;
CREATE POLICY "insert_own_deliveries" ON deliveries FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = deliveries.order_id AND orders.buyer_id = auth.uid())
  );
