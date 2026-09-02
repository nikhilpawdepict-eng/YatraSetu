import { useState } from 'react'

type Role = 'homestay' | 'guide' | 'arts'

const roles: { id: Role; icon: string; label: string }[] = [
  { id: 'homestay', icon: '🏠', label: 'Homestay' },
  { id: 'guide', icon: '🧑‍🤝‍🧑', label: 'Guide' },
  { id: 'arts', icon: '🎭', label: 'Arts & Crafts' },
]

const commonFields = [
  { id: 'name', label: 'Name', placeholder: 'Your name or business name', type: 'text' },
  { id: 'location', label: '📍 Location', placeholder: 'City, State', type: 'text' },
  { id: 'price', label: '💰 Price', placeholder: 'e.g. ₹1,500 per day', type: 'text' },
  { id: 'description', label: '💬 Description', placeholder: 'Tell travellers about your offering...', type: 'textarea' },
  { id: 'availability', label: '🟢 Availability', placeholder: 'e.g. Available Mon–Sat, 9 AM to 6 PM', type: 'text' },
  { id: 'speciality', label: '🎯 Speciality', placeholder: 'Your unique strength or specialisation', type: 'text' },
]

const roleFields: Record<Role, { id: string; label: string; placeholder: string; type: string }[]> = {
  homestay: [
    { id: 'facilities', label: '🛁 Facilities', placeholder: 'e.g. WiFi, AC, Kitchen, Parking', type: 'text' },
    { id: 'accType', label: '🏠 Accommodation Type', placeholder: 'e.g. Private Room, Shared Dorm, Entire House', type: 'text' },
    { id: 'rooms', label: '🛏️ Number of Rooms', placeholder: 'e.g. 3 rooms available', type: 'number' },
    { id: 'food', label: '🍽️ Food / Services', placeholder: 'e.g. Breakfast included, Rajasthani thali on request', type: 'text' },
    { id: 'special', label: '✨ Special Features', placeholder: 'e.g. Heritage architecture, Rooftop terrace, Cooking classes', type: 'text' },
  ],
  guide: [
    { id: 'places', label: '🗺️ Places Covered', placeholder: 'e.g. Amber Fort, City Palace, Hawa Mahal', type: 'text' },
    { id: 'tourTypes', label: '🎒 Tour Types', placeholder: 'e.g. Heritage, Food, Photography, Adventure', type: 'text' },
    { id: 'languages', label: '🗣️ Languages', placeholder: 'e.g. Hindi, English, French', type: 'text' },
    { id: 'guideSpec', label: '🎯 Guide Speciality', placeholder: 'e.g. Mughal architecture expert', type: 'text' },
    { id: 'duration', label: '⏱️ Typical Tour Duration', placeholder: 'e.g. Half day (4 hrs) or Full day (8 hrs)', type: 'text' },
  ],
  arts: [
    { id: 'productName', label: '🎨 Product Name', placeholder: 'e.g. Blue Pottery Vase Set', type: 'text' },
    { id: 'material', label: '🧱 Material', placeholder: 'e.g. Ceramic, Silk, Sandalwood', type: 'text' },
    { id: 'artPrice', label: '💰 Product Price', placeholder: 'e.g. ₹850 per piece', type: 'text' },
    { id: 'durability', label: '🛡️ Durability', placeholder: 'e.g. 10+ years, archival quality', type: 'text' },
    { id: 'available', label: '📦 Available Products', placeholder: 'e.g. 24 pieces in stock', type: 'text' },
  ],
}

