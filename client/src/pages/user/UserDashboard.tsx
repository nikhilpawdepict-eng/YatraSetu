import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import Overview from './Overview'
import AIPlanner from './AIPlanner'
import UserLocalConnect from './UserLocalConnect'
import CrowdPredictor from './CrowdPredictor'
import Cleanliness from './Cleanliness'
import Emergency from './Emergency'
import CommunityFeed from './CommunityFeed'
import LocationSelectorModal from '../../components/LocationSelectorModal'
import CommunicationModal from '../../components/CommunicationModal'
import { MessageSquare, Sparkles, MapPin, LogOut } from 'lucide-react'

export type UserTab = 'overview' | 'planner' | 'connect' | 'crowd' | 'cleanliness' | 'emergency' | 'community'

const tabs: { id: UserTab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '🏠' },
  { id: 'planner', label: 'AI Planner', icon: '✨' },
  { id: 'connect', label: 'Local Connect', icon: '🤝' },
  { id: 'crowd', label: 'Crowd Predictor', icon: '👥' },
  { id: 'cleanliness', label: 'Cleanliness', icon: '🧹' },
  { id: 'emergency', label: 'Safety & SOS', icon: '🚨' },
  { id: 'community', label: 'Community & Gems', icon: '📸' },
]

interface Props {
  initialTab?: UserTab
  onLogout: () => void
}

export default function UserDashboard({ initialTab = 'overview', onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<UserTab>(initialTab)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isCommModalOpen, setIsCommModalOpen] = useState(false)
  const { activeLocation } = useApp()

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      {/* Top Nav */}
      <header className="bg-white border-b border-[#E4E7E5] sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-0 flex items-center justify-between gap-2">
          {/* Logo & Brand Tagline */}
          <div
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 py-3 flex-shrink-0 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0F6E5C] to-[#1E9E5A] flex items-center justify-center text-white text-base shadow-2xs">
              🌍
            </div>
            <div>
              <span className="font-800 text-lg text-[#0F6E5C] leading-none" style={{ fontFamily: 'Fraunces, serif' }}>
                YatraSetu
              </span>
              <span className="hidden sm:inline-block text-[10px] text-[#7B8582] font-600 ml-1.5 border-l border-[#E4E7E5] pl-1.5">
                Smart Grassroots Tourism Ecosystem
              </span>
            </div>
          </div>

          {/* Destination Selector Pill */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E4F3EF] border border-[#0F6E5C]/30 text-[#0F6E5C] text-xs font-700 hover:bg-[#d5eee7] transition-all cursor-pointer shadow-2xs"
            title="Change active destination"
          >
            <span>📍</span>
            <span className="max-w-[120px] sm:max-w-[180px] truncate">{activeLocation.displayName}</span>
            <span className="text-[10px] text-[#0F6E5C]/70 font-normal">▼</span>
          </button>

          {/* Tabs */}
          <nav className="flex items-center overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 md:px-3.5 py-4 text-xs md:text-sm font-700 whitespace-nowrap border-b-2 transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
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
            {/* Multi-Channel Quick Trigger Button with Live Indicator */}
            <button
              onClick={() => setIsCommModalOpen(true)}
              className="px-3 py-1.5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-800 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Open WhatsApp, Gmail & Phone SMS Dispatcher"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp / Email / SMS</span>
            </button>

            <div className="w-8 h-8 rounded-full bg-[#E4F3EF] flex items-center justify-center text-sm font-700 text-[#0F6E5C] border border-[#0F6E5C]/20">
              👤
            </div>

            <button
              onClick={onLogout}
              className="text-xs md:text-sm font-700 text-[#7B8582] hover:text-[#D64545] transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        {activeTab === 'overview' && <Overview onSelectTab={(tab) => setActiveTab(tab)} />}
        {activeTab === 'planner' && <AIPlanner />}
        {activeTab === 'connect' && <UserLocalConnect />}
        {activeTab === 'crowd' && <CrowdPredictor />}
        {activeTab === 'cleanliness' && <Cleanliness />}
        {activeTab === 'emergency' && <Emergency />}
        {activeTab === 'community' && <CommunityFeed />}
      </main>

      {/* Destination Switcher Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {/* Multi-Channel Quick Dispatcher Modal */}
      <CommunicationModal
        isOpen={isCommModalOpen}
        onClose={() => setIsCommModalOpen(false)}
        contextTitle="Quick Multi-Channel Dispatcher"
        defaultSubject={`Inquiry regarding travel in ${activeLocation.displayName}`}
        defaultMessage={`Namaste! I am currently planning travel experiences in ${activeLocation.displayName} through the YatraSetu platform.`}
      />
    </div>
  )
}
