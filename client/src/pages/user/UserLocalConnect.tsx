import { useState } from 'react'
import Homestays from './Homestays'
import Guides from './Guides'
import ArtsCrafts from './ArtsCrafts'
import MyBookings from './MyBookings'
import { useApp } from '../../context/AppContext'

type ConnectTab = 'homestays' | 'guides' | 'arts' | 'my-bookings'

export default function UserLocalConnect() {
  const [activeTab, setActiveTab] = useState<ConnectTab>('homestays')
  const { activeLocation, bookingRequests, currentUser } = useApp()

  const myBookingsCount = bookingRequests.filter((b) => {
    if (!currentUser) return true
    return b.userId === currentUser.id || (currentUser.name && b.userName === currentUser.name)
  }).length

  const tabs: { id: ConnectTab; label: string; icon: string; count?: number }[] = [
    { id: 'homestays', label: 'Local Homestays', icon: '🏠' },
    { id: 'guides', label: 'Local Guides', icon: '🧑‍🤝‍🧑' },
    { id: 'arts', label: 'Arts & Crafts', icon: '🎭' },
    { id: 'my-bookings', label: 'My Bookings', icon: '📅', count: myBookingsCount },
  ]

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-5">
      {/* Page title & Location context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-700 text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
              User–Local Connect
            </h2>
            <span className="text-[10px] bg-[#E4F3EF] text-[#0F6E5C] font-700 px-2.5 py-0.5 rounded-full border border-[#0F6E5C]/20">
              📍 {activeLocation.displayName}
            </span>
          </div>
          <p className="text-[#7B8582] text-xs md:text-sm mt-0.5">
            Discover verified local services — authentic homestays, licensed cultural guides, and regional handicrafts.
          </p>
        </div>
      </div>

      {/* Sub-nav Tabs */}
      <div className="flex gap-1.5 bg-white rounded-2xl p-1.5 shadow-[0_4px_20px_rgba(20,27,24,0.06)] border border-[#E4E7E5] w-fit overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-xl text-xs md:text-sm font-700 transition-all duration-200 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#0F6E5C] text-white shadow-xs'
                : 'text-[#7B8582] hover:text-[#141B18] hover:bg-[#F7F6F2]'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && tab.count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-800 ${
                  activeTab === tab.id ? 'bg-white text-[#0F6E5C]' : 'bg-[#E4F3EF] text-[#0F6E5C]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'homestays' && <Homestays onGoToBookings={() => setActiveTab('my-bookings')} />}
        {activeTab === 'guides' && <Guides onGoToBookings={() => setActiveTab('my-bookings')} />}
        {activeTab === 'arts' && <ArtsCrafts onGoToBookings={() => setActiveTab('my-bookings')} />}
        {activeTab === 'my-bookings' && <MyBookings onExploreHomestays={() => setActiveTab('homestays')} />}
      </div>
    </div>
  )
}
