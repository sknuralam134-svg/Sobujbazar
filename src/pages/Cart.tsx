import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react'
import { useCart } from '../lib/cart'
import { useAuth } from '../lib/auth'

const fallbackImages: Record<string, string> = {
  'আলু': 'https://images.pexels.com/photos/2286779/pexels-photo-2286779.jpeg',
  'পেঁয়াজ': 'https://images.pexels.com/photos/1306559/pexels-photo-1306559.jpeg',
  'টমেটো': 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg',
  'গাজর': 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg',
  'বেগুন': 'https://images.pexels.com/photos/37641/aubergine-eggplant-vine-vegetable-37641.jpeg',
  'মরিচ': 'https://images.pexels.com/photos/1340116/pexels-photo-1340116.jpeg',
  'লাউ': 'https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg',
  'পালং': 'https://images.pexels.com/photos/2255925/pexels-photo-2255925.jpeg',
  'রসুন': 'https://images.pexels.com/photos/8873497/pexels-photo-8873497.jpeg',
  'আদা': 'https://images.pexels.com/photos/161558/garlic-vegetables-bulb-cooking-161558.jpeg',
  'ভুট্টা': 'https://images.pexels.com/photos/5473215/pexels-photo-5473215.jpeg',
  'শসা': 'https://images.pexels.com/photos/2329440/pexels-photo-2329440.jpeg',
}

function getImage(name: string, imageUrl: string | null): string {
  if (imageUrl) return imageUrl
  if (fallbackImages[name]) return fallbackImages[name]
  return 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg'
}

export default function Cart() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice, loading } = useCart()
  const { session } = useAuth()
  const navigate = useNavigate()

  if (!session) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">কার্ট দেখতে লগইন করুন</h2>
        <Link to="/login" className="btn-primary inline-block mt-4">লগইন করুন</Link>
      </div>
    )
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-500">কার্ট লোড হচ্ছে...</div>
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">আপনার কার্ট খালি</h2>
        <p className="text-gray-500 mb-6">তাজা সবজি কিনতে শপিং শুরু করুন</p>
        <Link to="/" className="btn-primary inline-block">সবজি ব্রাউজ করুন</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> শপিং চালিয়ে যান
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">আপনার কার্ট ({totalItems} আইটেম)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card p-4 flex gap-4 items-center">
              <img
                src={getImage(item.product?.name || '', item.product?.image_url || null)}
                alt={item.product?.name}
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product_id}`} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                  {item.product?.name}
                </Link>
                <p className="text-sm text-gray-500">₹{item.product?.price}/{item.product?.unit}</p>
                <p className="text-sm font-medium text-primary-700 mt-1">
                  ₹{(item.product?.price || 0) * item.quantity}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:border-primary-500 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:border-primary-500 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-error-500 hover:bg-red-50 transition-colors ml-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h3 className="font-bold text-lg mb-4">বিল সারাংশ</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>সাবটোটাল</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ডেলিভারি ফি</span>
                <span>₹0</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                <span>মোট</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full mt-4"
            >
              চেকআউট করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
