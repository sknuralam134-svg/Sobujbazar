import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import { supabase, type Product, type Category } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

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

export default function VendorProducts() {
  const { profile } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('kg')
  const [stockQty, setStockQty] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [available, setAvailable] = useState(true)

  useEffect(() => {
    loadProducts()
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories(data as Category[] || [])
    })
  }, [profile])

  async function loadProducts() {
    if (!profile) return
    const { data, error } = await supabase
      .from('products')
      .select(`*, category:categories(*)`)
      .eq('vendor_id', profile.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading products:', error)
    } else {
      setProducts(data as Product[])
    }
    setLoading(false)
  }

  function resetForm() {
    setName('')
    setCategoryId('')
    setPrice('')
    setUnit('kg')
    setStockQty('')
    setDescription('')
    setImageUrl('')
    setAvailable(true)
    setEditingProduct(null)
  }

  function startEdit(product: Product) {
    setEditingProduct(product)
    setName(product.name)
    setCategoryId(product.category_id || '')
    setPrice(String(product.price))
    setUnit(product.unit)
    setStockQty(String(product.stock_qty))
    setDescription(product.description || '')
    setImageUrl(product.image_url || '')
    setAvailable(product.is_available)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return

    const slug = name.trim().toLowerCase().replace(/\s+/g, '-')
    const imageData = imageUrl || fallbackImages[name.trim()] || null

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update({
          name,
          slug,
          category_id: categoryId || null,
          price: parseFloat(price),
          unit,
          stock_qty: parseInt(stockQty) || 0,
          description,
          image_url: imageData,
          is_available: available,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingProduct.id)
      if (error) { console.error(error); return }
    } else {
      const { error } = await supabase
        .from('products')
        .insert({
          vendor_id: profile.id,
          name,
          slug,
          category_id: categoryId || null,
          price: parseFloat(price),
          unit,
          stock_qty: parseInt(stockQty) || 0,
          description,
          image_url: imageData,
          is_available: available,
        })
      if (error) { console.error(error); return }
    }

    resetForm()
    setShowForm(false)
    loadProducts()
  }

  async function handleDelete(id: string) {
    if (!confirm('আপনি কি এই প্রোডাক্টটি মুছতে চান?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) loadProducts()
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">লোড হচ্ছে...</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">আমার প্রোডাক্ট</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> নতুন প্রোডাক্ট
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4 animate-fade-in">
          <h2 className="font-semibold text-lg">{editingProduct ? 'প্রোডাক্ট এডিট করুন' : 'নতুন প্রোডাক্ট যোগ করুন'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">সবজির নাম</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="যেমন: আলু" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ক্যাটাগরি</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input-field">
                <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">দাম (₹)</label>
              <input type="number" required step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="input-field" placeholder="৪০" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">একক</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input-field">
                <option value="kg">কেজি</option>
                <option value="bunch">আঁটি</option>
                <option value="piece">পিস</option>
                <option value="dozen">ডজন</option>
                <option value="gram">গ্রাম</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">স্টক পরিমাণ</label>
              <input type="number" required min="0" value={stockQty} onChange={(e) => setStockQty(e.target.value)} className="input-field" placeholder="১০০" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ছবি URL (ঐচ্ছিক)</label>
              <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="input-field" placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">বর্ণনা</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" rows={2} placeholder="সবজির বর্ণনা" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} className="accent-primary-600 w-4 h-4" />
            <span className="text-sm text-gray-700">ক্রেতার জন্য দৃশ্যমান</span>
          </label>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">{editingProduct ? 'আপডেট করুন' : 'যোগ করুন'}</button>
            <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="btn-secondary">বাতিল</button>
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">কোনো প্রোডাক্ট নেই</p>
          <p className="text-gray-400 text-sm">নতুন সবজি যোগ করতে উপরের বাটনে ক্লিক করুন</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="card overflow-hidden">
              <div className="h-40 bg-gray-100">
                <img
                  src={product.image_url || fallbackImages[product.name] || 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">₹{product.price}/{product.unit}</p>
                  </div>
                  <span className={`badge ${product.is_available ? 'bg-success-500/10 text-success-600' : 'bg-gray-100 text-gray-500'}`}>
                    {product.is_available ? 'দৃশ্যমান' : 'লুকানো'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3">স্টক: {product.stock_qty} {product.unit}</p>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(product)} className="flex-1 flex items-center justify-center gap-1 text-sm text-gray-600 border border-gray-200 rounded-lg py-2 hover:border-primary-500 hover:text-primary-600 transition-colors">
                    <Pencil className="w-4 h-4" /> এডিট
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="flex items-center justify-center text-error-500 border border-gray-200 rounded-lg px-3 py-2 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
