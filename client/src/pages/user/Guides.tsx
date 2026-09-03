import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import ChatPanel, { type ChatContact } from '../../components/ChatPanel'
import Modal from '../../components/ui/Modal'
import CommunicationModal from '../../components/CommunicationModal'
import { matchesDestination } from '../../services/locationService'
import type { GuideListing } from '../../data/mockStore'
import { MessageSquare, Mail, Smartphone, CheckCircle, Award, Compass } from 'lucide-react'

interface GuidesProps {
  onGoToBookings?: () => void
}

export default function Guides({ onGoToBookings }: GuidesProps) {
  const { guides = [], activeLocation, createBookingRequest, showToast, currentUser } = useApp()
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null)
  const [search, setSearch] = useState('')
  const [bookingGuide, setBookingGuide] = useState<GuideListing | null>(null)

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

  // Filter guides strictly by active destination
  const destinationGuides = guides.filter((g) => matchesDestination(g.location, activeLocation.city))

  const availableGuides: GuideListing[] = destinationGuides.length > 0 ? destinationGuides : [
    {
      id: 'guide-dyn-1',
      name: `Pt. Rajesh Joshi`,
      speciality: 'Temple Architecture & Vedic Epigraphy',
      experience: '14 years',
      languages: ['Hindi', 'English', 'Sanskrit', 'Marwari'],
      price: '₹1,500/day',
      rating: 4.96,
      reviews: 82,
      places: [`${activeLocation.city} Historic Core`, 'Old Temples', 'Astronomical Sights'],
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&auto=format',
      available: true,
      location: activeLocation.displayName,
      certified: true,
      bio: 'Licensed heritage guide specializing in Rajputana & Maratha architecture, royal manuscripts, and secret stepwell legends.',
    },
    {
      id: 'guide-dyn-2',
      name: `Kavita Rathore`,
      speciality: 'Culinary Trails & Royal Spice Lore',
      experience: '8 years',
      languages: ['Hindi', 'English', 'French'],
      price: '₹1,200/day',
      rating: 4.9,
      reviews: 54,
      places: ['Bazaars', 'Heritage Kitchens', 'Night Food Street'],
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&auto=format',
      available: true,
      location: activeLocation.displayName,
      certified: true,
      bio: 'Passionate storyteller taking travelers into 100-year-old culinary families, tea blenders, and traditional halwais.',
    },
  ]

  const filtered = availableGuides.filter((g) => {
    const q = search.toLowerCase()
    return (
      !q ||
      g.name.toLowerCase().includes(q) ||
      g.speciality.toLowerCase().includes(q) ||
      g.languages.some((l) => l.toLowerCase().includes(q))
    )
  })

  function handleDirectContact(channel: 'whatsapp' | 'email' | 'sms', g: GuideListing) {
    const text = `Namaste ${g.name}! I found your profile on YatraSetu (${activeLocation.displayName}). I would like to book a private walking tour (${g.speciality}) for 2 travelers. Rate: ${g.price}.`
    setCommChannel(channel)
    setCommSubject(`Tour Guide Booking Inquiry for ${g.name} [YatraSetu]`)
    setCommMessage(text)
    setCommModalOpen(true)
  }

  function handleChat(g: GuideListing) {
    setSelectedContact({
      id: g.id,
      name: g.name,
      image: g.photo,
      role: `Local Guide · ${g.speciality}`,
      online: g.available,
    })
  }

  function handleOpenBooking(g: GuideListing) {
    setBookingGuide(g)
    setBookingDate(g.availableDates?.[0] || '2025-08-26')
    setGuests(2)
    setMessage('')
  }

  async function handleConfirmBooking(e: React.FormEvent) {
    e.preventDefault()
    if (!bookingGuide) return

    setIsSubmittingBooking(true)
    try {
      await createBookingRequest({
        guideId: bookingGuide.id,
        guideName: bookingGuide.name,
        userId: currentUser?.id || 'usr-tourist-1',
        userName: currentUser?.name || 'Aarav Sharma',
        date: bookingDate,
        guests,
        totalPrice: bookingGuide.price,
        message: message || 'Tour booking through YatraSetu grassroots guide network.',
      })

      showToast(`Tour booking requested with ${bookingGuide.name}!`, 'success')
      setBookingGuide(null)
      if (onGoToBookings) onGoToBookings()
    } catch (err: any) {
      showToast(err.message || 'Failed to request tour.', 'error')
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
            placeholder={`Search guides by language or speciality in ${activeLocation.city}...`}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#F7F6F2] border border-[#E4E7E5] text-xs focus:outline-hidden focus:border-[#0F6E5C]"
          />
          <span className="absolute left-3 top-2.5 text-sm text-[#7B8582]">🔍</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-700 text-[#0F6E5C]">
          <span className="px-3 py-1.5 rounded-xl bg-[#E4F3EF]">
            🧑‍🤝‍🧑 {filtered.length} Certified Storyteller Guides in {activeLocation.city}
          </span>
        </div>
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((g) => (
          <div
            key={g.id}
            className="bg-white rounded-2xl border border-[#E4E7E5] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="p-5 space-y-3">
              {/* Header: Photo + Info */}
              <div className="flex items-start gap-3.5">
                <img
                  src={g.photo}
                  alt={g.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#0F6E5C]/20 shadow-xs flex-shrink-0"
                />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-800 text-base text-[#141B18] group-hover:text-[#0F6E5C] transition-colors" style={{ fontFamily: 'Fraunces, serif' }}>
                      {g.name}
                    </h3>
                    <span className="text-xs font-800 text-[#D89A1C]">★ {g.rating}</span>
                  </div>
                  <p className="text-xs font-700 text-[#0F6E5C]">{g.speciality}</p>
                  <p className="text-[11px] text-[#7B8582]">
                    {g.experience} Exp • {g.reviews} Tours conducted
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#505D58] leading-relaxed line-clamp-2">
                {g.bio}
              </p>

              {/* Languages */}
              <div className="flex flex-wrap gap-1">
                {g.languages.map((l) => (
                  <span
                    key={l}
                    className="text-[10px] bg-[#F7F6F2] text-[#505D58] border border-[#E4E7E5] rounded-md px-2 py-0.5 font-600"
                  >
                    🗣️ {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 pt-3 border-t border-[#E4E7E5] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#7B8582] block uppercase font-700">Guide Rate</span>
                  <span className="text-lg font-900 text-[#0F6E5C]">{g.price}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenBooking(g)}
                  className="px-4 py-2 rounded-xl bg-[#0F6E5C] hover:bg-[#0A4E42] text-white text-xs font-800 transition-all shadow-xs cursor-pointer"
                >
                  🧑‍🤝‍🧑 Book Tour
                </button>
              </div>

              {/* Multi-Channel Dispatch Row */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleDirectContact('whatsapp', g)}
                  className="py-1.5 px-2 rounded-lg bg-[#E4F7EC] hover:bg-[#25D366] hover:text-white text-[#0F5A31] text-[11px] font-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="WhatsApp Direct Inquiry"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectContact('email', g)}
                  className="py-1.5 px-2 rounded-lg bg-[#FDE8E8] hover:bg-[#EA4335] hover:text-white text-[#9B1C1C] text-[11px] font-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Gmail Compose"
                >
                  <Mail className="w-3 h-3" />
                  <span>Gmail</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectContact('sms', g)}
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
              'Can we customize the walking tour route?',
              'Do you provide audio headsets for the tour?',
              'Are early morning tours available to beat the crowd?',
            ]}
          />
        </div>
      )}

      {/* Tour Booking Modal */}
      {bookingGuide && (
        <Modal
          isOpen={true}
          onClose={() => setBookingGuide(null)}
          title={`Book Tour with ${bookingGuide.name}`}
          subtitle={`Licensed guide for ${bookingGuide.speciality} in ${activeLocation.displayName}`}
          icon="🧑‍🤝‍🧑"
          maxWidth="lg"
        >
          <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
            <div className="bg-[#F7F6F2] p-4 rounded-xl border border-[#E4E7E5] flex items-center justify-between">
              <div>
                <p className="font-800 text-[#141B18] text-sm">{bookingGuide.name}</p>
                <p className="text-[#0F6E5C] font-700">Daily Fee: {bookingGuide.price}</p>
              </div>
              <span className="text-[10px] bg-[#E4F7EC] text-[#0F5A31] px-2.5 py-1 rounded-full font-800">
                ✓ Ministry Verified
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-700 text-[#141B18] mb-1">Tour Date *</label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E4E7E5] bg-white text-xs text-[#141B18]"
                />
              </div>

              <div>
                <label className="block font-700 text-[#141B18] mb-1">Group Size *</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-[#E4E7E5] bg-white text-xs font-600"
                >
                  <option value={1}>1 Solo Explorer</option>
                  <option value={2}>2 Persons (Couple / Friends)</option>
                  <option value={4}>4 Persons (Small Group)</option>
                  <option value={8}>8+ Family Delegation</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-700 text-[#141B18] mb-1">Customization Requests</label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Focus heavily on ancient temple stepwells, photography stops..."
                className="w-full p-3 rounded-xl border border-[#E4E7E5] bg-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E4E7E5]">
              <button
                type="button"
                onClick={() => setBookingGuide(null)}
                className="px-4 py-2 rounded-xl text-xs font-700 text-[#7B8582] hover:bg-[#F7F6F2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingBooking}
                className="px-6 py-2 rounded-xl bg-[#0F6E5C] text-white font-800 text-xs hover:bg-[#0A4E42] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {isSubmittingBooking ? 'Submitting...' : 'Confirm Tour Request'}
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
        contextTitle="Local Guide Inquiry Dispatcher"
      />
    </div>
  )
}
