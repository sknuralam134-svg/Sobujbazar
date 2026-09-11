import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Phone, Store, AlertCircle } from 'lucide-react'
import { useAuth } from '../lib/auth'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'buyer' | 'vendor'>('buyer')
  const [shopName, setShopName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (role === 'vendor' && !shopName.trim()) {
      setError('দোকানের নাম আবশ্যক')
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password, fullName, role, phone)
    if (error) {
      setError(error)
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🥬</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">নতুন অ্যাকাউন্ট তৈরি করুন</h1>
          <p className="text-gray-500 mt-1">সবুজ বাজারে যোগ দিন</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-error-600 text-sm rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">অ্যাকাউন্টের ধরন</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                  role === 'buyer'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <User className="w-6 h-6 mx-auto mb-1" />
                <p className="text-sm font-medium">ক্রেতা</p>
              </button>
              <button
                type="button"
                onClick={() => setRole('vendor')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                  role === 'vendor'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <Store className="w-6 h-6 mx-auto mb-1" />
                <p className="text-sm font-medium">বিক্রেতা</p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">পূর্ণ নাম</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field pl-10"
                placeholder="আপনার নাম"
              />
            </div>
          </div>

          {role === 'vendor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">দোকানের নাম</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="input-field pl-10"
                  placeholder="আপনার দোকানের নাম"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ফোন নম্বর</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field pl-10"
                placeholder="+91 9xxxx-xxxxx"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ইমেইল</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="আপনার ইমেইল"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="কমপক্ষে ৬ অক্ষর"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'রেজিস্টার করুন'}
          </button>

          <p className="text-center text-sm text-gray-500">
            অ্যাকাউন্ট আছে?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              লগইন করুন
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
