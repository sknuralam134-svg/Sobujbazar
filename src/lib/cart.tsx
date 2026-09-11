import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, type CartItem } from './supabase'
import { useAuth } from './auth'

type CartContextType = {
  items: CartItem[]
  loading: boolean
  addItem: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session?.user) {
      setItems([])
      return
    }
    loadCart()
  }, [session?.user])

  async function loadCart() {
    if (!session?.user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*, category:categories(*))
      `)
      .eq('buyer_id', session.user.id)

    if (error) {
      console.error('Error loading cart:', error)
    } else {
      setItems(data as CartItem[])
    }
    setLoading(false)
  }

  async function addItem(productId: string, quantity = 1) {
    if (!session?.user) return
    const existing = items.find((i) => i.product_id === productId)
    if (existing) {
      await updateQuantity(existing.id, existing.quantity + quantity)
    } else {
      const { data, error } = await supabase
        .from('cart_items')
        .insert({ buyer_id: session.user.id, product_id: productId, quantity })
        .select(`*, product:products(*, category:categories(*))`)
        .single()
      if (!error && data) {
        setItems([...items, data as CartItem])
      }
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      await removeItem(itemId)
      return
    }
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
    if (!error) {
      setItems(items.map((i) => (i.id === itemId ? { ...i, quantity } : i)))
    }
  }

  async function removeItem(itemId: string) {
    const { error } = await supabase.from('cart_items').delete().eq('id', itemId)
    if (!error) {
      setItems(items.filter((i) => i.id !== itemId))
    }
  }

  async function clearCart() {
    if (!session?.user) return
    const { error } = await supabase.from('cart_items').delete().eq('buyer_id', session.user.id)
    if (!error) setItems([])
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.quantity * (i.product?.price || 0), 0)

  return (
    <CartContext.Provider value={{ items, loading, addItem, updateQuantity, removeItem, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
