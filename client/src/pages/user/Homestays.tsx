import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import ChatPanel, { type ChatContact } from '../../components/ChatPanel'
import Modal from '../../components/ui/Modal'
import CommunicationModal from '../../components/CommunicationModal'
import { matchesDestination } from '../../services/locationService'
import type { HomestayListing } from '../../data/mockStore'
import { MessageSquare, Mail, Smartphone, Sparkles, CheckCircle, Shield, Home } from 'lucide-react'

interface HomestaysProps {
  onGoToBookings?: () => void
}

export default function Homestays({ onGoToBookings }: HomestaysProps) {
  const { homestays = [], activeLocation, createBookingRequest, showToast, currentUser } = useApp()
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null)
  const [search, setSearch] = useState('')
  const [bookingHomestay, setBookingHomestay] = useState<HomestayListing | null>(null)

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('2025-08-26')
  const [guests, setGuests] = useState(2)
  const [message, setMessage] = useState('')
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false)

  // Multi-Channel Communication Modal State
  const [commModalOpen, setCommModalOpen] = useState(false)
  const [commChannel, setCommChannel] = useState<'whatsapp' | 'email' | 'sms'>('whatsapp')
  const [commSubject, setCommSubject] = useState('')
  const [commMessage, setCommMessage] = useState('')

  // Filter homestays strictly by active destination
  const destinationStays = homestays.filter((h) => matchesDestination(h.location, activeLocation.city))

  // Fallback stays if a new destination is selected
  const availableStays: HomestayListing[] = destinationStays.length > 0 ? destinationStays : [
    {
      id: 'stay-dyn-1',
      name: `${activeLocation.city} Traditional Heritage Haveli`,
      location: `Old Heritage Quarter, ${activeLocation.city}`,
      price: '₹2,400',
      rating: 4.9,
      reviews: 48,
      description: `Authentic ancestral home with traditional courtyard, homemade regional cuisine, and personalized cultural walking tips.`,
      facilities: ['Free WiFi', 'Traditional Breakfast', 'AC Courtyard', 'Cultural Guide'],
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&h=400&fit=crop&auto=format',
      hostName: 'Devendra Singh',
      hostPhone: '+91 98765 11223',
      available: true,
      category: 'Heritage Haveli',
    },
    {
      id: 'stay-dyn-2',
      name: `${activeLocation.city} Eco Retreat & Garden Stay`,
      location: `Green Foothills, ${activeLocation.city}`,
      price: '₹1,850',
      rating: 4.8,
      reviews: 32,
      description: `Organic farmstay managed by a local self-help group family. Clay pottery workshops and fresh farm-to-table dining included.`,
      facilities: ['Organic Meals', 'Pottery Workshop', 'Garden View', 'Solar Hot Water'],
      image: 'https://images.unsplash.com/photo-1643474003587-8bbf4bbc01d9?w=600&h=400&fit=crop&auto=format',
      hostName: 'Sunita Devi (SHG Lead)',
      hostPhone: '+91 98765 44556',
      available: true,
      category: 'Eco Farmstay',
    },
    {
      id: 'stay-dyn-3',
      name: `${activeLocation.city} Royal View Courtyard Home`,
      location: `Fort Road, ${activeLocation.city}`,
      price: '₹3,200',
      rating: 4.95,
      reviews: 64,
      description: `Spacious heritage suite overlooking historic monuments with rooftop folk music evenings and artisanal chai sessions.`,
      facilities: ['Rooftop View', 'Folk Music', 'AC Suite', 'Airport Pickup'],
      image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600&h=400&fit=crop&auto=format',
      hostName: 'Mahipal Rathore',
      hostPhone: '+91 98765 77889',
      available: true,
      category: 'Boutique Homestay',
    },
  ]

  const filtered = availableStays.filter((h) => {
    const q = search.toLowerCase()
    return (
      !q ||
      h.name.toLowerCase().includes(q) ||
      h.location.toLowerCase().includes(q) ||
      h.description.toLowerCase().includes(q)
    )
  })

  function handleDirectContact(channel: 'whatsapp' | 'email' | 'sms', h: HomestayListing) {
    const text = `Namaste ${h.hostName || 'Host'}! I found "${h.name}" on YatraSetu (${activeLocation.displayName}). I would like to inquire about room availability for 2 guests. Rate: ${h.price}/night.`
    setCommChannel(channel)
    setCommSubject(`Booking Inquiry for ${h.name} [YatraSetu]`)
    setCommMessage(text)
    setCommModalOpen(true)
  }

  function handleChat(h: HomestayListing) {
    setSelectedContact({
      id: h.id,
      name: h.hostName || h.name,
      image: h.contactImg || h.image,
      role: `Homestay Host · ${h.name}`,
      online: h.available,
    })
  }

  function handleOpenBooking(h: HomestayListing) {
    setBookingHomestay(h)
    setBookingDate(h.availableDates?.[0] || '2025-08-26')
    setGuests(2)
    setMessage('')
  }

  async function handleConfirmBooking(e: React.FormEvent) {
    e.preventDefault()
    if (!bookingHomestay) return

    setIsSubmittingBooking(true)
    try {
      await createBookingRequest({
        homestayId: bookingHomestay.id,
        homestayName: bookingHomestay.name,
        userId: currentUser?.id || 'usr-tourist-1',
        userName: currentUser?.name || 'Aarav Sharma',
        date: bookingDate,
        guests,
        totalPrice: bookingHomestay.price,
        message: message || 'Direct booking through YatraSetu grassroots ecosystem.',
      })

      showToast(`Booking request submitted for ${bookingHomestay.name}!`, 'success')
      setBookingHomestay(null)
      if (onGoToBookings) onGoToBookings()
    } catch (err: any) {
      showToast(err.message || 'Failed to submit booking request.', 'error')
    } finally {
      setIsSubmittingBooking(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E4E7E5] shadow-xs">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search homestays in ${activeLocation.city}...`}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#F7F6F2] border border-[#E4E7E5] text-xs focus:outline-hidden focus:border-[#0F6E5C]"
          />
          <span className="absolute left-3 top-2.5 text-sm text-[#7B8582]">🔍</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-700 text-[#0F6E5C]">
          <span className="px-3 py-1.5 rounded-xl bg-[#E4F3EF]">
            🏡 {filtered.length} Authentic Stays in {activeLocation.city}
          </span>
        </div>
      </div>

      {/* Homestays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((h) => (
          <div
            key={h.id}
            className="bg-white rounded-2xl border border-[#E4E7E5] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Image Container */}
              <div className="h-48 relative overflow-hidden bg-[#F7F6F2]">
                <img
                  src={h.image}
                  alt={h.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] font-800">
                    {h.category || 'Heritage Homestay'}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-[#E4F7EC] text-[#0F5A31] text-[10px] font-800 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>NIDHI Verified</span>
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-xs font-800">
                  ★ {h.rating} ({h.reviews} reviews)
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-2.5">
                <div className="space-y-1">
                  <h3 className="font-800 text-base text-[#141B18] group-hover:text-[#0F6E5C] transition-colors" style={{ fontFamily: 'Fraunces, serif' }}>
                    {h.name}
                  </h3>
                  <p className="text-xs text-[#0F6E5C] font-600">📍 {h.location}</p>
                </div>

                <p className="text-xs text-[#505D58] leading-relaxed line-clamp-2">
                  {h.description}
                </p>

                {/* Host Story snippet */}
                <div className="p-2.5 rounded-xl bg-[#F7F6F2] text-[11px] text-[#505D58] flex items-center gap-2">
                  <span className="text-base">👤</span>
                  <span className="truncate">Host: <strong>{h.hostName || 'Local Family'}</strong></span>
                </div>

                {/* Facilities */}
                <div className="flex flex-wrap gap-1">
                  {h.facilities.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="text-[10px] bg-[#E4F3EF] text-[#0F6E5C] rounded-md px-2 py-0.5 font-700"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer: Price + Multi-Channel Actions */}
            <div className="p-5 pt-3 border-t border-[#E4E7E5] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#7B8582] block uppercase font-700">Nightly Rate</span>
                  <span className="text-lg font-900 text-[#0F6E5C]">{h.price}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenBooking(h)}
                  className="px-4 py-2 rounded-xl bg-[#0F6E5C] hover:bg-[#0A4E42] text-white text-xs font-800 transition-all shadow-xs cursor-pointer"
                >
                  📅 Book Stay
                </button>
              </div>

              {/* Direct Multi-Channel Dispatch Row */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleDirectContact('whatsapp', h)}
                  className="py-1.5 px-2 rounded-lg bg-[#E4F7EC] hover:bg-[#25D366] hover:text-white text-[#0F5A31] text-[11px] font-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="WhatsApp Direct Inquiry"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectContact('email', h)}
                  className="py-1.5 px-2 rounded-lg bg-[#FDE8E8] hover:bg-[#EA4335] hover:text-white text-[#9B1C1C] text-[11px] font-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Google Gmail Compose"
                >
                  <Mail className="w-3 h-3" />
                  <span>Gmail</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectContact('sms', h)}
                  className="py-1.5 px-2 rounded-lg bg-[#FEF3C7] hover:bg-[#D89A1C] hover:text-white text-[#92400E] text-[11px] font-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Phone SMS Inquiry"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>SMS</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Side Chat Panel Drawer */}
      {selectedContact && (
        <div className="fixed bottom-4 right-4 z-50 w-96 max-w-full shadow-2xl">
          <ChatPanel
            contact={selectedContact}
            onClose={() => setSelectedContact(null)}
            suggestedQuestions={[
              'Are authentic home-cooked meals included?',
              'Is parking space available?',
              'Can you arrange an evening rooftop cultural storytelling session?',
            ]}
          />
        </div>
      )}

      {/* Interactive Booking Modal */}
      {bookingHomestay && (
        <Modal
          isOpen={true}
          onClose={() => setBookingHomestay(null)}
          title={`Book ${bookingHomestay.name}`}
          subtitle={`Direct inquiry with host ${bookingHomestay.hostName || 'Host'} in ${bookingHomestay.location}`}
          icon="🏠"
          maxWidth="lg"
        >
          <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
            <div className="bg-[#F7F6F2] p-4 rounded-xl border border-[#E4E7E5] flex items-center justify-between">
              <div>
                <p className="font-800 text-[#141B18] text-sm">{bookingHomestay.name}</p>
                <p className="text-[#0F6E5C] font-700">Rate: {bookingHomestay.price} / night</p>
              </div>
              <span className="text-[10px] bg-[#E4F7EC] text-[#0F5A31] px-2.5 py-1 rounded-full font-800">
                100% NIDHI Verified
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-700 text-[#141B18] mb-1">Check-in Date *</label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E4E7E5] bg-white text-xs text-[#141B18]"
                />
              </div>

              <div>
                <label className="block font-700 text-[#141B18] mb-1">Number of Guests *</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-[#E4E7E5] bg-white text-xs font-600"
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests (Standard)</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4+ Family Group</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-700 text-[#141B18] mb-1">Special Requests or Dietary Preferences</label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Vegetarian dinner request, early morning chai, late check-in..."
                className="w-full p-3 rounded-xl border border-[#E4E7E5] bg-white text-xs"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#E4F3EF] text-[11px] text-[#0F6E5C] font-600 flex items-center gap-2">
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span>Direct Booking Ledger: 92.4% of your payment goes directly to the local family.</span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E4E7E5]">
              <button
                type="button"
                onClick={() => setBookingHomestay(null)}
                className="px-4 py-2 rounded-xl text-xs font-700 text-[#7B8582] hover:bg-[#F7F6F2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingBooking}
                className="px-6 py-2 rounded-xl bg-[#0F6E5C] text-white font-800 text-xs hover:bg-[#0A4E42] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {isSubmittingBooking ? 'Submitting...' : 'Confirm & Request Booking'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Multi-Channel Communication Modal */}
      <CommunicationModal
        isOpen={commModalOpen}
        onClose={() => setCommModalOpen(false)}
        defaultChannel={commChannel}
        defaultSubject={commSubject}
        defaultMessage={commMessage}
        contextTitle="Homestay Host Inquiry Dispatcher"
      />
    </div>
  )
}
