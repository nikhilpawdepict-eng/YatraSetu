import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import ChatPanel, { type ChatContact } from '../../components/ChatPanel'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { matchesDestination } from '../../services/locationService'
import type { GuideListing } from '../../data/mockStore'

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

  // Filter guides strictly by active destination
  const destinationGuides = guides.filter((g) => matchesDestination(g.location, activeLocation.city))

  const filtered = destinationGuides.filter((g) => {
    const q = search.toLowerCase()
    return (
      !q ||
      g.name.toLowerCase().includes(q) ||
      g.speciality.toLowerCase().includes(q) ||
      g.location.toLowerCase().includes(q) ||
      g.languages.some((l) => l.toLowerCase().includes(q)) ||
      g.places.some((p) => p.toLowerCase().includes(q))
    )
  })

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
        serviceId: bookingGuide.id,
        serviceName: `${bookingGuide.name} - ${bookingGuide.speciality}`,
        serviceType: 'Guide Tour',
        userId: currentUser?.id || 'usr_tourist_demo',
        userName: currentUser?.name || 'Aarav Sharma',
        userLocation: currentUser?.location || activeLocation.displayName,
        userAvatar: currentUser?.avatar || '👤',
        date: bookingDate,
        guests: Number(guests),
        price: bookingGuide.price,
        message: message.trim() || `Guided tour inquiry for ${guests} guests on ${bookingDate}`,
      })

      setBookingGuide(null)
      showToast(`Tour inquiry sent to ${bookingGuide.name}!`, 'success')
      if (onGoToBookings) {
        onGoToBookings()
      }
    } catch {
      showToast('Could not submit booking request. Please try again.', 'error')
    } finally {
      setIsSubmittingBooking(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* Guides Catalog */}
      <div className="flex-1 space-y-4">
        {/* Search & Filter bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E4E7E5] shadow-xs flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#7B8582]">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search verified guides in ${activeLocation.city} by language, speciality...`}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#E4E7E5] text-xs text-[#141B18] placeholder-[#7B8582] focus:outline-none focus:border-[#0F6E5C]"
            />
          </div>
          <span className="text-xs font-700 text-[#0F6E5C] bg-[#E4F3EF] px-3 py-2 rounded-xl whitespace-nowrap">
            {filtered.length} {filtered.length === 1 ? 'Guide' : 'Guides'} in {activeLocation.city}
          </span>
        </div>

        {/* Listings Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="🧑‍🤝‍🧑"
            title={`No Verified Guides in ${activeLocation.city} Yet`}
            description={`No certified cultural or heritage guides have completed identity verification in ${activeLocation.displayName} yet. As local guides onboard, their profiles and tour itineraries will appear here.`}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((g) => (
              <div
                key={g.id}
                className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(20,27,24,0.06)] overflow-hidden border border-[#E4E7E5] hover:shadow-[0_8px_28px_rgba(20,27,24,0.10)] hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">
                  {/* Header row */}
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={g.photo}
                        alt={g.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-[#E4E7E5] group-hover:border-[#0F6E5C] transition-colors"
                      />
                      {g.verified && (
                        <span
                          className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0F6E5C] text-white rounded-full flex items-center justify-center text-[10px] shadow-xs"
                          title="Verified Guide"
                        >
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-700 text-[#141B18] text-base truncate" style={{ fontFamily: 'Fraunces, serif' }}>
                          {g.name}
                        </h3>
                        <div className="flex items-center gap-1 bg-[#FBF1DA] text-[#D89A1C] px-2 py-0.5 rounded-full text-xs font-700 flex-shrink-0">
                          <span>★</span>
                          <span>{g.rating}</span>
                        </div>
                      </div>

                      <p className="text-xs font-600 text-[#0F6E5C] mt-0.5">{g.speciality}</p>
                      <p className="text-xs text-[#7B8582]">📍 {g.location} · {g.tours} tours completed</p>
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <span className="text-[10px] text-[#7B8582] font-700 uppercase tracking-wide block mb-1">
                      Languages Spoken
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {g.languages.map((l) => (
                        <span
                          key={l}
                          className="text-[10px] bg-[#E4F3EF] text-[#0F6E5C] font-600 rounded-full px-2 py-0.5"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Heritage Places Covered */}
                  <div>
                    <span className="text-[10px] text-[#7B8582] font-700 uppercase tracking-wide block mb-1">
                      Key Highlights Covered
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {g.places.map((p) => (
                        <span
                          key={p}
                          className="text-[10px] bg-[#F7F6F2] text-[#4B5551] rounded-full px-2 py-0.5 border border-[#E4E7E5]"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing & Action */}
                <div className="p-4 pt-2 border-t border-[#E4E7E5] flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-[#7B8582] block">Tour Rate</span>
                    <span className="text-base font-800 text-[#0F6E5C]">{g.price}</span>
                    <span className="text-[10px] text-[#7B8582] ml-1">/{g.priceUnit || 'day'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleChat(g)}
                      className="h-9 px-3 rounded-xl border border-[#0F6E5C]/30 text-[#0F6E5C] hover:bg-[#E4F3EF] text-xs font-700 transition-all cursor-pointer"
                    >
                      💬 Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenBooking(g)}
                      disabled={!g.available}
                      className="h-9 px-4 rounded-xl bg-[#0F6E5C] text-white hover:bg-[#0B5849] disabled:opacity-50 text-xs font-700 transition-all shadow-xs cursor-pointer"
                    >
                      📅 Book Tour
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Optional Side Chat Panel */}
      {selectedContact && (
        <div className="w-full lg:w-96 flex-shrink-0">
          <ChatPanel
            contact={selectedContact}
            onClose={() => setSelectedContact(null)}
            suggestedQuestions={[
              'Are you available for a heritage walk today?',
              'Do you speak English/French?',
              'Can you customize the itinerary for photography?',
              'What monuments do we cover on the half-day tour?',
            ]}
          />
        </div>
      )}

      {/* Interactive Booking Modal */}
      {bookingGuide && (
        <Modal
          isOpen={true}
          onClose={() => setBookingGuide(null)}
          title={`Book Guided Tour with ${bookingGuide.name}`}
          subtitle={`Speciality: ${bookingGuide.speciality} in ${bookingGuide.location}`}
          icon="🧑‍🤝‍🧑"
          maxWidth="lg"
        >
          <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
            <div className="bg-[#F7F6F2] p-3 rounded-xl border border-[#E4E7E5] flex items-center justify-between">
              <div>
                <p className="font-700 text-[#141B18] text-sm">{bookingGuide.name}</p>
                <p className="text-[#7B8582]">Rate: {bookingGuide.price} /{bookingGuide.priceUnit || 'day'}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-[#E4F7EC] text-[#1E9E5A] px-2 py-0.5 rounded-full font-700">
                  {bookingGuide.verified ? 'Verified Guide' : 'Community Guide'}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-700 text-[#141B18] mb-1">Tour Date *</label>
              <input
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E4E7E5] bg-white text-xs text-[#141B18] focus:outline-none focus:border-[#0F6E5C]"
              />
            </div>

            <div>
              <label className="block font-700 text-[#141B18] mb-1">Group Size *</label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-[#E4E7E5] bg-white text-xs text-[#141B18] focus:outline-none focus:border-[#0F6E5C]"
              >
                <option value="1">Solo Traveller (1 person)</option>
                <option value="2">Couple (2 people)</option>
                <option value="4">Small Group (3–4 people)</option>
                <option value="8">Large Group (5–8 people)</option>
              </select>
            </div>

            <div>
              <label className="block font-700 text-[#141B18] mb-1">Monuments & Focus of Interest</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Focus on architectural history, local bazaars, photography timing, avoid heavy stairs..."
                className="w-full h-20 p-3 rounded-xl border border-[#E4E7E5] bg-white text-xs text-[#141B18] focus:outline-none focus:border-[#0F6E5C]"
              />
            </div>

            <div className="pt-2 border-t border-[#E4E7E5] flex items-center justify-between gap-3">
              <div>
                <span className="text-[#7B8582] text-[11px] block">Tour Fee</span>
                <span className="font-800 text-sm text-[#0F6E5C]">
                  {bookingGuide.price}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBookingGuide(null)}
                  className="px-4 h-10 rounded-xl border border-[#E4E7E5] text-[#7B8582] font-700 text-xs hover:bg-[#F7F6F2] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="px-5 h-10 rounded-xl bg-[#0F6E5C] text-white font-700 text-xs hover:bg-[#0B5849] disabled:opacity-50 transition-all shadow-xs cursor-pointer"
                >
                  {isSubmittingBooking ? 'Submitting...' : 'Confirm Request →'}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
