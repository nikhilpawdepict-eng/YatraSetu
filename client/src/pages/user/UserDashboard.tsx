import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import Overview from './Overview'
import UserLocalConnect from './UserLocalConnect'
import CrowdPredictor from './CrowdPredictor'
import Cleanliness from './Cleanliness'
import Emergency from './Emergency'
import LocationSelectorModal from '../../components/LocationSelectorModal'

type UserTab = 'overview' | 'connect' | 'crowd' | 'cleanliness' | 'emergency'

const tabs: { id: UserTab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '🏠' },
  { id: 'connect', label: 'User–Local Connect', icon: '🤝' },
  { id: 'crowd', label: 'Crowd Predictor', icon: '👥' },
  { id: 'cleanliness', label: 'Cleanliness', icon: '🧹' },
  { id: 'emergency', label: 'Emergency', icon: '🚨' },
]

export default function UserDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<UserTab>('overview')
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const { activeLocation } = useApp()

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      {/* Top Nav */}
      <header className="bg-white border-b border-[#E4E7E5] sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-0 flex items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex items-center gap-2 py-3 flex-shrink-0">
            <span className="text-xl">🌍</span>
            <span className="font-700 text-lg text-[#0F6E5C]" style={{ fontFamily: 'Fraunces, serif' }}>
              YatraSetu
            </span>
          </div>

          {/* Destination Selector Pill */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E4F3EF] border border-[#0F6E5C]/30 text-[#0F6E5C] text-xs font-700 hover:bg-[#d5eee7] transition-all cursor-pointer shadow-2xs"
            title="Change active destination"
          >
            <span>📍</span>
            <span className="max-w-[140px] sm:max-w-[200px] truncate">{activeLocation.displayName}</span>
            <span className="text-[10px] text-[#0F6E5C]/70 font-normal">▼</span>
          </button>

          {/* Tabs */}
          <nav className="flex items-center overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 md:px-4 py-4 text-xs md:text-sm font-600 whitespace-nowrap border-b-2 transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#0F6E5C] text-[#0F6E5C]'
                    : 'border-transparent text-[#7B8582] hover:text-[#4B5551]'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#E4F3EF] flex items-center justify-center text-sm md:text-base">
              👤
            </div>
            <button
              onClick={onLogout}
              className="text-xs md:text-sm font-600 text-[#7B8582] hover:text-[#D64545] transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'connect' && <UserLocalConnect />}
        {activeTab === 'crowd' && <CrowdPredictor />}
        {activeTab === 'cleanliness' && <Cleanliness />}
        {activeTab === 'emergency' && <Emergency />}
      </main>

      {/* Destination Switcher Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  )
}
