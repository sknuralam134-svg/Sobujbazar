import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Leaf, Truck, Shield, Clock } from 'lucide-react'
import { supabase, type Product, type Category } from '../lib/supabase'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('products')
          .select(`*, category:categories(*)`)
          .eq('is_available', true)
          .order('created_at', { ascending: false }),
      ])
      setCategories(cats as Category[] || [])
      setProducts(prods as Product[] || [])
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredProducts = products.filter((p) => {
    const matchesCategory = !selectedCategory || p.category_id === selectedCategory
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-50 py-16 sm:py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-200/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-200/20 rounded-full blur-3xl translate-y-1/3" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Leaf className="w-4 h-4" /> তাজা সবজি, সরাসরি কৃষকের কাছ থেকে
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              আপনার ঘরে <span className="text-primary-600">তাজা সবজি</span>,<br />এক ক্লিকেই
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              প্রতিদিনের তাজা সবজি অনলাইনে অর্ডার করুন। দ্রুত ডেলিভারি, সুতো-মুক্ত প্যাকেজিং, এবং পরিশ্রমী কৃষকের সরাসরি সমর্থন।
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="#products" className="btn-primary">
                সবজি কিনুন
              </a>
              <Link to="/register" className="btn-secondary">
                বিক্রেতা হিসেবে যোগ দিন
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">১০০% তাজা</p>
                <p className="text-xs text-gray-500">প্রতিদিন কৃষকের কাছ থেকে</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">দ্রুত ডেলিভারি</p>
                <p className="text-xs text-gray-500">২৪ ঘণ্টার মধ্যে</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">নিরাপদ পেমেন্ট</p>
                <p className="text-xs text-gray-500">ক্যাশ অন ডেলিভারি</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">২৪/৭ সাপোর্ট</p>
                <p className="text-xs text-gray-500">যেকোনো সময় সাহায্য</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">সব সবজি</h2>
          <input
            type="text"
            placeholder="সবজি খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field max-w-xs"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              !selectedCategory
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            সব
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🥬</div>
            <p className="text-gray-500 text-lg mb-2">এই মুহূর্তে কোনো সবজি নেই</p>
            <p className="text-gray-400 text-sm">বিক্রেতারা এখনো প্রোডাক্ট যোগ করেননি। অনুগ্রহ করে পরে আবার দেখুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
