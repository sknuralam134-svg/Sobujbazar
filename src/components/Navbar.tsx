import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Store, Home, Package, Truck, ClipboardList, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useCart } from '../lib/cart'
import { useState } from 'react'

export default function Navbar() {
  const { profile, signOut } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-primary-700 font-bold text-xl">
            <span className="text-2xl">🥬</span>
            <span className="hidden sm:inline">সবুজ বাজার</span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-3">
            <Link to="/" className="p-2 text-gray-600 hover:text-primary-600 transition-colors" title="হোম">
              <Home className="w-5 h-5" />
            </Link>

            {profile?.role === 'admin' && (
              <Link to="/admin" className="p-2 text-gray-600 hover:text-primary-600 transition-colors" title="অ্যাডমিন ড্যাশবোর্ড">
                <LayoutDashboard className="w-5 h-5" />
              </Link>
            )}

            {profile?.role === 'buyer' && (
              <Link to="/orders" className="p-2 text-gray-600 hover:text-primary-600 transition-colors" title="আমার অর্ডার">
                <ClipboardList className="w-5 h-5" />
              </Link>
            )}

            {profile?.role === 'vendor' && (
              <>
                <Link to="/vendor/products" className="p-2 text-gray-600 hover:text-primary-600 transition-colors" title="প্রোডাক্ট ম্যানেজ">
                  <Package className="w-5 h-5" />
                </Link>
                <Link to="/vendor/orders" className="p-2 text-gray-600 hover:text-primary-600 transition-colors" title="অর্ডার ম্যানেজ">
                  <Truck className="w-5 h-5" />
                </Link>
              </>
            )}

            {profile?.role === 'buyer' && (
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors" title="কার্ট">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-bounce-in">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {profile ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
                    {profile.full_name}
                  </span>
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-fade-in">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{profile.full_name}</p>
                        <p className="text-xs text-gray-500">
                          {profile.role === 'buyer' ? 'ক্রেতা' : profile.role === 'vendor' ? 'বিক্রেতা' : 'অ্যাডমিন'}
                        </p>
                      </div>
                      <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User className="w-4 h-4" /> প্রোফাইল
                      </Link>
                      {profile.role === 'buyer' && (
                        <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <ClipboardList className="w-4 h-4" /> অর্ডার হিস্ট্রি
                        </Link>
                      )}
                      {profile.role === 'admin' && (
                        <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <LayoutDashboard className="w-4 h-4" /> অ্যাডমিন প্যানেল
                        </Link>
                      )}
                      <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-red-50 w-full">
                        <LogOut className="w-4 h-4" /> লগআউট
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-gray-600 hover:text-primary-600 text-sm font-medium px-3 py-2 transition-colors">
                  লগইন
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  রেজিস্টার
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
