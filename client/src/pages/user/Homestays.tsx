import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import ChatPanel, { type ChatContact } from '../../components/ChatPanel'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { matchesDestination } from '../../services/locationService'
import type { HomestayListing } from '../../data/mockStore'

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

  // Filter homestays strictly by active destination
  const destinationStays = homestays.filter((h) => matchesDestination(h.location, activeLocation.city))

  const filtered = destinationStays.filter((h) => {
    const q = search.toLowerCase()
    return (
      !q ||
      h.name.toLowerCase().includes(q) ||
      h.location.toLowerCase().includes(q) ||
      h.description.toLowerCase().includes(q)
    )
  })

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
        serviceId: bookingHomestay.id,
        serviceName: bookingHomestay.name,
        serviceType: 'Homestay',
        userId: currentUser?.id || 'usr_tourist_demo',
        userName: currentUser?.name || 'Aarav Sharma',
        userLocation: currentUser?.location || activeLocation.displayName,
        userAvatar: currentUser?.avatar || '👤',
        date: bookingDate,
        guests: Number(guests),
        price: bookingHomestay.price,
        message: message.trim() || `Booking request for ${guests} guests on ${bookingDate}`,
      })

      setBookingHomestay(null)
      showToast(`Booking inquiry sent to ${bookingHomestay.hostName}!`, 'success')
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
      {/* Homestays Catalog */}
      <div className="flex-1 space-y-4">
        {/* Search & Filter bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E4E7E5] shadow-xs flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#7B8582]">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search homestays in ${activeLocation.city}...`}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#E4E7E5] text-xs text-[#141B18] placeholder-[#7B8582] focus:outline-none focus:border-[#0F6E5C]"
            />
          </div>
          <span className="text-xs font-700 text-[#0F6E5C] bg-[#E4F3EF] px-3 py-2 rounded-xl whitespace-nowrap">
            {filtered.length} {filtered.length === 1 ? 'Stay' : 'Stays'} in {activeLocation.city}
          </span>
        </div>

        {/* Listings Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="🏠"
            title={`No Verified Homestays in ${activeLocation.city} Yet`}
            description={`No community homestay hosts have completed digital onboarding in ${activeLocation.displayName} yet. As local families join YatraSetu, their verified havelis and guest rooms will appear here.`}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((h) => (
              <div
                key={h.id}
                className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(20,27,24,0.06)] overflow-hidden border border-[#E4E7E5] hover:shadow-[0_8px_28px_rgba(20,27,24,0.10)] hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-[#EDEBE5]">
                    <img
                      src={h.image}
                      alt={h.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-[10px] font-700 px-2.5 py-1 rounded-full shadow-xs ${
                          h.available ? 'bg-[#E4F7EC] text-[#1E9E5A]' : 'bg-[#FBE6E6] text-[#D64545]'
                        }`}
                      >
                        {h.available ? '● Available' : '● Booked Out'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-700 text-[#141B18] text-base" style={{ fontFamily: 'Fraunces, serif' }}>
                        {h.name}
                      </h3>
                      <div className="flex items-center gap-1 bg-[#FBF1DA] text-[#D89A1C] px-2 py-0.5 rounded-full text-xs font-700 flex-shrink-0">
                        <span>★</span>
                        <span>{h.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#7B8582]">📍 {h.location}</p>
                    <p className="text-xs text-[#4B5551] leading-relaxed line-clamp-2">{h.description}</p>

                    {/* Facilities */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {h.facilities.slice(0, 4).map((f) => (
                        <span
                          key={f}
                          className="text-[10px] bg-[#F7F6F2] text-[#4B5551] rounded-full px-2 py-0.5 border border-[#E4E7E5]"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Host row & Action Buttons */}
                <div className="p-4 pt-2 border-t border-[#E4E7E5] flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-[#7B8582] block">Price per night</span>
                    <span className="text-base font-800 text-[#0F6E5C]">{h.price}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleChat(h)}
                      className="h-9 px-3 rounded-xl border border-[#0F6E5C]/30 text-[#0F6E5C] hover:bg-[#E4F3EF] text-xs font-700 transition-all cursor-pointer"
                    >
                      💬 Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenBooking(h)}
                      disabled={!h.available}
                      className="h-9 px-4 rounded-xl bg-[#0F6E5C] text-white hover:bg-[#0B5849] disabled:opacity-50 text-xs font-700 transition-all shadow-xs cursor-pointer"
                    >
                      📅 Book Stay
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
              'Are meals included in the stay?',
              'Is parking space available?',
              'Can you arrange traditional cultural dinner?',
              'What are check-in and check-out times?',
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
            <div className="bg-[#F7F6F2] p-3 rounded-xl border border-[#E4E7E5] flex items-center justify-between">
              <div>
                <p className="font-700 text-[#141B18] text-sm">{bookingHomestay.name}</p>
                <p className="text-[#7B8582]">Rate: {bookingHomestay.price} / night</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-[#E4F7EC] text-[#1E9E5A] px-2 py-0.5 rounded-full font-700">
                  Verified Host
                </span>
              </div>
            </div>

            <div>
              <label className="block font-700 text-[#141B18] mb-1">Check-in Date *</label>
              <input
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E4E7E5] bg-white text-xs text-[#141B18] focus:outline-none focus:border-[#0F6E5C]"
              />
            </div>

            <div>
              <label className="block font-700 text-[#141B18] mb-1">Number of Guests *</label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-[#E4E7E5] bg-white text-xs text-[#141B18] focus:outline-none focus:border-[#0F6E5C]"
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests (Standard)</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests (Family Suite)</option>
                <option value="5">5+ Guests</option>
              </select>
            </div>

            <div>
              <label className="block font-700 text-[#141B18] mb-1">Message / Special Requests for Host</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Arriving around 3 PM, request pure vegetarian dinner and heritage haveli tour guidance..."
                className="w-full h-20 p-3 rounded-xl border border-[#E4E7E5] bg-white text-xs text-[#141B18] focus:outline-none focus:border-[#0F6E5C]"
              />
            </div>

            <div className="pt-2 border-t border-[#E4E7E5] flex items-center justify-between gap-3">
              <div>
                <span className="text-[#7B8582] text-[11px] block">Estimated Total</span>
                <span className="font-800 text-sm text-[#0F6E5C]">
                  {bookingHomestay.price}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBookingHomestay(null)}
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
