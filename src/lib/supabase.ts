import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export type Profile = {
  id: string
  full_name: string
  phone: string | null
  address: string | null
  city: string | null
  area: string | null
  role: 'buyer' | 'vendor' | 'admin'
  shop_name: string | null
  shop_description: string | null
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
  icon: string
  description: string | null
}

export type Product = {
  id: string
  vendor_id: string
  category_id: string | null
  name: string
  slug: string
  description: string | null
  price: number
  unit: string
  stock_qty: number
  image_url: string | null
  is_available: boolean
  created_at: string
  updated_at: string
  category?: Category
  vendor?: Pick<Profile, 'id' | 'full_name' | 'shop_name'>
}

export type CartItem = {
  id: string
  buyer_id: string
  product_id: string
  quantity: number
  created_at: string
  product?: Product
}

export type Order = {
  id: string
  buyer_id: string
  vendor_id: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  delivery_address: string
  delivery_phone: string
  delivery_notes: string | null
  payment_method: 'cod' | 'online'
  created_at: string
  updated_at: string
  vendor?: Pick<Profile, 'id' | 'full_name' | 'shop_name'>
  buyer?: Pick<Profile, 'id' | 'full_name'>
  order_items?: OrderItem[]
  delivery?: Delivery
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_at_purchase: number
  created_at: string
  product?: Pick<Product, 'id' | 'name' | 'image_url' | 'unit'>
}

export type Delivery = {
  id: string
  order_id: string
  delivery_partner_name: string | null
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered'
  tracking_note: string | null
  estimated_delivery: string | null
  actual_delivery: string | null
  created_at: string
  updated_at: string
}
