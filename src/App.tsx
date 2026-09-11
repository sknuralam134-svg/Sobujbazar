import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth'
import { CartProvider } from './lib/cart'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import VendorProducts from './pages/vendor/VendorProducts'
import VendorOrders from './pages/vendor/VendorOrders'
import AdminDashboard from './pages/admin/AdminDashboard'

function ProtectedRoute({ children, vendorOnly, adminOnly }: { children: React.ReactNode; vendorOnly?: boolean; adminOnly?: boolean }) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">লোড হচ্ছে...</div>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />
  if (vendorOnly && profile?.role !== 'vendor') return <Navigate to="/" replace />
  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/" replace />

  return <>{children}</>
}

export default function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="text-center">
          <span className="text-6xl block mb-4 animate-pulse">🥬</span>
          <p className="text-gray-500">সবুজ বাজার লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={
              <ProtectedRoute><Cart /></ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute><Checkout /></ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute><Orders /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
            <Route path="/vendor/products" element={
              <ProtectedRoute vendorOnly><VendorProducts /></ProtectedRoute>
            } />
            <Route path="/vendor/orders" element={
              <ProtectedRoute vendorOnly><VendorOrders /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </CartProvider>
  )
}
