import React, { useState } from 'react'
import AvailabilityCalendar from './AvailabilityCalendar'
import { useApp } from '../context/AppContext'

interface OnboardingWizardProps {
  initialRole?: 'homestay' | 'guide' | 'arts'
  onComplete?: () => void
  onCancel?: () => void
}

type Lang = 'en' | 'hi' | 'raj'

const translations = {
  en: {
    wizardTitle: 'Digital Onboarding Kit',
    wizardSub: 'List your homestay, guide service, or handicrafts in 4 simple steps.',
    step1: '1. Role & Offering',
    step2: '2. Photos & Media',
    step3: '3. Pricing & Details',
    step4: '4. Availability',
    homestay: 'Homestay Host',
    guide: 'Local Guide',
    artisan: 'Artisan / Crafts',
    voiceHint: 'Tap microphone to speak details in your local language',
    listening: 'Listening... (Speak your name & service)',
    addPhotos: 'Add Photos (Click or Drop)',
    photosHint: 'Clear photos increase bookings by 3x',
    priceLabel: 'Price (in ₹)',
    nameLabel: 'Your Business / Offering Name',
    locLabel: 'Location / City',
    descLabel: 'Short Description',
    facilitiesLabel: 'Select Key Facilities / Offerings',
    finishBtn: '🚀 Publish My Listing',
    nextBtn: 'Next Step →',
    prevBtn: '← Back',
  },
  hi: {
    wizardTitle: 'डिजिटल ऑनबोर्डिंग किट',
    wizardSub: '4 आसान चरणों में अपना होमस्टे, गाइड या हस्तकला लिस्ट करें।',
    step1: '१. सेवा का प्रकार',
    step2: '२. फोटो जोड़ें',
    step3: '३. मूल्य एवं विवरण',
    step4: '४. उपलब्धता (कैलेंडर)',
    homestay: 'होमस्टे / आवास',
    guide: 'स्थानीय गाइड',
    artisan: 'हस्तशिल्प / कारीगर',
    voiceHint: 'अपनी भाषा में बोलने के लिए माइक दबाएं',
    listening: 'सुन रहे हैं... (अपना नाम और सेवा बताएं)',
    addPhotos: 'फोटो अपलोड करें (क्लिक करें)',
    photosHint: 'सुंदर फोटो से 3 गुना अधिक यात्री आकर्षित होते हैं',
    priceLabel: 'दर / मूल्य (₹ में)',
    nameLabel: 'आपका या व्यापार का नाम',
    locLabel: 'स्थान / शहर',
    descLabel: 'छोटा विवरण',
    facilitiesLabel: 'सुविधाएं चुनें',
    finishBtn: '🚀 लिस्टिंग प्रकाशित करें',
    nextBtn: 'आगे बढ़ें →',
    prevBtn: '← पीछे',
  },
  raj: {
    wizardTitle: 'डिजिटल जोड़ान किट',
    wizardSub: 'सरल 4 चरणां मां आपणी सेवा जोड़ो।',
    step1: '१. सेवा',
    step2: '२. तस्वीरां',
    step3: '३. भाव व विवरण',
    step4: '४. उपलब्धता',
    homestay: 'होमस्टे',
    guide: 'गाइड',
    artisan: 'दस्तकार / शिल्प',
    voiceHint: 'बोलकर विवरण भरण खातिर माइक दबाओ',
    listening: 'सुण रया हां...',
    addPhotos: 'फोटो जोड़ो',
    photosHint: 'बढ़िया तस्वीरां सूं जादा ग्राहक मिलेला',
    priceLabel: 'भाव (₹)',
    nameLabel: 'नांव',
    locLabel: 'ठिकाणो / शहर',
    descLabel: 'विवरण',
    facilitiesLabel: 'सुविधावां',
    finishBtn: '🚀 प्रकाशित करो',
    nextBtn: 'आगै →',
    prevBtn: '← पाछै',
  },
}

