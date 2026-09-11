import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Minus, Plus, ShoppingCart, ArrowLeft, Store } from 'lucide-react'
import { supabase, type Product } from '../lib/supabase'
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

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { session } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      if (!id) return
      const { data, error } = await supabase
        .from('products')
        .select(`*, category:categories(*), vendor:profiles!products_vendor_id_fkey(id, full_name, shop_name)`)
        .eq('id', id)
        .maybeSingle()

      if (error || !data) {
        setProduct(null)
      } else {
        setProduct(data as Product)
      }
      setLoading(false)
    }
    loadProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (!session) {
      navigate('/login')
      return
    }
    await addItem(product!.id, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="h-96 bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">প্রোডাক্ট পাওয়া যায়নি</p>
        <Link to="/" className="text-primary-600 mt-4 inline-block">হোমে ফিরুন</Link>
      </div>
    )
  }

  const imageUrl = product.image_url || fallbackImages[product.name] || 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> সব সবজিতে ফিরুন
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl overflow-hidden bg-gray-100 h-80 md:h-96">
          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col">
          {product.category && (
            <span className="text-sm text-primary-600 font-medium mb-2">
              {product.category.icon} {product.category.name}
            </span>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
          <p className="text-2xl font-bold text-primary-700 mb-4">
            ₹{product.price}
            <span className="text-base font-normal text-gray-500">/{product.unit}</span>
          </p>

          {product.description && (
            <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
          )}

          {product.vendor && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
              <Store className="w-4 h-4" />
              বিক্রেতা: {product.vendor.shop_name || product.vendor.full_name}
            </div>
          )}

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock_qty > 0 ? (
              <span className="badge bg-success-500/10 text-success-600">
                স্টকে আছে ({product.stock_qty} {product.unit})
              </span>
            ) : (
              <span className="badge bg-error-500/10 text-error-600">স্টকে নেই</span>
            )}
          </div>

          {/* Quantity & Add to Cart */}
          {product.stock_qty > 0 && (
            <div className="mt-auto space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">পরিমাণ:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:border-primary-500 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_qty, quantity + 1))}
                    className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:border-primary-500 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className={`btn-primary w-full flex items-center justify-center gap-2 ${added ? 'bg-success-500' : ''}`}
              >
                {added ? (
                  'কার্টে যোগ হয়েছে!'
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" /> কার্টে যোগ করুন
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
