import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../lib/auth'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
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
          <h1 className="text-2xl font-bold text-gray-900 mt-3">সবুজ বাজারে স্বাগতম</h1>
          <p className="text-gray-500 mt-1">আপনার অ্যাকাউন্টে লগইন করুন</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-error-600 text-sm rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="আপনার পাসওয়ার্ড"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
          </button>

          <p className="text-center text-sm text-gray-500">
            অ্যাকাউন্ট নেই?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">
              রেজিস্টার করুন
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
