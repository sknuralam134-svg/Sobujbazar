import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MapPin, Phone, MessageSquare, CreditCard, ArrowLeft, CheckCircle } from 'lucide-react'
import { useCart } from '../lib/cart'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [address, setAddress] = useState(profile?.address || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const deliveryFee = 0
  const grandTotal = totalPrice + deliveryFee

  // Group items by vendor
  const vendorGroups = items.reduce((acc, item) => {
    const vendorId = item.product?.vendor_id || 'unknown'
    if (!acc[vendorId]) acc[vendorId] = []
    acc[vendorId].push(item)
    return acc
  }, {} as Record<string, typeof items>)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Create one order per vendor
      for (const [vendorId, vendorItems] of Object.entries(vendorGroups)) {
        const orderTotal = vendorItems.reduce(
          (sum, i) => sum + i.quantity * (i.product?.price || 0),
          0
        )

        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            buyer_id: profile!.id,
            vendor_id: vendorId,
            total_amount: orderTotal + deliveryFee,
            status: 'pending',
            delivery_address: address,
            delivery_phone: phone,
            delivery_notes: notes,
            payment_method: paymentMethod,
          })
          .select()
          .single()

        if (orderError) throw orderError

        // Insert order items
        const orderItemsData = vendorItems.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_purchase: item.product?.price || 0,
        }))

        const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData)
        if (itemsError) throw itemsError

        // Create delivery record
        await supabase.from('deliveries').insert({
          order_id: order.id,
          status: 'assigned',
          estimated_delivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
      }

      await clearCart()
      setSuccess(true)
      setTimeout(() => navigate('/orders'), 2000)
    } catch (err: any) {
      setError(err.message || 'অর্ডার করতে সমস্যা হয়েছে')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-in">
        <CheckCircle className="w-20 h-20 text-success-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">অর্ডার সফল হয়েছে!</h2>
        <p className="text-gray-500">আপনার অর্ডার হিস্ট্রি পেজে নিয়ে যাওয়া হচ্ছে...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg mb-4">আপনার কার্ট খালি</p>
        <Link to="/" className="btn-primary inline-block">সবজি কিনুন</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Link to="/cart" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> কার্টে ফিরুন
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">চেকআউট</h1>

      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4">ডেলিভারি তথ্য</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ডেলিভারি ঠিকানা</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input-field pl-10"
                    rows={3}
                    placeholder="বাসার ঠিকানা লিখুন"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ফোন নম্বর</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field pl-10"
                    placeholder="+91 9xxxx-xxxxx"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">অর্ডার নোট (ঐচ্ছিক)</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input-field pl-10"
                    rows={2}
                    placeholder="বিশেষ নির্দেশনা থাকলে লিখুন"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-4">পেমেন্ট পদ্ধতি</h3>
            <div className="space-y-2">
              <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === 'cod' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-primary-600"
                />
                <CreditCard className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium">ক্যাশ অন ডেলিভারি</span>
              </label>
              <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all opacity-50 ${
                paymentMethod === 'online' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  disabled
                  className="accent-primary-600"
                />
                <CreditCard className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium">অনলাইন পেমেন্ট (শীঘ্রই আসছে)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h3 className="font-bold text-lg mb-4">অর্ডার সারাংশ</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.product?.name} × {item.quantity}</span>
                  <span className="font-medium">₹{(item.product?.price || 0) * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
              <div className="flex justify-between text-gray-600">
                <span>সাবটোটাল</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ডেলিভারি ফি</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                <span>মোট</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            {error && (
              <p className="text-error-600 text-sm mt-3 bg-red-50 p-2 rounded-lg">{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-4 disabled:opacity-50">
              {loading ? 'অর্ডার হচ্ছে...' : 'অর্ডার নিশ্চিত করুন'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
