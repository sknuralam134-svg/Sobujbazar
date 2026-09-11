import { useEffect, useState } from 'react'
import { Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react'
import { supabase, type Order } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

const statusConfig = {
  pending: { label: 'অপেক্ষমাণ', icon: Clock, color: 'bg-warning-500/10 text-warning-600' },
  confirmed: { label: 'নিশ্চিত', icon: Package, color: 'bg-primary-500/10 text-primary-600' },
  shipped: { label: 'পাঠানো হয়েছে', icon: Truck, color: 'bg-accent-500/10 text-accent-600' },
  delivered: { label: 'ডেলিভারি হয়েছে', icon: CheckCircle, color: 'bg-success-500/10 text-success-600' },
  cancelled: { label: 'বাতিল', icon: XCircle, color: 'bg-error-500/10 text-error-600' },
}

const nextStatus: Record<string, string | null> = {
  pending: 'confirmed',
  confirmed: 'shipped',
  shipped: 'delivered',
  delivered: null,
  cancelled: null,
}

export default function VendorOrders() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [profile])

  async function loadOrders() {
    if (!profile) return
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*, product:products(id, name, image_url, unit)),
        delivery:deliveries(*)
      `)
      .eq('vendor_id', profile.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading vendor orders:', error)
    } else {
      setOrders(data as Order[])
    }
    setLoading(false)
  }

  async function updateStatus(orderId: string, newStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)
    if (!error) {
      loadOrders()
    }
  }

  async function updateDeliveryStatus(orderId: string, deliveryId: string, newStatus: string) {
    const updates: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }
    if (newStatus === 'delivered') {
      updates.actual_delivery = new Date().toISOString()
    }
    const { error } = await supabase
      .from('deliveries')
      .update(updates)
      .eq('id', deliveryId)
    if (!error) {
      // Also update order status if needed
      if (newStatus === 'delivered') {
        await supabase.from('orders').update({ status: 'delivered' }).eq('id', orderId)
      }
      loadOrders()
    }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">লোড হচ্ছে...</div>
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">কোনো অর্ডার নেই</h2>
        <p className="text-gray-500">ক্রেতারা অর্ডার করলে এখানে দেখা যাবে</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">অর্ডার ম্যানেজমেন্ট</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusConfig[order.status]
          const StatusIcon = status.icon
          const canAdvance = nextStatus[order.status] !== null
          return (
            <div key={order.id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">অর্ডার #{order.id.slice(0, 8)}</p>
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
                    <span className="text-gray-700">{item.product?.name} × {item.quantity}</span>
                    <span className="font-medium">₹{item.price_at_purchase * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 mb-3 text-sm">
                <p className="text-gray-600"><strong>ডেলিভারি ঠিকানা:</strong> {order.delivery_address}</p>
                <p className="text-gray-600"><strong>ফোন:</strong> {order.delivery_phone}</p>
                {order.delivery_notes && <p className="text-gray-500"><strong>নোট:</strong> {order.delivery_notes}</p>}
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="font-bold text-primary-700">₹{order.total_amount}</span>
                {canAdvance && (
                  <button
                    onClick={() => updateStatus(order.id, nextStatus[order.status]!)}
                    className="btn-primary text-sm"
                  >
                    {order.status === 'pending' && 'অর্ডার নিশ্চিত করুন'}
                    {order.status === 'confirmed' && 'শিপ করুন'}
                    {order.status === 'shipped' && 'ডেলিভারি সম্পন্ন করুন'}
                  </button>
                )}
              </div>

              {/* Delivery tracking */}
              {order.delivery && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-2">ডেলিভারি স্ট্যাটাস</p>
                  <div className="flex gap-2 flex-wrap">
                    {order.delivery.status === 'assigned' && (
                      <button
                        onClick={() => updateDeliveryStatus(order.id, order.delivery!.id, 'picked_up')}
                        className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        প্যাকেজ তুলে নেওয়া হয়েছে
                      </button>
                    )}
                    {order.delivery.status === 'picked_up' && (
                      <button
                        onClick={() => updateDeliveryStatus(order.id, order.delivery!.id, 'in_transit')}
                        className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        পথে পাঠান
                      </button>
                    )}
                    {order.delivery.status === 'in_transit' && (
                      <button
                        onClick={() => updateDeliveryStatus(order.id, order.delivery!.id, 'delivered')}
                        className="text-xs bg-success-500 text-white px-3 py-1.5 rounded-lg hover:bg-success-600 transition-colors"
                      >
                        ডেলিভারি সম্পন্ন
                      </button>
                    )}
                    {order.delivery.status === 'delivered' && (
                      <span className="text-xs text-success-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> ডেলিভারি সম্পন্ন
                      </span>
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