export default function LocalDetails() {
  const [activeRole, setActiveRole] = useState<Role>('guide')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({
    name: 'Arjun Mehta',
    location: 'Jaipur, Rajasthan',
    price: '₹1,500 per day',
    description: 'Certified heritage guide with 8+ years of experience exploring the Pink City.',
    availability: 'Available Mon–Sat, 8 AM – 7 PM',
    speciality: 'Rajasthani Heritage & Cultural Walks',
    places: 'Amber Fort, City Palace, Nahargarh Fort, Jaigarh, Hawa Mahal',
    tourTypes: 'Heritage, Photography, Food & Bazaar, Sunrise/Sunset',
    languages: 'Hindi, English, French',
    guideSpec: 'Mughal & Rajput architecture expert',
    duration: 'Half day (4 hrs) to Full day (8 hrs)',
  })

  function handleChange(id: string, value: string) {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const allFields = [...commonFields, ...roleFields[activeRole]]

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          <h2 className="text-2xl font-700 text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
            My Offering Details
          </h2>
        </div>
        <p className="text-[#7B8582] text-sm mt-1">
          Keep your profile details up to date so travellers find accurate information.
        </p>
      </div>

      {/* Role selector */}
      <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 shadow-[0_4px_20px_rgba(20,27,24,0.06)] w-fit">
        {roles.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveRole(r.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-600 transition-all duration-200 ${
              activeRole === r.id
                ? 'bg-[#0F6E5C] text-white shadow-sm'
                : 'text-[#7B8582] hover:text-[#141B18] hover:bg-[#F7F6F2]'
            }`}
          >
            <span>{r.icon}</span>
            {r.label}
          </button>
        ))}
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(20,27,24,0.06)] overflow-hidden">
        <div className="p-6 pb-0">
          {/* Common fields */}
          <h3 className="text-base font-700 text-[#141B18] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {commonFields.map((field) => (
              <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="block text-xs font-600 text-[#7B8582] mb-1">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    disabled={!isEditing}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className={`w-full h-24 px-3 py-2.5 rounded-xl border text-sm text-[#141B18] placeholder-[#7B8582] resize-none focus:outline-none transition-all ${
                      isEditing
                        ? 'border-[#E4E7E5] bg-white focus:border-[#0F6E5C] focus:ring-2 focus:ring-[#0F6E5C]/15'
                        : 'border-transparent bg-[#F7F6F2] cursor-default'
                    }`}
                  />
                ) : (
                  <input
                    disabled={!isEditing}
                    type={field.type}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className={`w-full h-11 px-3 rounded-xl border text-sm text-[#141B18] placeholder-[#7B8582] focus:outline-none transition-all ${
                      isEditing
                        ? 'border-[#E4E7E5] bg-white focus:border-[#0F6E5C] focus:ring-2 focus:ring-[#0F6E5C]/15'
                        : 'border-transparent bg-[#F7F6F2] cursor-default'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Photos */}
          <div className="mb-6">
            <label className="block text-xs font-600 text-[#7B8582] mb-2">📷 Photos</label>
            <div
              className={`h-20 border-2 border-dashed rounded-xl flex items-center justify-center transition-colors ${
                isEditing
                  ? 'border-[#0F6E5C]/40 cursor-pointer hover:bg-[#E4F3EF]/30'
                  : 'border-[#E4E7E5] cursor-default'
              }`}
            >
              <span className="text-sm text-[#7B8582]">
                {isEditing ? 'Drop images or click to upload' : 'No photos uploaded yet'}
              </span>
            </div>
          </div>

          {/* Role-specific fields */}
          <h3 className="text-base font-700 text-[#141B18] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
            {activeRole === 'homestay' ? '🏠 Homestay Details' : activeRole === 'guide' ? '🧑‍🤝‍🧑 Guide Details' : '🎭 Arts & Crafts Details'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {roleFields[activeRole].map((field) => (
              <div key={field.id}>
                <label className="block text-xs font-600 text-[#7B8582] mb-1">{field.label}</label>
                <input
                  disabled={!isEditing}
                  type={field.type}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className={`w-full h-11 px-3 rounded-xl border text-sm text-[#141B18] placeholder-[#7B8582] focus:outline-none transition-all ${
                    isEditing
                      ? 'border-[#E4E7E5] bg-white focus:border-[#0F6E5C] focus:ring-2 focus:ring-[#0F6E5C]/15'
                      : 'border-transparent bg-[#F7F6F2] cursor-default'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sticky footer */}
        <div className="px-6 py-4 border-t border-[#E4E7E5] flex items-center justify-end gap-3 bg-[#FAFAF8]">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="h-10 px-6 rounded-xl border border-[#0F6E5C] text-[#0F6E5C] text-sm font-600 hover:bg-[#E4F3EF] transition-colors"
          >
            ✏️ {isEditing ? 'Cancel' : 'Edit'}
          </button>
          <button
            disabled={!isEditing}
            onClick={() => setIsEditing(false)}
            className={`h-10 px-6 rounded-xl text-white text-sm font-600 transition-all ${
              isEditing
                ? 'bg-[#0F6E5C] hover:bg-[#0B5849] cursor-pointer'
                : 'bg-[#E4E7E5] text-[#7B8582] cursor-not-allowed'
            }`}
          >
            💾 Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