export default function OnboardingWizard({
  initialRole = 'guide',
  onComplete,
  onCancel,
}: OnboardingWizardProps) {
  const { addHomestay, addGuide, addProduct, showToast } = useApp()
  const [lang, setLang] = useState<Lang>('en')
  const [step, setStep] = useState<number>(1)
  const [role, setRole] = useState<'homestay' | 'guide' | 'arts'>(initialRole)

  // Voice recording simulation
  const [isRecording, setIsRecording] = useState(false)
  const [voiceText, setVoiceText] = useState('')

  // Form state
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('Jaipur, Rajasthan')
  const [price, setPrice] = useState('1500')
  const [priceUnit, setPriceUnit] = useState('per day')
  const [description, setDescription] = useState('')
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&h=400&fit=crop&auto=format',
  ])
  const [availableDates, setAvailableDates] = useState<string[]>([
    '2025-08-26', '2025-08-27', '2025-08-28', '2025-08-29', '2025-08-30'
  ])

  const t = translations[lang]

  const facilityOptions: Record<string, { icon: string; label: string }[]> = {
    homestay: [
      { icon: '📶', label: 'WiFi' },
      { icon: '❄️', label: 'AC' },
      { icon: '🍳', label: 'Home Kitchen' },
      { icon: '🌿', label: 'Courtyard Garden' },
      { icon: '☕', label: 'Breakfast Included' },
      { icon: '🚗', label: 'Parking' },
    ],
    guide: [
      { icon: '🗣️', label: 'Hindi' },
      { icon: '🗣️', label: 'English' },
      { icon: '🗣️', label: 'French' },
      { icon: '🏰', label: 'Forts Expert' },
      { icon: '🍛', label: 'Food Walk' },
      { icon: '📷', label: 'Photography' },
    ],
    arts: [
      { icon: '🏺', label: 'Pure Handcrafted' },
      { icon: '🌿', label: 'Natural Colours' },
      { icon: '📦', label: 'Safe Shipping' },
      { icon: '📜', label: 'GI Tag Authenticity' },
    ],
  }

  const handleVoiceInput = () => {
    if (isRecording) {
      setIsRecording(false)
      return
    }
    setIsRecording(true)
    showToast('Listening in your local language... Speak clearly.', 'info')
    setTimeout(() => {
      setIsRecording(false)
      const mockResult =
        role === 'homestay'
          ? 'Heritage Haveli with traditional Rajasthani courtyard and home-cooked organic food.'
          : role === 'guide'
          ? 'Senior Jaipur heritage guide with 10 years experience covering Amber Fort and City Palace.'
          : 'Authentic handmade blue pottery crafted with natural quartz glaze in Sanganer.'
      setDescription(mockResult)
      setVoiceText(mockResult)
      showToast('Voice recorded & auto-filled successfully! 🎙️', 'success')
    }, 2800)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      try {
        const { api } = await import('../services/api')
        const uploaded = await api.upload.uploadFile(file)
        setImages((prev) => [...prev, uploaded.url])
      } catch {
        const reader = new FileReader()
        reader.onload = (uploadEvent) => {
          if (uploadEvent.target?.result) {
            setImages((prev) => [...prev, uploadEvent.target!.result as string])
          }
        }
        reader.readAsDataURL(file)
      }
    }
    showToast('Photo(s) added to your listing preview!', 'success')
  }

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  const toggleFacility = (label: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]
    )
  }

  const handleSubmit = () => {
    const finalTitle = title || (role === 'homestay' ? 'Chhavi Heritage Homestay' : role === 'guide' ? 'Rajputana Heritage Guide' : 'Handmade Blue Pottery Art')
    const finalDesc = description || (role === 'homestay' ? 'Comfortable stay with local hospitality.' : 'Authentic local tour experience.')

    if (role === 'homestay') {
      addHomestay({
        name: finalTitle,
        image: images[0] || 'https://images.unsplash.com/photo-1643474003587-8bbf4bbc01d9?w=600&h=400&fit=crop&auto=format',
        rating: 5.0,
        location,
        priceNumber: Number(price) || 2500,
        price: `₹${Number(price) || 2500}`,
        available: true,
        description: finalDesc,
        facilities: selectedFacilities.length > 0 ? selectedFacilities : ['WiFi', 'Home Kitchen', 'Heritage Tour'],
        contactImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format',
        hostName: 'Local Host',
        availableDates,
      })
    } else if (role === 'guide') {
      addGuide({
        name: finalTitle,
        photo: images[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format',
        verified: true,
        rating: 5.0,
        location,
        languages: selectedFacilities.length > 0 ? selectedFacilities : ['Hindi', 'English'],
        speciality: 'Cultural & Heritage Tours',
        places: ['Amber Fort', 'City Palace', 'Old City'],
        priceNumber: Number(price) || 1500,
        price: `₹${Number(price) || 1500}`,
        priceUnit,
        available: true,
        tours: 1,
        availableDates,
      })
    } else {
      addProduct({
        name: finalTitle,
        image: images[0] || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop&auto=format',
        priceNumber: Number(price) || 950,
        price: `₹${Number(price) || 950}`,
        rating: 5.0,
        material: 'Authentic Local Material',
        durability: '10+ years',
        category: 'Handicrafts',
        seller: finalTitle,
        location,
        contact: '+91 98765 43210',
        stock: 10,
      })
    }

    onComplete?.()
  }

  return (
    <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(20,27,24,0.12)] border border-[#E4E7E5] overflow-hidden max-w-3xl mx-auto">
      {/* Header with Language Selector & Voice */}
      <div className="bg-[#0F6E5C] text-white p-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">✨</span>
              <h3 className="text-xl font-700" style={{ fontFamily: 'Fraunces, serif' }}>
                {t.wizardTitle}
              </h3>
            </div>
            <p className="text-white/80 text-xs">{t.wizardSub}</p>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-2xl p-1 border border-white/20">
            {(['en', 'hi', 'raj'] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 rounded-xl text-xs font-700 transition-all ${
                  lang === l ? 'bg-white text-[#0F6E5C] shadow-sm' : 'text-white hover:bg-white/10'
                }`}
              >
                {l === 'en' ? 'English' : l === 'hi' ? 'हिन्दी' : 'राजस्थानी'}
              </button>
            ))}
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="mt-6 flex items-center justify-between gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="flex-1 flex flex-col items-center gap-1 cursor-pointer"
              onClick={() => setStep(s)}
            >
              <div
                className={`w-full h-2 rounded-full transition-all ${
                  step >= s ? 'bg-[#E0762F]' : 'bg-white/25'
                }`}
              />
              <span className="text-[10px] font-600 text-white/90">
                {s === 1 ? t.step1.split(' ')[1] : s === 2 ? t.step2.split(' ')[1] : s === 3 ? t.step3.split(' ')[1] : t.step4.split(' ')[1]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 md:p-8 space-y-6">
        {/* Step 1: Role Selection & Type */}
        {step === 1 && (
          <div className="space-y-6 slide-up">
            <h4 className="font-700 text-lg text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
              {t.step1}: Select What You Want to Offer
            </h4>

            {/* 3 Large Role Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'homestay', icon: '🏡', title: t.homestay, desc: 'Rooms, Haveli, Villa' },
                { id: 'guide', icon: '🧑‍🤝‍🧑', title: t.guide, desc: 'Heritage, Forts, Food Trails' },
                { id: 'arts', icon: '🎨', title: t.artisan, desc: 'Pottery, Textiles, Paintings' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id as any)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between ${
                    role === item.id
                      ? 'border-[#0F6E5C] bg-[#E4F3EF] shadow-md scale-[1.02]'
                      : 'border-[#E4E7E5] hover:border-[#0F6E5C]/40 bg-white'
                  }`}
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <div>
                    <p className="font-700 text-[#141B18] text-base mb-1">{item.title}</p>
                    <p className="text-xs text-[#7B8582]">{item.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#E4E7E5]/60 flex items-center justify-between text-xs font-600">
                    <span className={role === item.id ? 'text-[#0F6E5C]' : 'text-[#7B8582]'}>
                      {role === item.id ? '✓ Selected' : 'Select'}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-700 text-[#141B18] mb-1.5">
                  🏷️ {t.nameLabel}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={role === 'homestay' ? 'e.g. Rajwada Heritage Stay' : role === 'guide' ? 'e.g. Forts & History Guide' : 'e.g. Sanganeri Block Prints'}
                  className="w-full h-11 px-4 rounded-xl border border-[#E4E7E5] text-sm focus:outline-none focus:border-[#0F6E5C] focus:ring-2 focus:ring-[#0F6E5C]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-700 text-[#141B18] mb-1.5">
                  📍 {t.locLabel}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Jaipur, Rajasthan"
                  className="w-full h-11 px-4 rounded-xl border border-[#E4E7E5] text-sm focus:outline-none focus:border-[#0F6E5C] focus:ring-2 focus:ring-[#0F6E5C]/15"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Photos & Voice Input */}
        {step === 2 && (
          <div className="space-y-6 slide-up">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-700 text-lg text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                  {t.step2}: Upload Photos & Voice Info
                </h4>
                <p className="text-xs text-[#7B8582] mt-0.5">{t.photosHint}</p>
              </div>

              {/* Voice Input Button */}
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-700 transition-all ${
                  isRecording
                    ? 'bg-[#D64545] text-white animate-pulse shadow-md'
                    : 'bg-[#FBEADD] text-[#E0762F] hover:bg-[#E0762F] hover:text-white'
                }`}
              >
                <span>{isRecording ? '⏹️' : '🎙️'}</span>
                <span>{isRecording ? t.listening : t.voiceHint}</span>
              </button>
            </div>

            {/* Voice Transcript Display if any */}
            {voiceText && (
              <div className="p-3.5 bg-[#E4F3EF] rounded-2xl border border-[#0F6E5C]/30 flex items-start gap-2.5">
                <span className="text-lg">🎙️</span>
                <div className="flex-1 text-xs">
                  <p className="font-700 text-[#0F6E5C] mb-0.5">Voice Transcription Auto-filled:</p>
                  <p className="text-[#141B18] leading-relaxed italic">"{voiceText}"</p>
                </div>
              </div>
            )}

            {/* Photo Upload Zone */}
            <div>
              <label className="block text-xs font-700 text-[#141B18] mb-2">
                📷 {t.addPhotos}
              </label>

              <label className="border-2 border-dashed border-[#0F6E5C]/40 hover:border-[#0F6E5C] hover:bg-[#E4F3EF]/30 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#FAFAF8]">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="text-4xl mb-2">📸</span>
                <p className="text-sm font-700 text-[#0F6E5C]">Click to choose photos from phone/computer</p>
                <p className="text-xs text-[#7B8582] mt-1">PNG, JPG, WEBP up to 10MB</p>
              </label>
            </div>

            {/* Photo Previews */}
            {images.length > 0 && (
              <div>
                <p className="text-xs font-700 text-[#7B8582] mb-2">Uploaded Previews ({images.length})</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden h-28 border border-[#E4E7E5] shadow-sm">
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-[#D64545] text-white text-xs flex items-center justify-center transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Structured Pricing & Facilities */}
        {step === 3 && (
          <div className="space-y-6 slide-up">
            <h4 className="font-700 text-lg text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
              {t.step3}: Pricing & Key Offerings
            </h4>

            {/* Structured Pricing */}
            <div className="bg-[#FAFAF8] p-5 rounded-2xl border border-[#E4E7E5] space-y-4">
              <label className="block text-xs font-700 text-[#141B18]">
                💰 {t.priceLabel}
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-700 text-lg text-[#0F6E5C]">₹</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full h-12 pl-9 pr-4 rounded-xl border border-[#E4E7E5] bg-white text-lg font-800 text-[#141B18] focus:outline-none focus:border-[#0F6E5C]"
                  />
                </div>
                <select
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value)}
                  className="h-12 px-4 rounded-xl border border-[#E4E7E5] bg-white text-sm font-600 text-[#141B18] focus:outline-none"
                >
                  <option value="per day">/ per day</option>
                  <option value="per night">/ per night</option>
                  <option value="per tour">/ per tour</option>
                  <option value="per piece">/ per item</option>
                </select>
              </div>
            </div>

            {/* Facilities / Tags */}
            <div>
              <label className="block text-xs font-700 text-[#141B18] mb-2.5">
                ✨ {t.facilitiesLabel}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(facilityOptions[role] || []).map((f) => {
                  const isChecked = selectedFacilities.includes(f.label)
                  return (
                    <button
                      key={f.label}
                      type="button"
                      onClick={() => toggleFacility(f.label)}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all text-xs font-600 ${
                        isChecked
                          ? 'border-[#0F6E5C] bg-[#E4F3EF] text-[#0F6E5C]'
                          : 'border-[#E4E7E5] bg-white text-[#4B5551] hover:bg-[#F7F6F2]'
                      }`}
                    >
                      <span className="text-lg">{f.icon}</span>
                      <span>{f.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-xs font-700 text-[#141B18] mb-1.5">
                📝 {t.descLabel}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share more details about your hospitality, history, or crafts..."
                className="w-full h-24 p-3.5 rounded-xl border border-[#E4E7E5] text-sm text-[#141B18] focus:outline-none focus:border-[#0F6E5C]"
              />
            </div>
          </div>
        )}

        {/* Step 4: Availability Calendar */}
        {step === 4 && (
          <div className="space-y-6 slide-up">
            <h4 className="font-700 text-lg text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
              {t.step4}: Set Available Dates on Calendar
            </h4>
            <p className="text-xs text-[#7B8582]">
              Tap dates on the calendar to mark when you are available to host tourists or conduct tours.
            </p>

            <AvailabilityCalendar
              selectedDates={availableDates}
              onDatesChange={setAvailableDates}
            />
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="pt-6 border-t border-[#E4E7E5] flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="h-11 px-5 rounded-xl border border-[#E4E7E5] text-[#141B18] font-600 text-sm hover:bg-[#F7F6F2] transition-colors"
            >
              {t.prevBtn}
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="h-11 px-5 rounded-xl text-[#7B8582] font-600 text-sm hover:text-[#141B18] transition-colors"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="h-11 px-7 rounded-xl bg-[#0F6E5C] text-white font-600 text-sm hover:bg-[#0B5849] transition-all shadow-md"
            >
              {t.nextBtn}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="h-11 px-8 rounded-xl bg-[#E0762F] text-white font-700 text-sm hover:bg-[#c9682a] transition-all shadow-[0_4px_14px_rgba(224,118,47,0.35)] active:scale-[0.98]"
            >
              {t.finishBtn}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
