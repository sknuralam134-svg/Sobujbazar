import { Link } from 'react-router-dom'
import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
              <span className="text-2xl">🥬</span> সবুজ বাজার
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              তাজা ও জৈব সবজি সরাসরি কৃষকের কাছ থেকে আপনার ঘরে। স্বাস্থ্যকর জীবনের জন্য সবুজ বাজার।
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">দ্রুত লিংক</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary-400 transition-colors">হোম</Link></li>
              <li><Link to="/cart" className="hover:text-primary-400 transition-colors">কার্ট</Link></li>
              <li><Link to="/orders" className="hover:text-primary-400 transition-colors">আমার অর্ডার</Link></li>
              <li><Link to="/register" className="hover:text-primary-400 transition-colors">বিক্রেতা হিসেবে যোগ দিন</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">যোগাযোগ</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary-400" /> +91 90000-00000</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary-400" /> info@sobujbazar.com</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-400" /> মুর্শিদাবাদ, পশ্চিমবঙ্গ, ভারত</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">আমাদের অনুসরণ করুন</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          © ২০২৬ সবুজ বাজার। সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </footer>
  )
}
