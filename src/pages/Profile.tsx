import { useState } from 'react'
import { User, Phone, MapPin, Save, CheckCircle } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const { profile, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [address, setAddress] = useState(profile?.address || '')
  const [city, setCity] = useState(profile?.city || '')
  const [area, setArea] = useState(profile?.area || '')
  const [shopName, setShopName] = useState(profile?.shop_name || '')
  const [shopDesc, setShopDesc] = useState(profile?.shop_description || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
        address,
        city,
        area,
        shop_name: profile?.role === 'vendor' ? shopName : null,
        shop_description: profile?.role === 'vendor' ? shopDesc : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile!.id)

    if (!error) {
      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  if (!profile) return null

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">আমার প্রোফাইল</h1>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{profile.full_name}</h2>
            <p className="text-sm text-gray-500">
              {profile.role === 'buyer' ? 'ক্রেতা' : profile.role === 'vendor' ? 'বিক্রেতা' : 'অ্যাডমিন'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="card p-6 space-y-4">
        {profile.role === 'vendor' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">দোকানের নাম</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="input-field"
                placeholder="দোকানের নাম"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">দোকানের বর্ণনা</label>
              <textarea
                value={shopDesc}
                onChange={(e) => setShopDesc(e.target.value)}
                className="input-field"
                rows={2}
                placeholder="আপনার দোকানের সম্পর্কে কিছু লিখুন"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">পূর্ণ নাম</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input-field"
          />
        </div>

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
          <label className="block text-sm font-medium text-gray-700 mb-1.5">ঠিকানা</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field pl-10"
              rows={2}
              placeholder="বাসার ঠিকানা"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">শহর</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="input-field"
              placeholder="মুর্শিদাবাদ"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">এলাকা</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="input-field"
              placeholder="ধানমন্ডি"
            />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
          {saved ? (
            <><CheckCircle className="w-5 h-5" /> সংরক্ষিত হয়েছে</>
          ) : (
            <><Save className="w-5 h-5" /> {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</>
          )}
        </button>
      </form>
    </div>
  )
}
