import { Link } from 'react-router-dom'
import { ShoppingCart, Plus } from 'lucide-react'
import type { Product } from '../lib/supabase'
import { useCart } from '../lib/cart'
import { useAuth } from '../lib/auth'
import { useNavigate } from 'react-router-dom'

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

function getImage(product: Product): string {
  if (product.image_url) return product.image_url
  if (fallbackImages[product.name]) return fallbackImages[product.name]
  return 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg'
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { session } = useAuth()
  const navigate = useNavigate()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!session) {
      navigate('/login')
      return
    }
    await addItem(product.id, 1)
  }

  return (
    <Link to={`/product/${product.id}`} className="card group animate-fade-in">
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={getImage(product)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {product.stock_qty === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">স্টকে নেই</span>
          </div>
        )}
        {product.stock_qty > 0 && product.stock_qty <= 5 && (
          <span className="absolute top-2 left-2 bg-warning-500 text-white text-xs px-2 py-1 rounded-full">
            মাত্র {product.stock_qty} {product.unit} বাকি
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          {product.category && (
            <span className="text-xs text-primary-600 font-medium">{product.category.icon} {product.category.name}</span>
          )}
        </div>
        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {product.description || 'তাজা ও পরিষ্কার সবজি'}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary-700">₹{product.price}</span>
            <span className="text-sm text-gray-500">/{product.unit}</span>
          </div>
          {product.stock_qty > 0 && (
            <button
              onClick={handleAddToCart}
              className="bg-primary-50 hover:bg-primary-600 text-primary-600 hover:text-white p-2 rounded-lg transition-all duration-200 active:scale-90"
              title="কার্টে যোগ করুন"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}
