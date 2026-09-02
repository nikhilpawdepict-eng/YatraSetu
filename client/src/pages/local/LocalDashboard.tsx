import { useState } from 'react'
import LocalProfile from './LocalProfile'
import LocalDetails from './LocalDetails'
import LocalChats from './LocalChats'

type LocalTab = 'profile' | 'details' | 'chats'

const tabs: { id: LocalTab; label: string; icon: string }[] = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'details', label: 'Details', icon: '📋' },
  { id: 'chats', label: 'Chats', icon: '💬' },
]

export default function LocalDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<LocalTab>('profile')

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      {/* Top Nav */}
      <header className="bg-white border-b border-[#E4E7E5] sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 py-0 flex items-center justify-between">
          <div className="flex items-center gap-2 py-3 flex-shrink-0">
            <span className="text-xl">🌍</span>
            <span className="font-700 text-lg text-[#0F6E5C]" style={{ fontFamily: 'Fraunces, serif' }}>
              YatraSetu
            </span>
            <span className="ml-2 text-xs bg-[#E4F3EF] text-[#0F6E5C] rounded-full px-2 py-0.5 font-600">
              Local Portal
            </span>
          </div>

          <nav className="flex items-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-sm font-600 whitespace-nowrap border-b-2 transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'border-[#0F6E5C] text-[#0F6E5C]'
                    : 'border-transparent text-[#7B8582] hover:text-[#4B5551]'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="relative p-2 rounded-lg hover:bg-[#F7F6F2] transition-colors">
              <span className="text-xl">🔔</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-[#E4F3EF] flex items-center justify-center text-base cursor-pointer">
              🏡
            </div>
            <button
              onClick={onLogout}
              className="text-sm font-600 text-[#7B8582] hover:text-[#D64545] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {activeTab === 'profile' && <LocalProfile />}
        {activeTab === 'details' && <LocalDetails />}
        {activeTab === 'chats' && <LocalChats />}
      </main>
    </div>
  )
}
