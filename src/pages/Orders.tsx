import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react'
import { supabase, type Order } from '../lib/supabase'
import { useAuth } from '../lib/auth'

const statusConfig = {
  pending: { label: 'অপেক্ষমাণ', icon: Clock, color: 'bg-warning-500/10 text-warning-600' },
  confirmed: { label: 'নিশ্চিত', icon: Package, color: 'bg-primary-500/10 text-primary-600' },
  shipped: { label: 'পাঠানো হয়েছে', icon: Truck, color: 'bg-accent-500/10 text-accent-600' },
  delivered: { label: 'ডেলিভারি হয়েছে', icon: CheckCircle, color: 'bg-success-500/10 text-success-600' },
  cancelled: { label: 'বাতিল', icon: XCircle, color: 'bg-error-500/10 text-error-600' },
}

export default function Orders() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      if (!profile) return
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          vendor:profiles!orders_vendor_id_fkey(id, full_name, shop_name),
          order_items(*, product:products(id, name, image_url, unit)),
          delivery:deliveries(*)
        `)
        .eq('buyer_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading orders:', error)
      } else {
        setOrders(data as Order[])
      }
      setLoading(false)
    }
    loadOrders()
  }, [profile])

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">অর্ডার লোড হচ্ছে...</div>
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">কোনো অর্ডার নেই</h2>
        <p className="text-gray-500 mb-6">আপনি এখনো কোনো অর্ডার করেননি</p>
        <Link to="/" className="btn-primary inline-block">সবজি কিনুন</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">আমার অর্ডার</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusConfig[order.status]
          const StatusIcon = status.icon
          return (
            <div key={order.id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">
                    অর্ডার #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleDateString('bn-BD', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
                <span className={`badge ${status.color}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.product?.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-600">
                      ₹{item.price_at_purchase * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <div className="text-sm">
                  <span className="text-gray-500">বিক্রেতা: </span>
                  <span className="font-medium text-gray-700">
                    {order.vendor?.shop_name || order.vendor?.full_name}
                  </span>
                </div>
                <span className="font-bold text-primary-700">₹{order.total_amount}</span>
              </div>

              {/* Delivery tracking */}
              {order.delivery && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Truck className="w-4 h-4" />
                    {order.delivery.status === 'assigned' && 'ডেলিভারি পার্টনার নির্ধারিত'}
                    {order.delivery.status === 'picked_up' && 'প্যাকেজ তুলে নেওয়া হয়েছে'}
                    {order.delivery.status === 'in_transit' && 'পথে আছে'}
                    {order.delivery.status === 'delivered' && 'ডেলিভারি সম্পন্ন'}
                    {order.delivery.tracking_note && (
                      <span className="text-gray-400">— {order.delivery.tracking_note}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
