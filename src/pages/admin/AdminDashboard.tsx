import { useEffect, useState, useCallback } from 'react'
import {
  LayoutDashboard, Users, Package, ShoppingCart, Tag,
  TrendingUp, DollarSign, Clock, CheckCircle, XCircle,
  Trash2, Pencil, Plus, Save, X, UserCog
} from 'lucide-react'
import { supabase, type Profile, type Product, type Order, type Category } from '../../lib/supabase'

type Tab = 'overview' | 'users' | 'products' | 'orders' | 'categories'

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'অপেক্ষমাণ', color: 'bg-warning-500/10 text-warning-600' },
  confirmed: { label: 'নিশ্চিত', color: 'bg-primary-500/10 text-primary-600' },
  shipped: { label: 'পাঠানো হয়েছে', color: 'bg-accent-500/10 text-accent-600' },
  delivered: { label: 'ডেলিভারি হয়েছে', color: 'bg-success-500/10 text-success-600' },
  cancelled: { label: 'বাতিল', color: 'bg-error-500/10 text-error-600' },
}

const roleLabels: Record<string, string> = {
  buyer: 'ক্রেতা',
  vendor: 'বিক্রেতা',
  admin: 'অ্যাডমিন',
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setError(null)

    const { data: profilesData, error: profilesErr } = await supabase
      .from('profiles').select('*').order('created_at', { ascending: false })
    if (profilesErr) { console.error('profiles:', profilesErr); setError(profilesErr.message); setLoading(false); return }
    setProfiles(profilesData as Profile[] || [])

    const { data: productsData, error: productsErr } = await supabase
      .from('products').select('*, category:categories(*)').order('created_at', { ascending: false })
    if (productsErr) { console.error('products:', productsErr); setError(productsErr.message); setLoading(false); return }
    setProducts(productsData as Product[] || [])

    const { data: ordersData, error: ordersErr } = await supabase
      .from('orders').select('*, buyer:profiles!orders_buyer_id_fkey(id, full_name), vendor:profiles!orders_vendor_id_fkey(id, full_name, shop_name), order_items(*)').order('created_at', { ascending: false })
    if (ordersErr) { console.error('orders:', ordersErr); setError(ordersErr.message); setLoading(false); return }
    setOrders(ordersData as Order[] || [])

    const { data: catsData, error: catsErr } = await supabase
      .from('categories').select('*').order('name')
    if (catsErr) { console.error('categories:', catsErr); setError(catsErr.message); setLoading(false); return }
    setCategories(catsData as Category[] || [])

    setLoading(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const stats = {
    totalUsers: profiles.length,
    totalVendors: profiles.filter(p => p.role === 'vendor').length,
    totalBuyers: profiles.filter(p => p.role === 'buyer').length,
    totalProducts: products.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    deliveredOrders: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + Number(o.total_amount), 0),
  }

  const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { key: 'overview', label: 'ওভারভিউ', icon: LayoutDashboard },
    { key: 'users', label: 'ইউজার', icon: Users },
    { key: 'products', label: 'প্রোডাক্ট', icon: Package },
    { key: 'orders', label: 'অর্ডার', icon: ShoppingCart },
    { key: 'categories', label: 'ক্যাটাগরি', icon: Tag },
  ]

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-500">লোড হচ্ছে...</div>
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="card p-8 max-w-md mx-auto">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">ডেটা লোড করতে সমস্যা</h2>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button onClick={loadAll} className="btn-primary text-sm">আবার চেষ্টা করুন</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
          <UserCog className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="text-sm text-gray-500">পুরো বাজার নিয়ন্ত্রণ করুন</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl border border-gray-200 p-1 overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === key
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab stats={stats} orders={orders.slice(0, 5)} />}
      {tab === 'users' && <UsersTab profiles={profiles} onUpdate={loadAll} />}
      {tab === 'products' && <ProductsTab products={products} onUpdate={loadAll} />}
      {tab === 'orders' && <OrdersTab orders={orders} onUpdate={loadAll} />}
      {tab === 'categories' && <CategoriesTab categories={categories} onUpdate={loadAll} />}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof TrendingUp; label: string; value: string | number; color: string }) {
  return (
    <div className="card p-5">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}

function OverviewTab({ stats, orders }: { stats: any; orders: Order[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="মোট ইউজার" value={stats.totalUsers} color="bg-primary-500/10 text-primary-600" />
        <StatCard icon={Package} label="মোট প্রোডাক্ট" value={stats.totalProducts} color="bg-accent-500/10 text-accent-600" />
        <StatCard icon={ShoppingCart} label="মোট অর্ডার" value={stats.totalOrders} color="bg-warning-500/10 text-warning-600" />
        <StatCard icon={DollarSign} label="মোট আয় (₹)" value={`₹${stats.revenue.toFixed(2)}`} color="bg-success-500/10 text-success-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={TrendingUp} label="বিক্রেতা" value={stats.totalVendors} color="bg-primary-500/10 text-primary-600" />
        <StatCard icon={Clock} label="অপেক্ষমাণ অর্ডার" value={stats.pendingOrders} color="bg-warning-500/10 text-warning-600" />
        <StatCard icon={CheckCircle} label="ডেলিভারি হওয়া" value={stats.deliveredOrders} color="bg-success-500/10 text-success-600" />
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">সাম্প্রতিক অর্ডার</h2>
        {orders.length === 0 ? (
          <p className="text-gray-400 text-sm">কোনো অর্ডার নেই</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const s = statusConfig[order.status]
              return (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-400">
                      {order.buyer?.full_name} • {new Date(order.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${s.color}`}>{s.label}</span>
                    <span className="font-bold text-primary-700 text-sm">₹{order.total_amount}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function UsersTab({ profiles, onUpdate }: { profiles: Profile[]; onUpdate: () => void }) {
  const [editing, setEditing] = useState<Profile | null>(null)
  const [editRole, setEditRole] = useState('')

  async function updateRole(profile: Profile, newRole: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', profile.id)
    if (!error) { setEditing(null); onUpdate() }
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-3 font-medium">নাম</th>
              <th className="text-left px-4 py-3 font-medium">ফোন</th>
              <th className="text-left px-4 py-3 font-medium">ভূমিকা</th>
              <th className="text-left px-4 py-3 font-medium">যোগ দিয়েছে</th>
              <th className="text-right px-4 py-3 font-medium">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {profiles.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{p.full_name}</p>
                  {p.shop_name && <p className="text-xs text-gray-400">{p.shop_name}</p>}
                </td>
                <td className="px-4 py-3 text-gray-600">{p.phone || '—'}</td>
                <td className="px-4 py-3">
                  {editing?.id === p.id ? (
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="input-field py-1 text-sm"
                    >
                      <option value="buyer">ক্রেতা</option>
                      <option value="vendor">বিক্রেতা</option>
                      <option value="admin">অ্যাডমিন</option>
                    </select>
                  ) : (
                    <span className={`badge ${
                      p.role === 'admin' ? 'bg-error-500/10 text-error-600' :
                      p.role === 'vendor' ? 'bg-primary-500/10 text-primary-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {roleLabels[p.role]}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(p.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-right">
                  {editing?.id === p.id ? (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => updateRole(p, editRole)}
                        className="text-success-600 hover:bg-success-50 p-1.5 rounded-lg transition-colors"
                        title="সংরক্ষণ"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
                        title="বাতিল"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditing(p); setEditRole(p.role) }}
                      className="text-gray-400 hover:text-primary-600 hover:bg-primary-50 p-1.5 rounded-lg transition-colors"
                      title="ভূমিকা পরিবর্তন"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProductsTab({ products, onUpdate }: { products: Product[]; onUpdate: () => void }) {
  async function toggleAvailability(product: Product) {
    const { error } = await supabase
      .from('products')
      .update({ is_available: !product.is_available, updated_at: new Date().toISOString() })
      .eq('id', product.id)
    if (!error) onUpdate()
  }

  async function deleteProduct(id: string) {
    if (!confirm('এই প্রোডাক্টটি মুছে ফেলতে চান?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) onUpdate()
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product.id} className="card overflow-hidden">
          <div className="h-36 bg-gray-100">
            <img
              src={product.image_url || 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-gray-900">{product.name}</h3>
              <span className={`badge ${product.is_available ? 'bg-success-500/10 text-success-600' : 'bg-gray-100 text-gray-500'}`}>
                {product.is_available ? 'দৃশ্যমান' : 'লুকানো'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">₹{product.price}/{product.unit} • স্টক: {product.stock_qty}</p>
            <p className="text-xs text-gray-400 mb-3">বিক্রেতা ID: {product.vendor_id.slice(0, 8)}</p>
            <div className="flex gap-2">
              <button
                onClick={() => toggleAvailability(product)}
                className="flex-1 text-sm text-gray-600 border border-gray-200 rounded-lg py-2 hover:border-primary-500 hover:text-primary-600 transition-colors"
              >
                {product.is_available ? 'লুকান' : 'দেখান'}
              </button>
              <button
                onClick={() => deleteProduct(product.id)}
                className="text-error-500 border border-gray-200 rounded-lg px-3 py-2 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function OrdersTab({ orders, onUpdate }: { orders: Order[]; onUpdate: () => void }) {
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  async function updateStatus(orderId: string, newStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)
    if (!error) onUpdate()
  }

  const filters = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'সব' : statusConfig[f]?.label || f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">কোনো অর্ডার নেই</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const s = statusConfig[order.status]
            return (
              <div key={order.id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-400">
                      ক্রেতা: {order.buyer?.full_name} • বিক্রেতা: {order.vendor?.shop_name || order.vendor?.full_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${s.color}`}>{s.label}</span>
                    <span className="font-bold text-primary-700">₹{order.total_amount}</span>
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-600">
                      <span>{item.quantity}× আইটেম</span>
                      <span>₹{item.price_at_purchase * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 flex-wrap border-t border-gray-50 pt-3">
                  {order.status === 'pending' && (
                    <button onClick={() => updateStatus(order.id, 'confirmed')} className="text-xs bg-primary-100 text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-200 transition-colors">
                      নিশ্চিত করুন
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button onClick={() => updateStatus(order.id, 'shipped')} className="text-xs bg-accent-100 text-accent-700 px-3 py-1.5 rounded-lg hover:bg-accent-200 transition-colors">
                      শিপ করুন
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button onClick={() => updateStatus(order.id, 'delivered')} className="text-xs bg-success-100 text-success-700 px-3 py-1.5 rounded-lg hover:bg-success-200 transition-colors">
                      ডেলিভারি সম্পন্ন
                    </button>
                  )}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <button onClick={() => updateStatus(order.id, 'cancelled')} className="text-xs bg-error-100 text-error-700 px-3 py-1.5 rounded-lg hover:bg-error-200 transition-colors">
                      বাতিল করুন
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CategoriesTab({ categories, onUpdate }: { categories: Category[]; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🥬')
  const [description, setDescription] = useState('')

  function resetForm() {
    setName(''); setIcon('🥬'); setDescription(''); setEditing(null); setShowForm(false)
  }

  function startEdit(cat: Category) {
    setEditing(cat)
    setName(cat.name)
    setIcon(cat.icon)
    setDescription(cat.description || '')
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const slug = name.trim().toLowerCase().replace(/\s+/g, '-')
    if (editing) {
      const { error } = await supabase
        .from('categories')
        .update({ name, icon, description, slug })
        .eq('id', editing.id)
      if (error) { console.error(error); return }
    } else {
      const { error } = await supabase
        .from('categories')
        .insert({ name, icon, description, slug })
      if (error) { console.error(error); return }
    }
    resetForm()
    onUpdate()
  }

  async function deleteCategory(id: string) {
    if (!confirm('এই ক্যাটাগরিটি মুছতে চান?')) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) onUpdate()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">ক্যাটাগরি ম্যানেজমেন্ট</h2>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> নতুন ক্যাটাগরি
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 space-y-4 animate-fade-in">
          <h3 className="font-medium">{editing ? 'ক্যাটাগরি এডিট করুন' : 'নতুন ক্যাটাগরি'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">নাম</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="যেমন: শাকসবজি" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">আইকন (ইমোজি)</label>
              <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} className="input-field" placeholder="🥬" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">বর্ণনা</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" placeholder="ক্যাটাগরির বর্ণনা" />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary text-sm">{editing ? 'আপডেট' : 'যোগ করুন'}</button>
            <button type="button" onClick={resetForm} className="btn-secondary text-sm">বাতিল</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <div key={cat.id} className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <p className="font-medium text-gray-900">{cat.name}</p>
                {cat.description && <p className="text-xs text-gray-400">{cat.description}</p>}
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => startEdit(cat)} className="text-gray-400 hover:text-primary-600 p-1.5 rounded-lg hover:bg-primary-50 transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => deleteCategory(cat.id)} className="text-error-400 hover:text-error-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
