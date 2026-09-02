import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import EmptyState from '../../components/ui/EmptyState'
import type { BookingRequest } from '../../data/mockStore'

interface MyBookingsProps {
  onExploreHomestays?: () => void
}

export default function MyBookings({ onExploreHomestays }: MyBookingsProps) {
  const { bookingRequests, currentUser } = useApp()
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [search, setSearch] = useState('')

  // Filter bookings for current logged-in tourist
  const myBookings = bookingRequests.filter((b) => {
    if (!currentUser) return true
    return b.userId === currentUser.id || (currentUser.name && b.userName === currentUser.name)
  })

  const filteredBookings = myBookings.filter((b) => {
    const matchStatus = filterStatus === 'All' || b.status.toLowerCase() === filterStatus.toLowerCase()
    const matchSearch =
      !search ||
      b.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      b.serviceType.toLowerCase().includes(search.toLowerCase()) ||
      b.date.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const getStatusBadge = (status: BookingRequest['status']) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-700 bg-[#E4F7EC] text-[#1E9E5A] border border-[#1E9E5A]/20">
            <span>✓</span> Booking Accepted
          </span>
        )
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-700 bg-[#FBE6E6] text-[#D64545] border border-[#D64545]/20">
            <span>✕</span> Booking Declined
          </span>
        )
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-700 bg-[#FBF1DA] text-[#D89A1C] border border-[#D89A1C]/20">
            <span>⏳</span> Awaiting Provider Response
          </span>
        )
    }
  }

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'Homestay':
        return '🏠'
      case 'Guide Tour':
        return '🧑‍🤝‍🧑'
      case 'Artisanal Craft':
        return '🎭'
      default:
        return '📋'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header bar / Stats & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#E4E7E5] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#7B8582]">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your bookings..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#E4E7E5] text-xs text-[#141B18] placeholder-[#7B8582] focus:outline-none focus:border-[#0F6E5C]"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-hide">
          {['All', 'Pending', 'Accepted', 'Declined'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-700 transition-all duration-150 whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-[#0F6E5C] text-white shadow-xs'
                  : 'bg-[#F7F6F2] text-[#7B8582] hover:text-[#141B18] hover:bg-[#ECEBE6]'
              }`}
            >
              {st}
              {st === 'All' && ` (${myBookings.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <EmptyState
          icon="📅"
          title="You don't have any bookings yet."
          description="Explore authentic local havelis, village homestays, and certified guides to request your first booking directly."
          actionLabel="Explore Homestays"
          onAction={onExploreHomestays}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white p-5 rounded-2xl border border-[#E4E7E5] shadow-xs hover:border-[#0F6E5C]/30 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Service Type & Status Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 bg-[#F7F6F2] px-2.5 py-1 rounded-lg text-xs font-700 text-[#4B5551]">
                    <span>{getServiceTypeIcon(booking.serviceType)}</span>
                    <span>{booking.serviceType}</span>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                {/* Service Name & Pricing */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3
                      className="font-700 text-base text-[#141B18] leading-snug"
                      style={{ fontFamily: 'Fraunces, serif' }}
                    >
                      {booking.serviceName}
                    </h3>
                    <p className="text-xs text-[#7B8582] mt-0.5">
                      Booked for {booking.userName}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-base font-800 text-[#0F6E5C]">
                      {booking.price}
                    </span>
                    <p className="text-[10px] text-[#7B8582]">Total Amount</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-[#F7F6F2] rounded-xl text-xs mb-3">
                  <div className="flex items-center gap-1.5 text-[#4B5551]">
                    <span>📅</span>
                    <div>
                      <p className="text-[10px] text-[#7B8582]">Dates</p>
                      <p className="font-600 truncate">{booking.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#4B5551]">
                    <span>👥</span>
                    <div>
                      <p className="text-[10px] text-[#7B8582]">Guests</p>
                      <p className="font-600">{booking.guests} Guest{booking.guests > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Note / Message */}
                {booking.message && (
                  <div className="p-3 bg-[#FAF9F5] border border-[#E4E7E5]/70 rounded-xl text-xs text-[#4B5551] mb-2">
                    <p className="text-[10px] text-[#7B8582] font-700 uppercase tracking-wide mb-0.5">
                      Your Note to Host
                    </p>
                    <p className="italic text-[#4B5551] line-clamp-2">"{booking.message}"</p>
                  </div>
                )}
              </div>

              {/* Footer Timestamp & Real-Time Sync Indicator */}
              <div className="pt-3 border-t border-[#E4E7E5] flex items-center justify-between text-[11px] text-[#7B8582]">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#0F6E5C] animate-pulse" />
                  <span>Live Server Sync</span>
                </div>
                <span>Requested {booking.createdAt || 'Recently'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
